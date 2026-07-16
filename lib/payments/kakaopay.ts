import * as Sentry from '@sentry/nextjs';

/**
 * Kakao Pay online single-payment integration — server-side helpers.
 *
 * Uses the CURRENT KakaoPay Developers API (open-api.kakaopay.com), NOT
 * the legacy kapi.kakao.com admin-key API. Differences from legacy:
 *   - Host:        kapi.kakao.com/v1/payment → open-api.kakaopay.com/online/v1/payment
 *   - Auth header: `KakaoAK {admin_key}`     → `SECRET_KEY {secret_key}`
 *   - Body:        form-urlencoded           → application/json
 * The flow, body fields, and the nested `amount.total` in the approve
 * response are otherwise the same.
 *
 * Flow (two API calls):
 *   1. /api/checkout → kakaopayReady() with amount + URLs.
 *      Kakao returns { tid, next_redirect_pc_url, next_redirect_mobile_url }.
 *      We persist `tid` on the session and redirect the buyer to the URL.
 *   2. Buyer pays in KakaoTalk → Kakao redirects to approvalUrl?pg_token=…
 *   3. /api/payments/kakaopay/approve calls kakaopayApprove() with
 *      tid + pg_token + the same partner_order_id + partner_user_id.
 *      Success → server-side amount re-check → mark paid → email PDF.
 *
 * Credentials (KakaoPay Developers → 애플리케이션 → 발급정보):
 *   KAKAOPAY_SECRET_KEY  Secret Key (use the dev Secret Key for testing).
 *                        Sent as `Authorization: SECRET_KEY {key}`.
 *   KAKAOPAY_CID         Merchant CID (still required, separate from the
 *                        Client ID). Test CID is TC0ONETIME.
 *   KAKAOPAY_CLIENT_ID   Client ID (20-char). Identifies the merchant tied
 *                        to the Secret Key; not sent per request, kept for
 *                        reference/ops parity with the contract.
 *
 * The price is ALWAYS taken from the server (priceKRW()), never the
 * client, and approve re-validates the confirmed amount as defense in
 * depth against a tampered redirect.
 */

const SECRET_KEY = process.env.KAKAOPAY_SECRET_KEY?.trim();
const CID = process.env.KAKAOPAY_CID?.trim() || 'TC0ONETIME'; // TC0ONETIME = official test CID

const BASE = 'https://open-api.kakaopay.com/online/v1/payment';

