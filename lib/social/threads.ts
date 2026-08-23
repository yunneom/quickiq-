/**
 * Threads API (Meta) — publish the same reel as a Threads post.
 *
 * Setup the operator must do once, outside this codebase:
 *   1. developers.facebook.com → the SAME Meta app already used for
 *      Instagram (or a new one) → Add Product → "Threads API".
 *   2. Under Threads API → Settings, add this deployment's
 *      /api/auth/threads/callback as an OAuth redirect URI, and add the
 *      operator's own Threads account as a tester (Threads API apps stay
 *      in development mode — same "no review needed for our own
 *      account" situation as Instagram — until public reach is wanted).
 *   3. Copy the app's App ID / App Secret into Vercel as
 *      THREADS_APP_ID / THREADS_APP_SECRET. These are the Meta APP's
 *      credentials, not a per-post secret — same app can also run the
 *      existing Instagram integration.
 *   4. In /admin/media, click "Connect Threads" — one-time OAuth consent
 *      as the operator's own Threads account. Tokens are stored via
 *      lib/social/settings.ts, not env vars (per-account, refreshed
 *      automatically).
 *
 * Flow mirrors Instagram's Graph API exactly (same company, same shape):
 *   1. POST /{threads_user_id}/threads        → creation_id (container)
 *   2. wait for the container to finish ingesting (poll ?fields=status)
 *   3. POST /{threads_user_id}/threads_publish → published post id
 */

import { getThreadsTokens, saveThreadsTokens, type ThreadsTokens } from './settings';

const AUTH_BASE = 'https://threads.net/oauth/authorize';
const TOKEN_URL = 'https://graph.threads.net/oauth/access_token';
const LONG_LIVED_URL = 'https://graph.threads.net/access_token';
const REFRESH_URL = 'https://graph.threads.net/refresh_access_token';
const GRAPH = 'https://graph.threads.net/v1.0';

export function isThreadsAppConfigured(): boolean {
  return Boolean(process.env.THREADS_APP_ID?.trim() && process.env.THREADS_APP_SECRET?.trim());
}

export function buildThreadsAuthorizeUrl(redirectUri: string, state: string): string {
  const url = new URL(AUTH_BASE);
  url.searchParams.set('client_id', process.env.THREADS_APP_ID!.trim());
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'threads_basic,threads_content_publish');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  return url.toString();
}

type TokenResult =
  | { ok: true; data: ThreadsTokens }
  | { ok: false; reason: string };

interface RawTokenResponse {
  access_token?: string;
  expires_in?: number;
  user_id?: string;
  error_message?: string;
  error?: unknown;
}

/**
 * Short-lived code → short-lived token → long-lived token (60d) → user
 * identity, in one shot. Mirrors Instagram's own long-lived-token dance;
 * Threads uses the same pattern under a different host.
 */
export async function exchangeThreadsCode(code: string, redirectUri: string): Promise<TokenResult> {
  let shortLived: RawTokenResponse;
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.THREADS_APP_ID?.trim() ?? '',
        client_secret: process.env.THREADS_APP_SECRET?.trim() ?? '',
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    shortLived = (await res.json().catch(() => ({}))) as RawTokenResponse;
    if (!res.ok || !shortLived.access_token || !shortLived.user_id) {
      return { ok: false, reason: shortLived.error_message ?? `http_${res.status}` };
    }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }

  const longLived = await exchangeForLongLivedToken(shortLived.access_token);
  if (!longLived.ok) return longLived;

  let username: string | undefined;
  try {
    const res = await fetch(
      `${GRAPH}/me?fields=username&access_token=${longLived.token}`,
      { cache: 'no-store', signal: AbortSignal.timeout(10_000) },
    );
    const raw = (await res.json().catch(() => ({}))) as { username?: string };
    username = raw.username;
  } catch {
    // Identity lookup is cosmetic only — never blocks the connect flow.
  }

  return {
    ok: true,
    data: {
      accessToken: longLived.token,
      expiresAt: longLived.expiresAt,
      userId: shortLived.user_id,
      username,
    },
  };
}

