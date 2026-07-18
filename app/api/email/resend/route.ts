import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import * as Sentry from '@sentry/nextjs';
import { fetchPaidSessionData } from '@/lib/paid-session';
import { sendReport } from '@/lib/email/send-report';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { checkRateLimit, isRateLimitDisabled } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Body {
  sessionId: string;
}

/**
 * POST /api/email/resend  body: { sessionId }
 *
 * Re-sends the report email to the address already on file. The original
 * email may have landed in spam, been deleted, or the user never received
 * it (rare Resend deliverability issue). Requires the session to be paid.
 *
 * Heavy work (PDF render + Resend call) is fire-and-forget via waitUntil
 * so the user gets a fast "we're resending it" acknowledgement.
 */
export const POST = withErrorHandling('email/resend', async (req: Request) => {
  // 5 resends per hour per IP — enough for an honest user retry, far
  // too few for someone spamming the endpoint.
  const bypass =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypass) {
    const rl = checkRateLimit(req, {
      key: 'email-resend',
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', resetMs: rl.resetMs },
        { status: 429 },
      );
    }
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.sessionId) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  // Memory → Supabase fallback: in production the in-memory store is
  // empty, so without the DB lookup every paying customer got a 404 here.
  const session = await fetchPaidSessionData(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!session.is_paid || !session.email) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }
  if (!session.result) {
    return NextResponse.json({ error: 'no_result_to_send' }, { status: 409 });
  }

  waitUntil(
    sendReport({
      sessionId: body.sessionId,
      email: session.email,
      locale: session.locale,
      result: session.result,
    }).catch((err) => {
      console.error('[email/resend bg] failed:', err);
      Sentry.captureException(err, {
        tags: { area: 'email', step: 'resend' },
        extra: { sessionId: body.sessionId },
      });
    }),
  );

  return NextResponse.json({ ok: true, email: session.email });
});
