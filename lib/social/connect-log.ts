/**
 * What happened on the last "Connect" attempt for each cross-post
 * platform — recorded server-side at the moment the OAuth callback runs.
 *
 * Why this exists: the callbacks report their result only in the redirect
 * URL (?threads=error&reason=...), and /admin/media shows it once and
 * scrubs the URL. If the browser had no saved admin token — the connect
 * link opened directly, or on another device — the page lands on the token
 * form, the operator types the token, and the login refresh clears the
 * error banner. The reason is gone, and all that remains is "연결 안 됨".
 * So every attempt is also written here: shown on the admin page next to
 * the platform, and parked in the public status folder so it can be read
 * from CI without the operator relaying anything.
 *
 * Only outcome, a short reason and a timestamp are kept — never a code,
 * a token, or a user id.
 */

import { readOAuthSnapshot, writeOAuthSnapshot } from './status';

export type ConnectPlatform = 'tiktok' | 'youtube' | 'threads';

export interface ConnectAttempt {
  outcome: 'connected' | 'error';
  reason?: string;
  at: string;
}

export type ConnectLog = Partial<Record<ConnectPlatform, ConnectAttempt>>;

const REASON_MAX = 200;

/** Provider error text is shown and stored verbatim — but bounded and single-line. */
export function cleanReason(reason: string): string {
  const flat = reason.replace(/\s+/g, ' ').trim();
  return flat.length > REASON_MAX ? `${flat.slice(0, REASON_MAX - 1)}…` : flat || 'unknown';
}

/** The /admin/media URL a callback sends the browser back to. */
export function connectRedirectUrl(
  adminMedia: string,
  platform: ConnectPlatform,
  attempt: Pick<ConnectAttempt, 'outcome' | 'reason'>,
): string {
  if (attempt.outcome === 'connected') return `${adminMedia}?${platform}=connected`;
  return `${adminMedia}?${platform}=error&reason=${encodeURIComponent(cleanReason(attempt.reason ?? 'unknown'))}`;
}

/** Record one attempt. Never throws — logging must not break the connect flow. */
export async function recordConnectAttempt(
  platform: ConnectPlatform,
  attempt: Pick<ConnectAttempt, 'outcome' | 'reason'>,
): Promise<void> {
  try {
    const current = await readOAuthSnapshot<ConnectLog>();
    const entry: ConnectAttempt = {
      outcome: attempt.outcome,
      ...(attempt.outcome === 'error' ? { reason: cleanReason(attempt.reason ?? 'unknown') } : {}),
      at: new Date().toISOString(),
    };
    await writeOAuthSnapshot({ ...(current ?? {}), [platform]: entry });
  } catch {
    // Diagnostics only.
  }
}

export async function readConnectLog(): Promise<ConnectLog> {
  return (await readOAuthSnapshot<ConnectLog>()) ?? {};
}
