import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { readFunnelCounts } from '@/lib/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Funnel snapshot as CSV. Mirrors /api/admin/sessions.csv ergonomics:
 * x-admin-token auth, RFC-4180-ish output, 404 on bad token.
 *
 * Useful when the operator wants to share funnel drop-off in an ops
 * chat / spreadsheet without screen-grabbing the /admin chart. Each
 * row = one event with total / last-24h / last-1h counters.
 */
export const GET = withErrorHandling('admin/funnel.csv', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers.get('x-admin-token');
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const funnel = readFunnelCounts();
  const headers = ['event', 'total', 'last_24h', 'last_1h'];
  const rows = Object.entries(funnel).map(([event, counts]) => [
    event,
    counts.total,
    counts.last24h,
    counts.last1h,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join(
    '\r\n',
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="iq-funnel-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
