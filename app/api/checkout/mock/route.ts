import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/session-store';
import { sendReport } from '@/lib/email/send-report';

export const runtime = 'nodejs';

/**
 * Dev-only mock checkout. Hit when LEMON_SQUEEZY_API_KEY is not set.
 * Marks the session as paid, sends the report email (or logs it), then
 * redirects to the thank-you page exactly like a real success URL would.
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
  updateSession(sessionId, { email, is_paid: true, paid_at: Date.now() });
  await sendReport({
    sessionId,
    email,
    locale: session.locale,
    result: session.result,
  });
  const dest = new URL(`/${session.locale}/thank-you?sessionId=${sessionId}`, u.origin);
  return NextResponse.redirect(dest);
}
