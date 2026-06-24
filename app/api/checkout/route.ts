import { NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/payments/lemon-squeezy';
import { isTossConfigured, tossClientKey } from '@/lib/payments/toss';
import { isKakaopayConfigured, kakaopayReady } from '@/lib/payments/kakaopay';
import { updateSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { priceKRW } from '@/lib/pricing';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_CHECKOUT,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';

interface Body {
  sessionId: string;
  email: string;
  locale: 'ko' | 'en';
}

export const POST = withErrorHandling('checkout', async (req: Request) => {
  const bypass =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypass) {
    const rl = checkRateLimit(req, RATE_LIMIT_CHECKOUT);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', resetMs: rl.resetMs },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
        },
      );
    }
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.sessionId || !body.email) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const amount = priceKRW();

  // Persist email + the price this session is being charged so the
  // admin dashboard can later segment conversion by price A/B cohort
  // even if `NEXT_PUBLIC_PRICE_KRW` is changed mid-flight.
  updateSession(body.sessionId, {
    email: body.email,
    price_krw: amount,
  });
  // Also persist to Supabase — the in-memory store is empty in prod, so
  // without this the buyer's email would be lost before the payment
  // confirm step needs it.
  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      await admin
        .from('test_sessions')
        .update({ email: body.email })
        .eq('id', body.sessionId);
    } catch (err) {
      console.error('[checkout] failed to persist email to Supabase:', err);
    }
  }

  const origin = new URL(req.url).origin;

  // Preferred path #1: Kakao Pay (KR). Two-step: ready → buyer pays in
  // KakaoTalk → approve. We persist the returned tid so /approve can
  // look it up by sessionId. Client just opens mobileUrl.
  if (isKakaopayConfigured()) {
    const ready = await kakaopayReady({
      sessionId: body.sessionId,
      email: body.email,
      amount,
      locale: body.locale,
      approvalUrl: `${origin}/api/payments/kakaopay/approve?sessionId=${body.sessionId}&locale=${body.locale}`,
      failUrl: `${origin}/${body.locale}/checkout/${body.sessionId}?error=payment_failed`,
      cancelUrl: `${origin}/${body.locale}/checkout/${body.sessionId}?error=cancelled`,
    });
    if (!ready.ok) {
      return NextResponse.json({ error: 'kakaopay_ready_failed', reason: ready.reason }, { status: 502 });
    }
    if (isSupabaseConfigured()) {
      try {
        const admin = createSupabaseAdmin();
        await admin
          .from('test_sessions')
          .update({ kakao_tid: ready.tid })
          .eq('id', body.sessionId);
      } catch (err) {
        console.error('[checkout] failed to persist kakao_tid:', err);
      }
    }
    updateSession(body.sessionId, { kakao_tid: ready.tid });
    return NextResponse.json({ mode: 'kakaopay', mobileUrl: ready.mobileUrl, pcUrl: ready.pcUrl });
  }

  // Preferred path #2: Toss Payments (KR). The client loads the Toss SDK and
  // calls requestPayment with these fields; Toss redirects to the confirm
  // route on success.
  if (isTossConfigured()) {
    return NextResponse.json({
      mode: 'toss',
      clientKey: tossClientKey(),
      orderId: body.sessionId,
      amount,
      orderName:
        body.locale === 'en' ? 'IQ Test — Detailed Report' : 'IQ 테스트 상세 리포트',
      customerEmail: body.email,
      successUrl: `${origin}/api/payments/toss/confirm?sessionId=${body.sessionId}&locale=${body.locale}`,
      failUrl: `${origin}/${body.locale}/checkout/${body.sessionId}?error=payment_failed`,
    });
  }

  // Fallback: Lemon Squeezy (or mock when no LS key is set).
  const successUrl = `${origin}/${body.locale}/thank-you?sessionId=${body.sessionId}`;
  const url = await createCheckoutUrl({
    sessionId: body.sessionId,
    email: body.email,
    locale: body.locale,
    successUrl,
  });
  return NextResponse.json({ mode: 'redirect', url });
});
