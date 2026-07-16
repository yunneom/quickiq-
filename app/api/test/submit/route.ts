import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/questions';
import { getSession, updateSession } from '@/lib/session-store';
import { scoreSession, type AnswerInput } from '@/lib/scoring';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_TEST_SUBMIT,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';

interface SubmitBody {
  sessionId: string;
  answers: AnswerInput[];
}

export const POST = withErrorHandling('test/submit', async (req: Request) => {
  // Rate-limit submits the same way as starts — keeps abuse against the
  // scoring endpoint bounded even though each submit needs a real session.
  const bypass =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypass) {
    const rl = checkRateLimit(req, RATE_LIMIT_TEST_SUBMIT);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', resetMs: rl.resetMs },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) },
        },
      );
    }
  }

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
      // Do NOT fall back to memory here: in serverless prod the memory
      // store is empty, so the fallback turned a transient DB blip into
      // "session_not_found" for a user who just answered 30 questions —
      // and produced half-sessions that broke the payment flow later.
      // A 503 lets the client retry against the intact DB session.
      console.error('[test/submit] Supabase update failed:', err);
      return NextResponse.json(
        { error: 'temporarily_unavailable' },
        { status: 503, headers: { 'Retry-After': '5' } },
      );
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
