import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { waitUntil } from '@vercel/functions';
import { confirmTossPayment } from '@/lib/payments/toss';
import { getSession, updateSession, markEventProcessed } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { sendReport } from '@/lib/email/send-report';
import { sendPurchaseEventCAPI } from '@/lib/analytics/capi';
import { priceKRW } from '@/lib/pricing';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Toss Payments success redirect handler. Toss appends paymentKey, orderId,
 * and amount to the successUrl. We confirm server-side with the secret key
 * (the authoritative payment check), mark the session paid, then fire the
 * PDF + email + CAPI in the background — mirroring the LS webhook handler.
 *
 * orderId is the sessionId (set in /api/checkout). On any failure we redirect
 * the buyer back to checkout with an error rather than showing a raw 500.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const paymentKey = u.searchParams.get('paymentKey');
  const orderId = u.searchParams.get('orderId'); // == sessionId
  const amountStr = u.searchParams.get('amount');
  const locale = u.searchParams.get('locale') === 'en' ? 'en' : 'ko';
  const sessionId = u.searchParams.get('sessionId') ?? orderId ?? '';

  const back = (reason: string) =>
    NextResponse.redirect(
      new URL(`/${locale}/checkout/${sessionId}?error=${reason}`, u.origin),
    );

  if (!paymentKey || !orderId || !amountStr) return back('missing_params');
  const amount = Number(amountStr);
  if (!Number.isFinite(amount)) return back('bad_amount');

  // Authoritative confirm — re-checks amount against the server price.
  const confirm = await confirmTossPayment({
    paymentKey,
    orderId,
    amount,
    expectedAmount: priceKRW(),
  });
  if (!confirm.ok) {
    console.error('[toss/confirm] failed', { reason: confirm.reason, sessionId });
    Sentry.captureMessage('toss confirm failed', {
      level: 'warning',
      tags: { area: 'toss', step: 'confirm' },
      extra: { reason: confirm.reason, sessionId },
    });
    return back('payment_failed');
  }

  // Resolve email — prefer the DB row (set at checkout), fall back to memory.
  let email: string | undefined = getSession(sessionId)?.email;

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data: row } = await admin
        .from('test_sessions')
        .select('email, locale')
        .eq('id', sessionId)
        .single();
      if (row?.email) email = row.email;

      // Idempotency: paymentKey is unique per payment. Reuse the LS event
      // column so a double redirect / refresh doesn't re-send the email.
      const { error: dupErr } = await admin.from('payments').insert({
        session_id: sessionId,
        ls_event_id: paymentKey,
        ls_order_id: orderId,
        email: email ?? 'unknown@unknown',
        amount_cents: amount, // KRW has no cents; store the won amount
        currency: 'KRW',
        status: 'paid',
        raw_payload: confirm.raw as Record<string, unknown>,
      });
      if (dupErr && String(dupErr.code) === '23505') {
        // Already processed — just send the buyer to the thank-you page.
        return NextResponse.redirect(
          new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
        );
      }
      await admin
        .from('test_sessions')
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (err) {
      console.error('[toss/confirm] supabase write failed:', err);
      Sentry.captureException(err, { tags: { area: 'toss', step: 'supabase' }, extra: { sessionId } });
    }
  } else {
    const seen = markEventProcessed(paymentKey);
    if (seen.duplicate) {
      return NextResponse.redirect(
        new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
      );
    }
    updateSession(sessionId, { is_paid: true, paid_at: Date.now() });
  }

  // Background: PDF + email + CAPI. send-report resolves the result/answers
  // from Supabase when memory is empty (prod), so the email goes out.
  const mem = getSession(sessionId);
  waitUntil(
    (async () => {
      try {
        if (email) {
          await sendReport({ sessionId, email, locale, result: mem?.result });
        }
      } catch (err) {
        console.error('[toss/confirm bg] sendReport failed:', err);
        Sentry.captureException(err, { tags: { area: 'toss', step: 'sendReport' }, extra: { sessionId } });
      }
      try {
        if (email) {
          await sendPurchaseEventCAPI({
            email,
            value: amount,
            currency: 'KRW',
            eventId: paymentKey,
          });
        }
      } catch (err) {
        console.error('[toss/confirm bg] CAPI failed:', err);
      }
    })(),
  );

  return NextResponse.redirect(
    new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
  );
}
