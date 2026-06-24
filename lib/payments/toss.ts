import * as Sentry from '@sentry/nextjs';

/**
 * Toss Payments (토스페이먼츠) server-side helper.
 *
 * Flow (replaces the Lemon Squeezy redirect model):
 *   1. /api/checkout returns { mode: 'toss', clientKey, orderId, amount, ... }.
 *   2. The client loads the Toss SDK and calls requestPayment() — the user
 *      pays on Toss's hosted UI.
 *   3. Toss redirects to successUrl?paymentKey&orderId&amount.
 *   4. /api/payments/toss/confirm calls confirmTossPayment() with the secret
 *      key — this is the authoritative "did they really pay?" check. Only on
 *      success do we mark the session paid + send the PDF.
 *
 * The price is ALWAYS taken from the server (priceKRW()), never the client,
 * and confirmTossPayment re-checks the confirmed amount — defense in depth
 * against a tampered redirect.
 */

const SECRET = process.env.TOSS_SECRET_KEY?.trim();
const CLIENT = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.trim();

const CONFIRM_ENDPOINT = 'https://api.tosspayments.com/v1/payments/confirm';

export function isTossConfigured(): boolean {
  return Boolean(SECRET && CLIENT);
}

export function tossClientKey(): string | undefined {
  return CLIENT;
}

export interface TossConfirmInput {
  paymentKey: string;
  orderId: string;
  /** Amount in KRW won the client claims was charged. */
  amount: number;
  /** Server-trusted expected amount; mismatch is rejected. */
  expectedAmount: number;
}

export type TossConfirmResult =
  | { ok: true; raw: unknown; method?: string; approvedAt?: string }
  | { ok: false; reason: string; status?: number; raw?: unknown };

/**
 * Confirm a payment with Toss. Basic-auth is the secret key followed by a
 * colon, base64-encoded (Toss convention). Rejects up front if the claimed
 * amount doesn't match the server's expected price.
 */
export async function confirmTossPayment(
  input: TossConfirmInput,
): Promise<TossConfirmResult> {
  if (!SECRET) return { ok: false, reason: 'toss_not_configured' };
  if (input.amount !== input.expectedAmount) {
    return { ok: false, reason: 'amount_mismatch' };
  }

  const auth = Buffer.from(`${SECRET}:`).toString('base64');
  try {
    const res = await fetch(CONFIRM_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey: input.paymentKey,
        orderId: input.orderId,
        amount: input.amount,
      }),
      cache: 'no-store',
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code =
        (raw as { code?: string; message?: string })?.code ??
        `http_${res.status}`;
      return { ok: false, reason: code, status: res.status, raw };
    }
    const data = raw as { method?: string; approvedAt?: string; totalAmount?: number };
    // Final guard: Toss's confirmed totalAmount must equal expected.
    if (typeof data.totalAmount === 'number' && data.totalAmount !== input.expectedAmount) {
      return { ok: false, reason: 'confirmed_amount_mismatch', raw };
    }
    return { ok: true, raw, method: data.method, approvedAt: data.approvedAt };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'toss', step: 'confirm' } });
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}
