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

  // Idempotency BEFORE the PG call: on a refreshed success-redirect Toss
  // returns ALREADY_PROCESSED_PAYMENT, which previously read as
  // "payment_failed" to a customer who had just paid — and offered them
  // the checkout form again. Paid session → straight to thank-you.
  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data: row } = await admin
        .from('test_sessions')
        .select('is_paid')
        .eq('id', sessionId)
        .single();
      if (row?.is_paid) {
        return NextResponse.redirect(
          new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
        );
      }
    } catch {
      // Lookup failure is non-fatal — confirm flow handles the rest.
    }
  } else if (getSession(sessionId)?.is_paid) {
    return NextResponse.redirect(
      new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
    );
  }

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
      if (dupErr) {
        // Money captured but ledger insert failed — never silent: without
        // this row, refunds/settlement can't be reconciled.
        Sentry.captureMessage('toss paid but payments insert failed', {
          level: 'error',
          tags: { area: 'toss', step: 'ledger' },
          extra: { sessionId, code: dupErr.code, message: dupErr.message },
        });
      }
      const { error: updErr } = await admin
        .from('test_sessions')
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', sessionId);
      if (updErr) {
        Sentry.captureMessage('toss paid but is_paid update failed', {
          level: 'error',
          tags: { area: 'toss', step: 'mark-paid' },
          extra: { sessionId, message: updErr.message },
        });
      }
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

  // Buyer paid but we have no email on file (checkout persist failed or
  // session never reached the DB) — this used to skip the report SILENTLY.
  // Loud alert so the operator can recover the buyer from the payments row.
  if (!email) {
    Sentry.captureMessage('toss paid but no email on file — report NOT sent', {
      level: 'error',
      tags: { area: 'toss', step: 'no-email' },
      extra: { sessionId, paymentKey },
    });
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
