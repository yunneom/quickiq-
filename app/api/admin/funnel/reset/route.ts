import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { resetFunnelCounts } from '@/lib/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/funnel/reset
 *
 * Clear in-memory funnel counters. Used when the operator wants a
 * clean measurement window — e.g. before launching a fresh creative,
 * or when on-boarding a new tester whose noise they want to discard.
 *
 * Auth: same x-admin-token model + 404 (not 401) on miss.
 *
 * POST-only so a misclicked `GET /api/admin/funnel/reset` in a browser
 * tab can't accidentally wipe data. The 405 reply keeps GET callers
 * honest without leaking that the endpoint exists.
 */
export const POST = withErrorHandling('admin/funnel/reset', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers.get('x-admin-token');
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const cleared = resetFunnelCounts();
  return NextResponse.json(
    { ok: true, cleared, at: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
});

export const GET = () => new NextResponse('Method Not Allowed', { status: 405 });
