import { NextResponse } from 'next/server';
import { getQuestions } from '@/lib/questions';
import { createSession } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMIT_TEST_START } from '@/lib/rate-limit';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';

interface StartBody {
  locale?: string;
}

export const POST = withErrorHandling('test/start', async (req: Request) => {
  // PRD §3.3 — 10 starts per IP per hour.
  // Tests bypass via header so e2e suite isn't blocked by retries.
  const bypassRateLimit =
    process.env.NODE_ENV !== 'production' &&
    req.headers.get('x-test-bypass-rate-limit') === '1';
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
  return NextResponse.json({
    sessionId: session.id,
    questions: getQuestions(locale),
  });
});
