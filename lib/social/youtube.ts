/**
 * YouTube Data API v3 — upload reels as Shorts.
 *
 * Setup the operator must do once, outside this codebase:
 *   1. console.cloud.google.com → new project → enable "YouTube Data
 *      API v3" → OAuth consent screen (External, can stay in "Testing"
 *      since only the operator's own channel ever authorizes — no
 *      Google verification review needed for that) → OAuth client
 *      (type: Web application) with this deployment's
 *      /api/auth/youtube/callback as an authorized redirect URI.
 *   2. Add the operator's own Google account as a test user on the
 *      consent screen (required while the app is in Testing mode).
 *   3. Copy the OAuth client's ID/secret into Vercel as
 *      YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET.
 *   4. In /admin/media, click "Connect YouTube" — one-time consent as
 *      the operator's own channel.
 *
 * A vertical, ≤3-minute upload is automatically eligible for the
 * Shorts shelf — our reels (1080×1920, 30s) qualify without any special
 * upload flag; "#Shorts" in the title/description just improves the
 * odds of the Shorts surface picking it up quickly.
 *
 * Quota: a video insert costs 1600 units against the default 10,000/day
 * project quota — comfortably above our 2-3 posts/day.
 */

import { getYouTubeTokens, saveYouTubeTokens, type YouTubeTokens } from './settings';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';
const CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true';

export function isYouTubeAppConfigured(): boolean {
  return Boolean(process.env.YOUTUBE_CLIENT_ID?.trim() && process.env.YOUTUBE_CLIENT_SECRET?.trim());
}

export function buildYouTubeAuthorizeUrl(redirectUri: string, state: string): string {
  const url = new URL(AUTH_BASE);
  url.searchParams.set('client_id', process.env.YOUTUBE_CLIENT_ID!.trim());
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload');
  // offline + consent guarantees a refresh_token even on a re-consent.
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  return url.toString();
}

type TokenResult =
  | { ok: true; data: YouTubeTokens }
  | { ok: false; reason: string };

interface RawTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function requestToken(body: Record<string, string>): Promise<TokenResult> {
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.YOUTUBE_CLIENT_ID?.trim() ?? '',
        client_secret: process.env.YOUTUBE_CLIENT_SECRET?.trim() ?? '',
        ...body,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    const raw = (await res.json().catch(() => ({}))) as RawTokenResponse;
    if (!res.ok || raw.error || !raw.access_token) {
      return { ok: false, reason: raw.error_description ?? raw.error ?? `http_${res.status}` };
    }
    return {
      ok: true,
      data: {
        accessToken: raw.access_token,
        // A refresh grant doesn't always return a new refresh_token —
        // callers must merge onto the previously stored one.
        refreshToken: raw.refresh_token,
        expiresAt: raw.expires_in ? Date.now() + raw.expires_in * 1000 : undefined,
      },
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

export async function exchangeYouTubeCode(
  code: string,
  redirectUri: string,
): Promise<TokenResult> {
  const result = await requestToken({
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  if (!result.ok) return result;

  // Best-effort channel identity — purely cosmetic (shown in the admin
  // UI so the operator can confirm the right channel connected), never
  // blocks the connect flow if it fails.
  try {
    const res = await fetch(CHANNELS_URL, {
      headers: { Authorization: `Bearer ${result.data.accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
    const raw = (await res.json().catch(() => ({}))) as {
      items?: Array<{ id?: string; snippet?: { title?: string } }>;
    };
    const channel = raw.items?.[0];
    if (channel) {
      result.data.channelId = channel.id;
      result.data.channelTitle = channel.snippet?.title;
    }
  } catch {
    // Identity lookup is cosmetic only.
  }
  return result;
}

async function refreshYouTubeTokens(refreshToken: string): Promise<TokenResult> {
  return requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

async function getValidAccessToken(): Promise<{ ok: true; token: string } | { ok: false; reason: string }> {
  const stored = await getYouTubeTokens();
  if (!stored) return { ok: false, reason: 'youtube_not_connected' };

  const freshEnough = stored.expiresAt && stored.expiresAt - Date.now() > 5 * 60 * 1000;
  if (freshEnough) return { ok: true, token: stored.accessToken };

  if (!stored.refreshToken) return { ok: false, reason: 'youtube_token_expired_no_refresh' };
  const refreshed = await refreshYouTubeTokens(stored.refreshToken);
  if (!refreshed.ok) return { ok: false, reason: `refresh_failed: ${refreshed.reason}` };
  // Google often omits refresh_token on a refresh response — keep the one we had.
  await saveYouTubeTokens({
    ...stored,
    accessToken: refreshed.data.accessToken,
    refreshToken: refreshed.data.refreshToken ?? stored.refreshToken,
    expiresAt: refreshed.data.expiresAt,
  });
  return { ok: true, token: refreshed.data.accessToken };
}

export type UploadResult = { ok: true; videoId: string } | { ok: false; reason: string };

/**
 * Upload a reel's raw bytes (already in memory from the IG publish
 * step — no extra download) as an unlisted-by-default-safe public
 * Short.
 */
export async function uploadYouTubeShort(args: {
  video: Buffer;
  title: string;
  description: string;
  deadlineAt?: number;
}): Promise<UploadResult> {
  const auth = await getValidAccessToken();
  if (!auth.ok) return { ok: false, reason: auth.reason };

  const timeout = args.deadlineAt
    ? Math.min(30_000, Math.max(1_000, args.deadlineAt - Date.now()))
    : 20_000;

  let initRes: Response;
  try {
    initRes = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(args.video.length),
      },
      body: JSON.stringify({
        snippet: {
          title: args.title.slice(0, 100),
          description: args.description.slice(0, 5000),
          categoryId: '24', // Entertainment
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout),
    });
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
  if (!initRes.ok) {
    const body = await initRes.text().catch(() => '');
    return { ok: false, reason: `init_http_${initRes.status}: ${body.slice(0, 200)}` };
  }
  const uploadSessionUrl = initRes.headers.get('location');
  if (!uploadSessionUrl) return { ok: false, reason: 'no_upload_session_url' };

  const uploadTimeout = args.deadlineAt
    ? Math.min(60_000, Math.max(5_000, args.deadlineAt - Date.now()))
    : 45_000;
  try {
    const putRes = await fetch(uploadSessionUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(args.video.length),
      },
      // Node's fetch (undici) accepts a Buffer as the body at runtime —
      // this is purely a type-checker gap: @types/node's Buffer declares
      // `.buffer: ArrayBufferLike` (ArrayBuffer | SharedArrayBuffer)
      // while newer lib.dom's BlobPart/ArrayBufferView require the
      // narrower `ArrayBuffer`, and no wrapper (Uint8Array.from, Blob)
      // resolves the mismatch without an extra copy of the whole video.
      body: args.video as unknown as BodyInit,
      signal: AbortSignal.timeout(uploadTimeout),
    });
    const raw = (await putRes.json().catch(() => ({}))) as {
      id?: string;
      error?: { message?: string };
    };
    if (!putRes.ok || !raw.id) {
      return { ok: false, reason: raw.error?.message ?? `upload_http_${putRes.status}` };
    }
    return { ok: true, videoId: raw.id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'upload_failed' };
  }
}
