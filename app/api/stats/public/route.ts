import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StoredSession {
  id: string;
  completed_at?: number;
  result?: { estimatedIq: number };
}

/**
 * Public, anonymous stats endpoint for the landing-page social-proof
 * card. Only exposes aggregate numbers — never per-user data.
 *
 * Cache: 60 seconds on Vercel edge so a busy landing page isn't
 * recomputing on every request.
 */
export const GET = withErrorHandling('stats/public', async () => {
  const g = globalThis as unknown as { __iqSessions?: Map<string, StoredSession> };
  const sessions = g.__iqSessions ? Array.from(g.__iqSessions.values()) : [];

  const completed = sessions.filter((s) => s.completed_at);
  const iqs = completed
    .map((s) => s.result?.estimatedIq)
    .filter((v): v is number => typeof v === 'number');
  const avgIq =
    iqs.length === 0 ? null : Math.round(iqs.reduce((a, b) => a + b, 0) / iqs.length);

  // Floor display numbers so a small in-memory store doesn't make the
  // landing look empty. Once we hit Supabase + real volume these can
  // just be the actual totals.
  const displayTakers = Math.max(completed.length, 0);
  return NextResponse.json(
    {
      takers: displayTakers,
      averageIq: avgIq,
    },
    {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    },
  );
});
