import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { waitUntil } from '@vercel/functions';
import { kakaopayApprove } from '@/lib/payments/kakaopay';
import { getSession, updateSession, markEventProcessed } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { sendReport } from '@/lib/email/send-report';
import { sendPurchaseEventCAPI } from '@/lib/analytics/capi';
import { priceKRW } from '@/lib/pricing';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Kakao Pay approval handler. Kakao redirects here after the buyer pays
 * in KakaoTalk, appending `?pg_token=…`. We look up the tid we stashed at
 * /ready time, call /approve (the authoritative "did they really pay?"
 * check, which also re-validates the amount), mark paid, then fire the
 * PDF + email + CAPI in the background — mirroring the Toss handler.
 *
 * On any failure the buyer is redirected back to the checkout page with
 * an error query param rather than seeing a raw 500.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const pgToken = u.searchParams.get('pg_token');
  const sessionId = u.searchParams.get('sessionId') ?? '';
  const locale = u.searchParams.get('locale') === 'en' ? 'en' : 'ko';

  const back = (reason: string) =>
    NextResponse.redirect(
      new URL(`/${locale}/checkout/${sessionId}?error=${reason}`, u.origin),
    );

  if (!pgToken || !sessionId) return back('missing_params');

  // Look up tid + email. Prefer Supabase (the in-memory store is empty in
  // prod), fall back to memory for local/dev where Supabase is absent.
  let tid: string | undefined;
  let email: string | undefined;

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data: row } = await admin
        .from('test_sessions')
        .select('kakao_tid, email')
        .eq('id', sessionId)
        .single();
      tid = row?.kakao_tid ?? undefined;
      email = row?.email ?? undefined;
    } catch (err) {
      console.error('[kakaopay/approve] supabase read failed:', err);
      Sentry.captureException(err, {
        tags: { area: 'kakaopay', step: 'lookup' },
        extra: { sessionId },
      });
    }
  }
  if (!tid || !email) {
    const mem = getSession(sessionId);
    tid = tid ?? mem?.kakao_tid;
    email = email ?? mem?.email;
  }
  if (!tid || !email) return back('session_lost');

  const expectedAmount = priceKRW();

  const approve = await kakaopayApprove({
    tid,
    sessionId,
    email,
    pgToken,
    expectedAmount,
  });
  if (!approve.ok) {
    console.error('[kakaopay/approve] failed', { reason: approve.reason, sessionId });
    Sentry.captureMessage('kakaopay approve failed', {
      level: 'warning',
      tags: { area: 'kakaopay', step: 'approve' },
      extra: { reason: approve.reason, sessionId },
    });
    return back('payment_failed');
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      // Idempotency: pg_token is unique per approved payment. Reuse the LS
      // event-id column so refresh/replay doesn't re-send the email.
      const { error: dupErr } = await admin.from('payments').insert({
        session_id: sessionId,
        ls_event_id: pgToken,
        ls_order_id: sessionId,
        email,
        amount_cents: expectedAmount, // KRW has no cents; store the won amount
        currency: 'KRW',
        status: 'paid',
        raw_payload: approve.raw as Record<string, unknown>,
      });
      if (dupErr && String(dupErr.code) === '23505') {
        return NextResponse.redirect(
          new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
        );
      }
      await admin
        .from('test_sessions')
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (err) {
      console.error('[kakaopay/approve] supabase write failed:', err);
      Sentry.captureException(err, {
        tags: { area: 'kakaopay', step: 'supabase' },
        extra: { sessionId },
      });
    }
  } else {
    const seen = markEventProcessed(pgToken);
    if (seen.duplicate) {
      return NextResponse.redirect(
        new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
      );
    }
    updateSession(sessionId, { is_paid: true, paid_at: Date.now() });
  }

  // Background: PDF + email + CAPI. send-report resolves the result from
  // Supabase when memory is empty (prod), so the email goes out.
  const mem = getSession(sessionId);
  waitUntil(
    (async () => {
      try {
        await sendReport({ sessionId, email: email!, locale, result: mem?.result });
      } catch (err) {
        console.error('[kakaopay/approve bg] sendReport failed:', err);
        Sentry.captureException(err, {
          tags: { area: 'kakaopay', step: 'sendReport' },
          extra: { sessionId },
        });
      }
      try {
        await sendPurchaseEventCAPI({
          email: email!,
          value: expectedAmount,
          currency: 'KRW',
          eventId: pgToken,
        });
      } catch (err) {
        console.error('[kakaopay/approve bg] CAPI failed:', err);
      }
    })(),
  );

  return NextResponse.redirect(
    new URL(`/${locale}/thank-you?sessionId=${sessionId}`, u.origin),
  );
}
