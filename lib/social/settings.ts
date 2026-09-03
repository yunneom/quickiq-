/**
 * Operator settings that must not live in the repo (it is public) and
 * are annoying to put in Vercel env (dashboard + redeploy): stock-media
 * API keys and cross-post platform OAuth tokens, both set once from
 * /admin/media.
 *
 * Stored in a PRIVATE Supabase bucket — the media bucket (`ig-media`)
 * is public by design, so secrets get their own bucket that only the
 * service role can read. Environment variables still win for the stock
 * keys when set, so an operator who prefers Vercel env loses nothing.
 *
 * Never log or return token/key material: admin GETs report only
 * "configured / not configured" plus non-secret identifiers (channel
 * name, open_id) useful for confirming the right account is connected.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

const BUCKET = 'ig-private';
const PATH = 'settings.json';

/** A platform's OAuth grant — enough to refresh and to call its API. */
export interface OAuthTokenSet {
  accessToken: string;
  refreshToken?: string;
  /** Epoch ms; undefined means "treat as expired, refresh before use". */
  expiresAt?: number;
}

export interface TikTokTokens extends OAuthTokenSet {
  openId: string;
}

export interface YouTubeTokens extends OAuthTokenSet {
  channelId?: string;
  channelTitle?: string;
}

export interface ThreadsTokens extends OAuthTokenSet {
  userId: string;
  username?: string;
}

export interface OperatorSettings {
  pexelsApiKey?: string;
  pixabayApiKey?: string;
  /** Google AI Studio key used to generate mural wall photos. */
  geminiApiKey?: string;
  tiktok?: TikTokTokens;
  youtube?: YouTubeTokens;
  threads?: ThreadsTokens;
}

export async function readSettings(): Promise<OperatorSettings> {
  if (!isSupabaseConfigured()) return {};
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(PATH);
    if (error || !data) return {};
    return JSON.parse(await data.text()) as OperatorSettings;
  } catch {
    return {};
  }
}

async function ensurePrivateBucket(
  admin: ReturnType<typeof createSupabaseAdmin>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  // createBucket's "already exists" error is swallowed above, so VERIFY:
  // if the bucket somehow exists as public (manual creation, console
  // default), token/key material would be world-readable at a
  // predictable URL. Force it private; refuse to store secrets if that
  // cannot be proven.
  try {
    const { data: bucket } = await admin.storage.getBucket(BUCKET);
    if (!bucket) return { ok: false, reason: 'bucket_unverifiable' };
    if (bucket.public) {
      const { error } = await admin.storage.updateBucket(BUCKET, { public: false });
      if (error) return { ok: false, reason: 'bucket_public_unfixable' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'bucket_unverifiable' };
  }
}

/**
 * Patch settings. Top-level keys are shallow-merged; an explicit `null`
 * (not `undefined`) deletes a key — lets callers clear a stored value
 * (e.g. an empty-string API key input, or "disconnect" for a platform)
 * without needing a separate delete method.
 */
export async function writeSettings(
  patch: Partial<Record<keyof OperatorSettings, unknown>>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  const admin = createSupabaseAdmin();
  const ready = await ensurePrivateBucket(admin);
  if (!ready.ok) return ready;

  const current = await readSettings();
  const next: Record<string, unknown> = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    if (value === null || value === '') delete next[key];
    else next[key] = value;
  }

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(PATH, Buffer.from(JSON.stringify(next)), {
      contentType: 'application/json',
      upsert: true,
    });
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/**
 * Effective stock-API keys: environment first (explicit operator intent,
 * survives bucket loss), then the stored settings.
 */
export async function getStockKeys(): Promise<{
  pexels?: string;
  pixabay?: string;
}> {
  const envPexels = process.env.PEXELS_API_KEY?.trim();
  const envPixabay = process.env.PIXABAY_API_KEY?.trim();
  if (envPexels && envPixabay) {
    return { pexels: envPexels, pixabay: envPixabay };
  }
  const stored = await readSettings();
  return {
    pexels: envPexels || stored.pexelsApiKey?.trim() || undefined,
    pixabay: envPixabay || stored.pixabayApiKey?.trim() || undefined,
  };
}

/**
 * Effective Gemini key: environment first, then the value pasted into
 * /admin/media. Never returned to the browser — only a boolean.
 */
export async function getGeminiKey(): Promise<string | undefined> {
  const env = process.env.GEMINI_API_KEY?.trim();
  if (env) return env;
  return (await readSettings()).geminiApiKey?.trim() || undefined;
}

export async function getTikTokTokens(): Promise<TikTokTokens | undefined> {
  return (await readSettings()).tiktok;
}

export async function saveTikTokTokens(tokens: TikTokTokens): Promise<void> {
  await writeSettings({ tiktok: tokens });
}

export async function getYouTubeTokens(): Promise<YouTubeTokens | undefined> {
  return (await readSettings()).youtube;
}

export async function saveYouTubeTokens(tokens: YouTubeTokens): Promise<void> {
  await writeSettings({ youtube: tokens });
}

export async function getThreadsTokens(): Promise<ThreadsTokens | undefined> {
  return (await readSettings()).threads;
}

export async function saveThreadsTokens(tokens: ThreadsTokens): Promise<void> {
  await writeSettings({ threads: tokens });
}
