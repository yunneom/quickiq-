/**
 * CSRF state for the TikTok/YouTube OAuth redirect flows.
 *
 * These flows start with a plain browser navigation from /admin/media
 * (a clicked link, not a fetch — no custom headers possible), so the
 * initiating route authenticates via a `?token=` query param instead.
 * The `state` param that travels through the external provider and back
 * to our callback is a signed, time-boxed nonce — not a session, since
 * there is no server-side session store here — verified with an HMAC
 * keyed on ADMIN_TOKEN (already the operator's private secret, so no
 * new secret to provision).
 */

import { createHmac, randomBytes } from 'node:crypto';

function stateSecret(): string {
  const token = process.env.ADMIN_TOKEN?.trim();
  if (!token) {
    throw new Error('ADMIN_TOKEN must be set to use OAuth connect flows');
  }
  return token;
}

function sign(payload: string): string {
  return createHmac('sha256', stateSecret()).update(payload).digest('hex').slice(0, 32);
}

export function issueState(): string {
  const payload = `${Date.now()}.${randomBytes(12).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

/** `maxAgeMs` bounds how long an authorize link stays valid before it must be re-issued. */
export function verifyState(state: string | null, maxAgeMs = 10 * 60 * 1000): boolean {
  if (!state) return false;
  const parts = state.split('.');
  if (parts.length !== 3) return false;
  const [tsStr, nonce, sig] = parts;
  if (sig !== sign(`${tsStr}.${nonce}`)) return false;
  const ts = Number(tsStr);
  return Number.isFinite(ts) && Date.now() - ts <= maxAgeMs;
}