async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ ok: true; token: string; expiresAt: number } | { ok: false; reason: string }> {
  try {
    const url = new URL(LONG_LIVED_URL);
    url.searchParams.set('grant_type', 'th_exchange_token');
    url.searchParams.set('client_secret', process.env.THREADS_APP_SECRET?.trim() ?? '');
    url.searchParams.set('access_token', shortLivedToken);
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    const raw = (await res.json().catch(() => ({}))) as RawTokenResponse;
    if (!res.ok || !raw.access_token) {
      return { ok: false, reason: raw.error_message ?? `http_${res.status}` };
    }
    return {
      ok: true,
      token: raw.access_token,
      expiresAt: Date.now() + (raw.expires_in ?? 60 * 24 * 3600) * 1000,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

async function refreshThreadsToken(
  accessToken: string,
): Promise<{ ok: true; token: string; expiresAt: number } | { ok: false; reason: string }> {
  try {
    const url = new URL(REFRESH_URL);
    url.searchParams.set('grant_type', 'th_refresh_token');
    url.searchParams.set('access_token', accessToken);
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    const raw = (await res.json().catch(() => ({}))) as RawTokenResponse;
    if (!res.ok || !raw.access_token) {
      return { ok: false, reason: raw.error_message ?? `http_${res.status}` };
    }
    return {
      ok: true,
      token: raw.access_token,
      expiresAt: Date.now() + (raw.expires_in ?? 60 * 24 * 3600) * 1000,
    };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

async function getValidAccessToken(): Promise<
  { ok: true; token: string; userId: string } | { ok: false; reason: string }
> {
  const stored = await getThreadsTokens();
  if (!stored) return { ok: false, reason: 'threads_not_connected' };

  // Threads refresh tokens can only be exchanged once they're >24h old —
  // refreshing well before the 60d expiry (a 10-day margin) keeps every
  // refresh call inside that window instead of racing the cutoff.
  const freshEnough = stored.expiresAt && stored.expiresAt - Date.now() > 10 * 24 * 3600 * 1000;
  if (freshEnough) return { ok: true, token: stored.accessToken, userId: stored.userId };

  const refreshed = await refreshThreadsToken(stored.accessToken);
  if (!refreshed.ok) {
    // Not yet 24h old is a soft failure — the current token still works.
    return { ok: true, token: stored.accessToken, userId: stored.userId };
  }
  await saveThreadsTokens({ ...stored, accessToken: refreshed.token, expiresAt: refreshed.expiresAt });
  return { ok: true, token: refreshed.token, userId: stored.userId };
}

export type PublishResult = { ok: true; postId: string } | { ok: false; reason: string };

/** Poll a Threads container until it finishes ingesting the video. */
async function waitForThreadsContainer(
  containerId: string,
  token: string,
  deadlineAt: number,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  for (let i = 0; i < 30 && Date.now() < deadlineAt; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const res = await fetch(
        `${GRAPH}/${containerId}?fields=status,error_message&access_token=${token}`,
        { cache: 'no-store', signal: AbortSignal.timeout(15_000) },
      );
      const raw = (await res.json().catch(() => ({}))) as {
        status?: string;
        error_message?: string;
      };
      if (raw.status === 'FINISHED') return { ok: true };
      if (raw.status === 'ERROR') return { ok: false, reason: raw.error_message ?? 'container_error' };
      // IN_PROGRESS / EXPIRED-not-yet — keep polling.
    } catch {
      // Transient poll error — try again next loop.
    }
  }
  return { ok: false, reason: 'container_timeout' };
}

/**
 * Publish a reel already sitting at a public HTTPS URL (our own storage —
 * Threads' servers fetch it directly, same PULL model as Instagram).
 */
export async function publishVideoToThreads(args: {
  videoUrl: string;
  text: string;
  deadlineAt?: number;
}): Promise<PublishResult> {
  const auth = await getValidAccessToken();
  if (!auth.ok) return { ok: false, reason: auth.reason };

  const deadline = args.deadlineAt ?? Date.now() + 90_000;
  const timeout = Math.min(30_000, Math.max(1_000, deadline - Date.now()));

  let createRes: Response;
  try {
    const body = new URLSearchParams({
      media_type: 'VIDEO',
      video_url: args.videoUrl,
      text: args.text.slice(0, 500),
      access_token: auth.token,
    });
    createRes = await fetch(`${GRAPH}/${auth.userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout),
    });
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
  const created = (await createRes.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string };
  };
  if (!createRes.ok || created.error || !created.id) {
    return { ok: false, reason: created.error?.message ?? `create_http_${createRes.status}` };
  }

  const ready = await waitForThreadsContainer(created.id, auth.token, deadline - 10_000);
  if (!ready.ok) return { ok: false, reason: `wait:${ready.reason}` };

  try {
    const publishRes = await fetch(`${GRAPH}/${auth.userId}/threads_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ creation_id: created.id, access_token: auth.token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(Math.min(20_000, Math.max(1_000, deadline - Date.now()))),
    });
    const published = (await publishRes.json().catch(() => ({}))) as {
      id?: string;
      error?: { message?: string };
    };
    if (!publishRes.ok || published.error || !published.id) {
      return { ok: false, reason: `publish:${published.error?.message ?? `http_${publishRes.status}`}` };
    }
    return { ok: true, postId: published.id };
  } catch (err) {
    return { ok: false, reason: `publish:${err instanceof Error ? err.message : 'fetch_failed'}` };
  }
}
