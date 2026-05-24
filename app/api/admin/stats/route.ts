import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { readFunnelCounts } from '@/lib/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StoredSession {
  id: string;
  locale: 'ko' | 'en';
  started_at: number;
  completed_at?: number;
  is_paid?: boolean;
  paid_at?: number;
  email?: string;
  utm?: Record<string, string>;
  result?: {
    rawScore: number;
    estimatedIq: number;
    topPercentile: number;
  };
}

/**
 * Lightweight admin stats over the in-memory session store. When
 * Supabase is wired up, we'll layer real DB queries on top; until then
 * this gives the operator a live view of traffic and conversion.
 *
 * Auth: ADMIN_TOKEN env, passed via `x-admin-token` header. Returns 404
 * (not 401) when the token is wrong so the endpoint is invisible to
 * unauthorized callers.
 */
export const GET = withErrorHandling('admin/stats', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers.get('x-admin-token');
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const g = globalThis as unknown as { __iqSessions?: Map<string, StoredSession> };
  const sessions = g.__iqSessions ? Array.from(g.__iqSessions.values()) : [];

  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  const sinceHour = sessions.filter((s) => s.started_at > now - HOUR);
  const sinceDay = sessions.filter((s) => s.started_at > now - DAY);
  const completed = sessions.filter((s) => s.completed_at);
  const paid = sessions.filter((s) => s.is_paid);

  const completionRate =
    sessions.length === 0
      ? 0
      : Math.round((completed.length / sessions.length) * 1000) / 10;
  const conversionRate =
    completed.length === 0
      ? 0
      : Math.round((paid.length / completed.length) * 1000) / 10;

  const iqValues = completed
    .map((s) => s.result?.estimatedIq)
    .filter((v): v is number => typeof v === 'number');
  const avgIq =
    iqValues.length === 0
      ? null
      : Math.round(iqValues.reduce((a, b) => a + b, 0) / iqValues.length);

  // Aggregate by utm_campaign (or utm_source if campaign absent).
  const campaignAgg = new Map<
    string,
    { sessions: number; completed: number; paid: number }
  >();
  for (const s of sessions) {
    const campaign = s.utm?.utm_campaign ?? s.utm?.utm_source ?? '(direct)';
    const cur = campaignAgg.get(campaign) ?? { sessions: 0, completed: 0, paid: 0 };
    cur.sessions += 1;
    if (s.completed_at) cur.completed += 1;
    if (s.is_paid) cur.paid += 1;
    campaignAgg.set(campaign, cur);
  }
  const byCampaign = Array.from(campaignAgg.entries())
    .map(([name, agg]) => ({
      name,
      ...agg,
      conversion_pct:
        agg.completed === 0
          ? 0
          : Math.round((agg.paid / agg.completed) * 1000) / 10,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // ── By-locale split (ko vs en) ──
  const byLocale = (['ko', 'en'] as const).map((loc) => {
    const all = sessions.filter((s) => s.locale === loc);
    const done = all.filter((s) => s.completed_at);
    const pd = all.filter((s) => s.is_paid);
    return {
      locale: loc,
      sessions: all.length,
      completed: done.length,
      paid: pd.length,
      conversion_pct:
        done.length === 0
          ? 0
          : Math.round((pd.length / done.length) * 1000) / 10,
    };
  });

  // ── Last-7-day timeline (UTC days, oldest first) ──
  const byDay: Array<{ date: string; sessions: number; completed: number; paid: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now - i * DAY);
    const dayStart = Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
    );
    const dayEnd = dayStart + DAY;
    const inDay = sessions.filter(
      (s) => s.started_at >= dayStart && s.started_at < dayEnd,
    );
    const date = new Date(dayStart).toISOString().slice(0, 10);
    byDay.push({
      date,
      sessions: inDay.length,
      completed: inDay.filter((s) => s.completed_at).length,
      paid: inDay.filter((s) => s.is_paid).length,
    });
  }

  // ── Funnel drop-off (in-memory counters, mirrors what the client
  //    sends via /api/funnel/track and what Meta sees as trackCustom). ──
  const funnel = readFunnelCounts();

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      totals: {
        sessions: sessions.length,
        completed: completed.length,
        paid: paid.length,
      },
      rates: {
        completion_pct: completionRate,
        conversion_pct: conversionRate,
      },
      averages: {
        estimated_iq: avgIq,
      },
      recent_sessions_1h: sinceHour.length,
      recent_sessions_24h: sinceDay.length,
      // Last 10 paid orders (most recent first), email masked.
      by_campaign: byCampaign,
      by_locale: byLocale,
      by_day: byDay,
      funnel,
      recent_paid: paid
        .sort((a, b) => (b.paid_at ?? 0) - (a.paid_at ?? 0))
        .slice(0, 10)
        .map((s) => ({
          id: s.id.slice(0, 8),
          locale: s.locale,
          paidAt: s.paid_at ? new Date(s.paid_at).toISOString() : null,
          estimatedIq: s.result?.estimatedIq ?? null,
          emailDomain: s.email ? '*' + s.email.slice(s.email.indexOf('@')) : null,
        })),
      note:
        'In-memory store stats. Numbers reset on Vercel function cold-start. ' +
        'Move to Supabase queries for persistent analytics.',
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
});