function authHeaders(): Record<string, string> {
  return {
    Authorization: `SECRET_KEY ${SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export function isKakaopayConfigured(): boolean {
  return Boolean(SECRET_KEY);
}

interface ReadyInput {
  /** Session id used as partner_order_id (idempotent, traceable). */
  sessionId: string;
  /** Amount in KRW won (no cents). */
  amount: number;
  /** Locale for the order name. */
  locale: 'ko' | 'en';
  /** Buyer email — used as partner_user_id (hashed-ish identifier). */
  email: string;
  /** Absolute URL Kakao calls back on success (must include pg_token). */
  approvalUrl: string;
  failUrl: string;
  cancelUrl: string;
}

export type ReadyResult =
  | {
      ok: true;
      tid: string;
      mobileUrl: string;
      pcUrl: string;
      androidUrl?: string;
      iosUrl?: string;
    }
  | { ok: false; reason: string; status?: number; raw?: unknown };

/**
 * POST /online/v1/payment/ready — opens a payment session with Kakao.
 * Returns tid (transaction id) that we MUST keep for approve.
 */
export async function kakaopayReady(input: ReadyInput): Promise<ReadyResult> {
  if (!SECRET_KEY) return { ok: false, reason: 'kakaopay_not_configured' };

  const body = JSON.stringify({
    cid: CID,
    partner_order_id: input.sessionId,
    partner_user_id: input.email,
    item_name:
      input.locale === 'en'
        ? 'IQ Test — Detailed Report'
        : 'IQ 테스트 상세 리포트',
    quantity: 1,
    total_amount: input.amount,
    tax_free_amount: 0,
    approval_url: input.approvalUrl,
    fail_url: input.failUrl,
    cancel_url: input.cancelUrl,
  });

  try {
    const res = await fetch(`${BASE}/ready`, {
      method: 'POST',
      headers: authHeaders(),
      body,
      cache: 'no-store',
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        reason:
          (raw as { error_message?: string; msg?: string })?.error_message ??
          (raw as { msg?: string })?.msg ??
          `http_${res.status}`,
        status: res.status,
        raw,
      };
    }
    const data = raw as {
      tid?: string;
      next_redirect_pc_url?: string;
      next_redirect_mobile_url?: string;
      android_app_scheme?: string;
      ios_app_scheme?: string;
    };
    if (!data.tid || !data.next_redirect_mobile_url) {
      return { ok: false, reason: 'malformed_ready_response', raw };
    }
    return {
      ok: true,
      tid: data.tid,
      mobileUrl: data.next_redirect_mobile_url,
      pcUrl: data.next_redirect_pc_url ?? data.next_redirect_mobile_url,
      androidUrl: data.android_app_scheme,
      iosUrl: data.ios_app_scheme,
    };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'kakaopay', step: 'ready' } });
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

interface ApproveInput {
  tid: string;
  sessionId: string; // partner_order_id
  email: string; // partner_user_id
  pgToken: string; // appended by Kakao to the approval URL
  /** Server-trusted expected amount; mismatch is rejected. */
  expectedAmount: number;
}

export type ApproveResult =
  | { ok: true; raw: unknown; method?: string; approvedAt?: string }
  | {
      ok: false;
      reason: string;
      status?: number;
      raw?: unknown;
      /** Set on confirmed_amount_mismatch — money WAS captured for this
       * amount; caller must refund via kakaopayCancel. */
      confirmedTotal?: number;
    };

/**
 * POST /online/v1/payment/approve — the authoritative "did they really
 * pay?" call. Re-checks the confirmed amount against the server price.
 */
export async function kakaopayApprove(input: ApproveInput): Promise<ApproveResult> {
  if (!SECRET_KEY) return { ok: false, reason: 'kakaopay_not_configured' };

  const body = JSON.stringify({
    cid: CID,
    tid: input.tid,
    partner_order_id: input.sessionId,
    partner_user_id: input.email,
    pg_token: input.pgToken,
  });

  try {
    const res = await fetch(`${BASE}/approve`, {
      method: 'POST',
      headers: authHeaders(),
      body,
      cache: 'no-store',
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        reason:
          (raw as { error_message?: string; msg?: string })?.error_message ??
          (raw as { msg?: string })?.msg ??
          `http_${res.status}`,
        status: res.status,
        raw,
      };
    }
    // New API nests amounts: { total, tax_free, vat, point, discount, green_deposit }
    const data = raw as {
      amount?: { total?: number };
      payment_method_type?: string;
      approved_at?: string;
    };
    const confirmedTotal = data.amount?.total;
    if (typeof confirmedTotal === 'number' && confirmedTotal !== input.expectedAmount) {
      return { ok: false, reason: 'confirmed_amount_mismatch', raw, confirmedTotal };
    }
    return {
      ok: true,
      raw,
      method: data.payment_method_type,
      approvedAt: data.approved_at,
    };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'kakaopay', step: 'approve' } });
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}

/**
 * POST /online/v1/payment/cancel — refunds an approved payment. Used as
 * the safety net when approve succeeded (money captured) but our own
 * post-approve validation failed: without this, a mismatch left the buyer
 * charged with no report and no automatic remediation.
 */
export async function kakaopayCancel(input: {
  tid: string;
  amount: number;
}): Promise<{ ok: boolean; reason?: string; raw?: unknown }> {
  if (!SECRET_KEY) return { ok: false, reason: 'kakaopay_not_configured' };
  try {
    const res = await fetch(`${BASE}/cancel`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        cid: CID,
        tid: input.tid,
        cancel_amount: input.amount,
        cancel_tax_free_amount: 0,
      }),
      cache: 'no-store',
    });
    const raw: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        reason:
          (raw as { error_message?: string })?.error_message ?? `http_${res.status}`,
        raw,
      };
    }
    return { ok: true, raw };
  } catch (err) {
    Sentry.captureException(err, { tags: { area: 'kakaopay', step: 'cancel' } });
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch_failed' };
  }
}
