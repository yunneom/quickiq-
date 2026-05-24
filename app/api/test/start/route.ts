import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/questions';
import { createSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import {
  checkRateLimit,
  isRateLimitDisabled,
  RATE_LIMIT_TEST_START,
} from '@/lib/rate-limit';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

interface StartBody {
  locale?: string;
  utm?: Record<string, string>;
}

export const POST = withErrorHandling('test/start', async (req: Request) => {
  // PRD §3.3 rate limit. Skipped when:
  //   - dev bypass header is set (e2e tests, non-prod environments)
  //   - RATE_LIMIT_DISABLED=1 env (operational kill switch)
  const bypassRateLimit =
    isRateLimitDisabled() ||
    (process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-test-bypass-rate-limit') === '1');
  if (!bypassRateLimit) {
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
    // empty body is fine
  }
  const locale = body.locale === 'en' ? 'en' : 'ko';

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data, error } = await admin
        .from('test_sessions')
        .insert({ locale })
        .select('id')
        .single();
      if (error) throw error;
      return NextResponse.json({
        sessionId: data.id,
        questions: getQuestions(locale),
      });
    } catch (err) {
      console.error('[test/start] Supabase insert failed, falling back to memory:', err);
    }
  }

  const session = createSession(locale);
  // Persist UTM attribution captured by the client (admin uses this for
  // per-campaign conversion reporting). We trust the client value here
  // since it's only for analytics, not auth or pricing.
  if (body.utm && typeof body.utm === 'object') {
    const { updateSession } = await import('@/lib/session-store');
    updateSession(session.id, { utm: body.utm });
  }
  return NextResponse.json({
    sessionId: session.id,
    questions: getQuestions(locale),
  });
});
