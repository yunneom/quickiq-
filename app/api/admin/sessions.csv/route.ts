import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StoredSession {
  id: string;
  locale: 'ko' | 'en';
  started_at: number;
  completed_at?: number;
  is_paid?: boolean;
  paid_at?: number;
  price_krw?: number;
  email?: string;
  utm?: Record<string, string>;
  ab?: Record<string, string>;
  result?: { estimatedIq?: number; topPercentile?: number };
}

/** CSV-escape a single field. Wraps in quotes and doubles internal
 *  quotes when the value contains a quote, comma, or newline. */
function esc(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Admin-only CSV dump. Useful when the operator wants to pivot the
 * data in a spreadsheet — A/B variant cohorts, UTM source × paid
 * conversion, etc. — beyond what /admin renders inline.
 *
 * Privacy: emails are masked (first char + @domain) to match what
 * /api/admin/sessions/[id] exposes. The raw 8-char session prefix is
 * the join key if the operator needs to cross-reference.
 */
export const GET = withErrorHandling('admin/sessions.csv', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers.get('x-admin-token');
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const g = globalThis as unknown as { __iqSessions?: Map<string, StoredSession> };
  const sessions = g.__iqSessions ? Array.from(g.__iqSessions.values()) : [];

  const headers = [
    'id_prefix',
    'locale',
    'started_at',
    'completed_at',
    'is_paid',
    'paid_at',
    'price_krw',
    'estimated_iq',
    'top_pct',
    'email_masked',
    'ab_paywallCta',
    'utm_source',
    'utm_campaign',
  ];

  const rows = sessions.map((s) => [
    s.id.slice(0, 8),
    s.locale,
    new Date(s.started_at).toISOString(),
    s.completed_at ? new Date(s.completed_at).toISOString() : '',
    s.is_paid ? 'true' : 'false',
    s.paid_at ? new Date(s.paid_at).toISOString() : '',
    s.price_krw ?? '',
    s.result?.estimatedIq ?? '',
    s.result?.topPercentile ?? '',
    s.email ? s.email.slice(0, 1) + '***' + s.email.slice(s.email.indexOf('@')) : '',
    s.ab?.paywallCta ?? '',
    s.utm?.utm_source ?? '',
    s.utm?.utm_campaign ?? '',
  ]);

  // RFC 4180-ish CSV. CRLF line endings keep Excel/Numbers happy.
  const csv = [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="iq-sessions-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
});
