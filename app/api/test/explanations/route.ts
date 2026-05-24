import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { getQuestionById } from '@/lib/questions';
import { getSession } from '@/lib/session-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/test/explanations?sessionId=…
 *
 * Per-question breakdown for the paid result page accordion. Mirrors
 * the PDF report's 30-question section but inline, so users get
 * instant gratification (and we cut down on "where's my PDF?" emails
 * during the 30-second Resend delivery window).
 *
 * Authorization: same capability-token model as /api/test/pdf — the
 * sessionId UUID is private to the buyer, and is_paid must be true
 * or we'd leak explanations for free.
 */
export const GET = withErrorHandling('test/explanations', async (req: Request) => {
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 });
  }
  const session = getSession(sessionId);
  if (!session?.result || !session.answers) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!session.is_paid) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }

  // Stitch question text + chosen answer + correct answer + explanation
  // per row. Anything we can't resolve (stale question id, drift) is
  // skipped — clients show the rest of the list rather than erroring.
  const rows = session.answers
    .map((a) => {
      const q = getQuestionById(a.question_id);
      if (!q) return null;
      return {
        order_index: q.order_index,
        category: q.category,
        question_text: q.question_text,
        difficulty: q.difficulty,
        chosen: a.selected_id,
        correct: q.correct_id,
        is_correct: a.selected_id === q.correct_id,
        explanation: q.explanation,
        time_ms: a.time_ms,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.order_index - b.order_index);

  return NextResponse.json(
    { rows },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
});
