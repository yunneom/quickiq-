/**
 * TikTok Content Posting API (Direct Post, PULL_FROM_URL variant).
 *
 * Setup the operator must do once, outside this codebase (no way to
 * automate account creation — it needs their own TikTok login):
 *   1. developers.tiktok.com → create an app → add the
 *      "Content Posting API" product.
 *   2. Under that product's settings, add & verify this deployment's
 *      domain — PULL_FROM_URL requires the video_url's domain to be
 *      verified in the TikTok Developer Portal, or every post init call
 *      is rejected outright.
 *   3. Copy the app's Client Key / Client Secret into Vercel as
 *      TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET.
 *   4. In /admin/media, click "Connect TikTok" — one-time OAuth consent
 *      as the operator's own TikTok account. The resulting tokens are
 *      stored via lib/social/settings.ts, not env vars, since they're
 *      per-account (not per-app) and must be refreshed automatically.
 *
 * ⚠ Unaudited apps: TikTok restricts newly-created, not-yet-reviewed
 * apps to `privacy_level: SELF_ONLY` — posts land as private, visible
 * only to the connected account, until TikTok approves the app for
 * public posting (their review, not something this code controls). A
 * PUBLIC_TO_EVERYONE attempt on an unaudited app fails with a scope
 * error, surfaced verbatim in the status notes so the operator knows
 * to check their app's review status rather than assume a code bug.
 */

import { getTikTokTokens, saveTikTokTokens, type TikTokTokens } from './settings';

const AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const API_BASE = 'https://open.tiktokapis.com/v2';

export function isTikTokAppConfigured(): boolean {
  return Boolean(process.env.TIKTOK_CLIENT_KEY?.trim() && process.env.TIKTOK_CLIENT_SECRET?.trim());
}

export function buildTikTokAuthorizeUrl(redirectUri: string, state: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY!.trim();
  const url = new URL(AUTH_BASE);
  url.searchParams.set('client_key', clientKey);
  url.searchParams.set('scope', 'user.info.basic,video.publish');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

type TokenResult =
  | { ok: true; data: TikTokTokens }
  | { ok: false; reason: string };

interface RawTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  error?: string;
  error_description?: string;
}

async function requestToken(body: Record<string, string>): Promise<TokenResult> {
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY?.trim() ?? '',
        client_secret: process.env.TIKTOK_CLIENT_SECRET?.trim() ?? '',
        ...body,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    const raw = (await res.json().catch(() => ({}))) as RawTokenResponse;
    if (!res.ok || raw.error || !raw.access_token || !raw.open_id) {
      return {
        ok: false,
        reason: raw.error_description ?? raw.error ?? `http_${res.status}`,
      };
    }
    return {
      ok: true,
      data: {
        accessToken: raw.access_token,
        refreshToken: raw.refresh_token,
        expiresAt: raw.expires_in ? Date.now() + raw.expires_in * 1000 : undefined,
        openId: raw.open_id,
      },
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

export async function exchangeTikTokCode(code: string, redirectUri: string): Promise<TokenResult> {
  return requestToken({ code, grant_type: 'authorization_code', redirect_uri: redirectUri });
}

async function refreshTikTokTokens(refreshToken: string): Promise<TokenResult> {
  return requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

/** A valid access token, refreshing and persisting first if the stored one is stale/near expiry. */
async function getValidAccessToken(): Promise<{ ok: true; token: string } | { ok: false; reason: string }> {
  const stored = await getTikTokTokens();
  if (!stored) return { ok: false, reason: 'tiktok_not_connected' };

  const freshEnough = stored.expiresAt && stored.expiresAt - Date.now() > 5 * 60 * 1000;
  if (freshEnough) return { ok: true, token: stored.accessToken };

  if (!stored.refreshToken) {
    return { ok: false, reason: 'tiktok_token_expired_no_refresh' };
  }
  const refreshed = await refreshTikTokTokens(stored.refreshToken);
  if (!refreshed.ok) return { ok: false, reason: `refresh_failed: ${refreshed.reason}` };
  await saveTikTokTokens(refreshed.data);
  return { ok: true, token: refreshed.data.accessToken };
}

export type PublishResult =
  | { ok: true; publishId: string }
  | { ok: false; reason: string };

/**
 * Publish a reel already sitting at a public HTTPS URL (our own storage
 * — TikTok's servers fetch it directly, PULL_FROM_URL, no bytes flow
 * through this function).
 */
export async function publishVideoToTikTok(args: {
  videoUrl: string;
  title: string;
  deadlineAt?: number;
}): Promise<PublishResult> {
  const auth = await getValidAccessToken();
  if (!auth.ok) return { ok: false, reason: auth.reason };

  const timeout = args.deadlineAt
    ? Math.min(30_000, Math.max(1_000, args.deadlineAt - Date.now()))
    : 20_000;

  let initRes: Response;
  try {
    initRes = await fetch(`${API_BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: args.title.slice(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: args.videoUrl,
        },
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout),
    });
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }

  const raw = (await initRes.json().catch(() => ({}))) as {
    data?: { publish_id?: string };
    error?: { code?: string; message?: string };
  };
  if (!initRes.ok || raw.error?.code) {
    return {
      ok: false,
      reason: raw.error?.message ?? raw.error?.code ?? `http_${initRes.status}`,
    };
  }
  const publishId = raw.data?.publish_id;
  if (!publishId) return { ok: false, reason: 'no_publish_id' };

  // TikTok processes PULL_FROM_URL asynchronously — poll status/fetch
  // briefly so a same-request failure (e.g. domain not verified) is
  // caught here instead of silently vanishing.
  const pollDeadline = args.deadlineAt ?? Date.now() + 60_000;
  for (let attempt = 0; attempt < 10 && Date.now() < pollDeadline; attempt++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const statusRes = await fetch(`${API_BASE}/post/publish/status/fetch/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ publish_id: publishId }),
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      });
      const status = (await statusRes.json().catch(() => ({}))) as {
        data?: { status?: string; fail_reason?: string };
      };
      const code = status.data?.status;
      if (code === 'PUBLISH_COMPLETE') return { ok: true, publishId };
      if (code === 'FAILED') {
        return { ok: false, reason: status.data?.fail_reason ?? 'publish_failed' };
      }
      // PROCESSING_UPLOAD / PROCESSING_DOWNLOAD — keep polling.
    } catch {
      // Transient poll error — try again next loop.
    }
  }
  // Still processing when we ran out of budget: not a failure, TikTok
  // continues in the background. Report the id so it's traceable.
  return { ok: true, publishId };
}
