import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/questions';
import { getSession, updateSession } from '@/lib/session-store';
import { scoreSession, type AnswerInput } from '@/lib/scoring';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

interface SubmitBody {
  sessionId: string;
  answers: AnswerInput[];
}

export const POST = withErrorHandling('test/submit', async (req: Request) => {
  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  if (!body.sessionId || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data: session, error: e1 } = await admin
        .from('test_sessions')
        .select('id, locale, completed_at')
        .eq('id', body.sessionId)
        .single();
      if (e1 || !session) {
        return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
      }
      if (session.completed_at) {
        return NextResponse.json({ error: 'already_completed' }, { status: 409 });
      }
      const questions = getQuestions(session.locale);
      const result = scoreSession(questions, body.answers);

      const { error: e2 } = await admin
        .from('test_sessions')
        .update({
          completed_at: new Date().toISOString(),
          answers: body.answers,
          raw_score: result.rawScore,
          estimated_iq: result.estimatedIq,
          percentile: result.topPercentile,
          category_scores: result.categoryScores,
        })
        .eq('id', session.id);
      if (e2) throw e2;

      return NextResponse.json({ result });
    } catch (err) {
      console.error('[test/submit] Supabase update failed, falling back to memory:', err);
    }
  }

  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  }
  if (session.completed_at) {
    return NextResponse.json({ error: 'already_completed' }, { status: 409 });
  }
  const questions = getQuestions(session.locale);
  const result = scoreSession(questions, body.answers);
  updateSession(session.id, {
    answers: body.answers,
    completed_at: Date.now(),
    result,
  });
  return NextResponse.json({ result });
});
