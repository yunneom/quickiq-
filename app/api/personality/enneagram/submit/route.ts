import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_TEST_SUBMIT,
} from '@/lib/rate-limit';
import { scoreEnneagram, ENNEAGRAM_TEST_TYPE } from '@/lib/personality/enneagram';
import type { PersonalityAnswer } from '@/lib/personality/types';

export const runtime = 'nodejs';

interface SubmitBody {
  sessionId: string;
  locale?: string;
  answers: PersonalityAnswer[];
}

export const POST = withErrorHandling('personality/enneagram/submit', async (req: Request) => {
  const bypass =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypass) {
    const rl = checkRateLimit(req, RATE_LIMIT_TEST_SUBMIT);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', resetMs: rl.resetMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } },
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

  const locale = body.locale === 'en' ? 'en' : 'ko';
  const result = scoreEnneagram(body.answers, locale);

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdmin();
    const { data: updated, error } = await admin
      .from('test_sessions')
      .update({
        completed_at: new Date().toISOString(),
        answers: body.answers,
        profile_id: result.profileId,
        axis_scores: result.axisScores,
        test_type: ENNEAGRAM_TEST_TYPE,
      })
      .eq('id', body.sessionId)
      // Guard: never overwrite a completed (or paid) session. Result
      // URLs are shared publicly, so sessionIds leak by design — an
      // unconditional update let anyone destroy a buyer's IQ data by
      // POSTing here with a shared sessionId.
      .is('completed_at', null)
      .eq('is_paid', false)
      .select('id');
    if (error) {
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'already_completed' }, { status: 409 });
    }
  }

  return NextResponse.json({
    sessionId: body.sessionId,
    profileId: result.profileId,
    axisScores: result.axisScores,
  });
});
