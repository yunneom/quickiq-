import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_TEST_START,
} from '@/lib/rate-limit';
import {
  DOPAMINE_TEST_TYPE,
  getDopamineQuestions,
} from '@/lib/personality/dopamine';

export const runtime = 'nodejs';

interface StartBody {
  locale?: string;
}

export const POST = withErrorHandling('personality/dopamine/start', async (req: Request) => {
  const bypass =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypass) {
    const rl = checkRateLimit(req, RATE_LIMIT_TEST_START);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'rate_limited', resetMs: rl.resetMs },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } },
      );
    }
  }

  let body: StartBody = {};
  try {
    body = (await req.json()) as StartBody;
  } catch {
    // empty body OK
  }
  const locale = body.locale === 'en' ? 'en' : 'ko';

  if (!isSupabaseConfigured()) {
    // Personality tests skip the in-memory fallback; without Supabase the
    // result page has nothing to look up. Return a stub session id so
    // local dev without DB still exercises the flow.
    return NextResponse.json({
      sessionId: `local-${Date.now()}`,
      questions: getDopamineQuestions(locale),
    });
  }

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from('test_sessions')
    .insert({ locale, test_type: DOPAMINE_TEST_TYPE })
    .select('id')
    .single();
  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: data.id,
    questions: getDopamineQuestions(locale),
  });
});
