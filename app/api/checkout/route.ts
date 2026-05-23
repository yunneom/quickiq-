import { NextResponse } from 'next/server';
import { createCheckoutUrl } from '@/lib/payments/lemon-squeezy';
import { updateSession } from '@/lib/session-store';
import { withErrorHandling } from '@/lib/api/with-error-handling';
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

  // Persist email on the session so it's available before webhook lands.
  updateSession(body.sessionId, { email: body.email });

  const origin = new URL(req.url).origin;
  const successUrl = `${origin}/${body.locale}/thank-you?sessionId=${body.sessionId}`;

  const url = await createCheckoutUrl({
    sessionId: body.sessionId,
    email: body.email,
    locale: body.locale,
    successUrl,
  });
  return NextResponse.json({ url });
});
