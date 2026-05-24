import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { getSession, updateSession } from '@/lib/session-store';
import { sendReport } from '@/lib/email/send-report';
import { priceKRW } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/admin/webhook-test
 *
 * Operator-only synthetic webhook. Marks a given session as paid and
 * fires the email pipeline as if Lemon Squeezy had just delivered a
 * real `order_created` event — *without* charging a card or sending
 * an actual LS webhook.
 *
 * Use cases:
 *   - Verify Resend + PDF render after rotating an API key
 *   - Smoke-test the email template after a copy change
 *   - Reproduce a "PDF never arrived" support ticket flow
 *
 * Required body: { sessionId, email }
 * The endpoint is gated behind ADMIN_TOKEN + 404s on bad token to stay
 * invisible. Email send happens in waitUntil() so the operator gets
 * an immediate response.
 */
export const POST = withErrorHandling('admin/webhook-test', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers.get('x-admin-token');
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let body: { sessionId?: string; email?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.sessionId || !body.email) {
    return NextResponse.json(
      { error: 'sessionId and email required' },
      { status: 400 },
    );
  }

  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }

  updateSession(body.sessionId, {
    email: body.email,
    is_paid: true,
    paid_at: Date.now(),
    price_krw: priceKRW(),
  });

  // Email fires in the background — same pattern as the real LS webhook
  // handler so timing/error surfaces match production.
  waitUntil(
    sendReport({
      sessionId: body.sessionId,
      email: body.email,
      locale: session.locale,
      result: session.result,
    }).catch((err) => {
      console.error('[admin/webhook-test bg] sendReport failed:', err);
    }),
  );

  return NextResponse.json(
    {
      ok: true,
      simulated: 'order_created',
      sessionId: body.sessionId,
      emailWillSendTo: body.email.slice(0, 1) + '***' + body.email.slice(body.email.indexOf('@')),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
});

export const GET = () => new NextResponse('Method Not Allowed', { status: 405 });
