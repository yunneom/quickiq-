import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_TEST_START,
} from '@/lib/rate-limit';
import {
  ENNEAGRAM_TEST_TYPE,
  getEnneagramQuestions,
} from '@/lib/personality/enneagram';

export const runtime = 'nodejs';

interface StartBody {
  locale?: string;
}

export const POST = withErrorHandling('personality/enneagram/start', async (req: Request) => {
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
    return NextResponse.json({
      sessionId: `local-${Date.now()}`,
      questions: getEnneagramQuestions(locale),
    });
  }

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from('test_sessions')
    .insert({ locale, test_type: ENNEAGRAM_TEST_TYPE })
    .select('id')
    .single();
  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: data.id,
    questions: getEnneagramQuestions(locale),
  });
});
