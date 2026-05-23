/**
 * Lemon Squeezy integration — minimal wrapper.
 *
 * In production set:
 *   LEMON_SQUEEZY_API_KEY
 *   LEMON_SQUEEZY_STORE_ID
 *   LEMON_SQUEEZY_PRODUCT_VARIANT_ID
 *   LEMON_SQUEEZY_WEBHOOK_SECRET
 *
 * Without those env vars `createCheckoutUrl` returns a local mock URL that
 * triggers the same /api/webhooks/lemon-squeezy flow as a real purchase —
 * handy for end-to-end testing on a dev machine.
 */

import crypto from 'node:crypto';

const API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const VARIANT_ID = process.env.LEMON_SQUEEZY_PRODUCT_VARIANT_ID;
const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

export function isLemonSqueezyConfigured(): boolean {
  return Boolean(API_KEY && STORE_ID && VARIANT_ID);
}

interface CreateCheckoutInput {
  sessionId: string;
  email: string;
  locale: 'ko' | 'en';
  successUrl: string;
}

export async function createCheckoutUrl(input: CreateCheckoutInput): Promise<string> {
  if (!isLemonSqueezyConfigured()) {
    // Dev-mode mock: a special URL that the API consumes immediately to fire
    // the local webhook handler.
    return `/api/checkout/mock?sessionId=${encodeURIComponent(input.sessionId)}&email=${encodeURIComponent(input.email)}`;
  }
  const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/vnd.api+json',
      Accept: 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: input.email,
            custom: { session_id: input.sessionId, locale: input.locale },
          },
          product_options: {
            redirect_url: input.successUrl,
            // LS API rejects non-ASCII in receipt_thank_you_note with
            // "Malformed UTF-8 characters". Keep this field ASCII-only and
            // localize the user-facing message via our own thank-you page.
            receipt_thank_you_note:
              'Your detailed PDF report will arrive by email shortly.',
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: STORE_ID } },
          variant: { data: { type: 'variants', id: VARIANT_ID } },
        },
      },
    }),
  });
  if (!res.ok) {
    // Surface the body in logs to ease future debugging — the response
    // often has a useful jsonapi `errors[].detail`. Re-throw a short error
    // so callers can still capture it cleanly.
    const text = await res.text().catch(() => '');
    console.error('[lemon-squeezy] checkout error', res.status, text.slice(0, 500));
    throw new Error(`lemon_squeezy_${res.status}`);
  }
  const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error('checkout_url_missing');
  return url;
}

export interface SignatureCheck {
  ok: boolean;
  /** Short machine-readable reason — safe to log/return. Never contains secret material. */
  reason?: string;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): SignatureCheck {
  // Operational kill switch: WEBHOOK_VERIFY_DISABLED=1 lets webhook calls
  // through unchecked. Only intended for diagnosing live signature
  // mismatches — remove the env immediately after debugging.
  if (process.env.WEBHOOK_VERIFY_DISABLED === '1') {
    return { ok: true, reason: 'disabled_via_env' };
  }
  if (!WEBHOOK_SECRET) {
    // Dev-mode: accept anything so the mock checkout path can complete.
    return { ok: true, reason: 'no_secret_configured' };
  }
  if (!signature) return { ok: false, reason: 'missing_signature_header' };

  // LS sends a hex-encoded HMAC-SHA256 of the raw body. Some webhook
  // providers prefix with "sha256=" — handle both. Also trim accidental
  // whitespace from header parsing.
  const cleaned = signature.trim().replace(/^sha256=/i, '');
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');

  if (digest.length !== cleaned.length) {
    return {
      ok: false,
      reason: `length_mismatch:digest=${digest.length},sig=${cleaned.length}`,
    };
  }
  try {
    const eq = crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(cleaned));
    return eq ? { ok: true } : { ok: false, reason: 'hmac_mismatch' };
  } catch (err) {
    return { ok: false, reason: 'timing_compare_threw' };
  }
}
