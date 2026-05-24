import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getSession, updateSession } from '@/lib/session-store';
import { sendReport } from '@/lib/email/send-report';
import { priceKRW } from '@/lib/pricing';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Dev-only mock checkout. Hit when LEMON_SQUEEZY_API_KEY is not set.
 * Marks the session as paid, fires the email send in the background, then
 * redirects to the thank-you page — mirroring the real LS webhook flow
 * (waitUntil + immediate response) so e2e timing stays predictable.
 */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const sessionId = u.searchParams.get('sessionId');
  const email = u.searchParams.get('email');
  if (!sessionId || !email) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  }
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }
  updateSession(sessionId, {
    email,
    is_paid: true,
    paid_at: Date.now(),
    price_krw: priceKRW(),
  });

  // Email send is fire-and-forget — same pattern as the LS webhook handler.
  waitUntil(
    sendReport({
      sessionId,
      email,
      locale: session.locale,
      result: session.result,
    }).catch((err) => {
      console.error('[mock-checkout bg] sendReport failed:', err);
    }),
  );

  const dest = new URL(`/${session.locale}/thank-you?sessionId=${sessionId}`, u.origin);
  return NextResponse.redirect(dest);
}
