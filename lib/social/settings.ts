/**
 * Operator settings that must not live in the repo (it is public) and
 * are annoying to put in Vercel env (dashboard + redeploy): stock-media
 * API keys, pasted once into /admin/media.
 *
 * Stored in a PRIVATE Supabase bucket — the media bucket (`ig-media`)
 * is public by design, so secrets get their own bucket that only the
 * service role can read. Environment variables still win when set, so
 * an operator who prefers Vercel env loses nothing.
 *
 * Never log or return key material: the admin GET reports only
 * "configured / not configured".
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

const BUCKET = 'ig-private';
const PATH = 'settings.json';

export interface OperatorSettings {
  pexelsApiKey?: string;
  pixabayApiKey?: string;
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

export async function writeSettings(
  patch: OperatorSettings,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  const admin = createSupabaseAdmin();
  await admin.storage.createBucket(BUCKET, { public: false }).catch(() => {});
  // createBucket's "already exists" error is swallowed above, so VERIFY:
  // if the bucket somehow exists as public (manual creation, console
  // default), key material would be world-readable at a predictable URL.
  // Force it private; refuse to store secrets if that cannot be proven.
  try {
    const { data: bucket } = await admin.storage.getBucket(BUCKET);
    if (!bucket) return { ok: false, reason: 'bucket_unverifiable' };
    if (bucket.public) {
      const { error } = await admin.storage.updateBucket(BUCKET, { public: false });
      if (error) return { ok: false, reason: 'bucket_public_unfixable' };
    }
  } catch {
    return { ok: false, reason: 'bucket_unverifiable' };
  }
  const current = await readSettings();
  const next: OperatorSettings = { ...current };
  // Only overwrite fields the patch actually provides (empty string clears).
  for (const key of ['pexelsApiKey', 'pixabayApiKey'] as const) {
    const v = patch[key];
    if (v === undefined) continue;
    if (v === '') delete next[key];
    else next[key] = v;
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
