import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

export const GET = withErrorHandling('test/result', async (req: Request) => {
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data, error } = await admin
        .from('test_sessions')
        .select(
          'id, locale, completed_at, raw_score, estimated_iq, percentile, category_scores, is_paid',
        )
        .eq('id', sessionId)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      if (!data.completed_at) {
        return NextResponse.json({ error: 'not_completed' }, { status: 409 });
      }
      return NextResponse.json({
        sessionId: data.id,
        locale: data.locale,
        isPaid: data.is_paid,
        durationMs: null,
        // A/B variants aren't yet persisted in Supabase — surface an
        // empty map so the client picks the default branch.
        ab: {},
        result: {
          rawScore: data.raw_score,
          total: 30,
          estimatedIq: data.estimated_iq,
          topPercentile: data.percentile,
          categoryScores: data.category_scores,
        },
      });
    } catch (err) {
      console.error('[test/result] Supabase read failed, falling back to memory:', err);
    }
  }

  const session = getSession(sessionId);
  if (!session?.result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  const durationMs =
    session.completed_at && session.started_at
      ? session.completed_at - session.started_at
      : null;
  return NextResponse.json({
    sessionId: session.id,
    locale: session.locale,
    isPaid: Boolean(session.is_paid),
    durationMs,
    ab: session.ab ?? {},
    result: session.result,
  });
});
