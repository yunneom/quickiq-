import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { getSession } from '@/lib/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Operator-only session inspector. Mirrors /api/admin/stats auth
 * (404 on bad token, not 401, to keep the endpoint invisible).
 *
 * Use case: support-style debugging — "did this session actually
 * complete?", "what email did they enter?", "which A/B variants are
 * stamped?", "did the webhook mark it paid?". Returns the full
 * StoredSession with email masked.
 */
export const GET = withErrorHandling(
  'admin/sessions/detail',
  async (req: Request, ctx: unknown) => {
    const expected = process.env.ADMIN_TOKEN;
    const token = req.headers.get('x-admin-token');
    if (!expected || token !== expected) {
      return new NextResponse('Not Found', { status: 404 });
    }
    const { params } = ctx as { params: { id: string } };
    const session = getSession(params.id);
    if (!session) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Mask the email so the admin endpoint never leaks plaintext PII.
    const maskedEmail = session.email
      ? session.email.slice(0, 1) + '***' + session.email.slice(session.email.indexOf('@'))
      : null;

    return NextResponse.json(
      {
        id: session.id,
        locale: session.locale,
        started_at: session.started_at,
        completed_at: session.completed_at ?? null,
        is_paid: Boolean(session.is_paid),
        paid_at: session.paid_at ?? null,
        price_krw: session.price_krw ?? null,
        email: maskedEmail,
        ab: session.ab ?? {},
        utm: session.utm ?? {},
        // Result is included but answers are not (PII-adjacent + bulky).
        result: session.result ?? null,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  },
);
