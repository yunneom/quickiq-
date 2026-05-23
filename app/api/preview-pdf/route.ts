/**
 * TEMPORARY PDF preview endpoint — REMOVE after Korean-font visual check.
 *
 * Generates a sample PDF from a real (or synthetic) session and returns
 * it as `application/pdf`. Gated by the LS webhook secret in the
 * `x-debug-token` header so only operators can hit it.
 */

import { NextResponse } from 'next/server';
import { renderReportPdf } from '@/lib/pdf/render';
import { getQuestions } from '@/lib/questions';
import { getSession } from '@/lib/session-store';
import { scoreSession, type AnswerInput } from '@/lib/scoring';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = req.headers.get('x-debug-token');
  const expected = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId') ?? 'preview-session';
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'ko';

  // Try to use a real session if provided; otherwise build a synthetic one
  // (24/30 correct → IQ 115, the canonical PRD example).
  const real = getSession(sessionId);
  const questions = getQuestions(locale);
  const answers: AnswerInput[] =
    real?.answers ??
    questions.map((q, i) => ({
      question_id: q.id,
      selected_id: i < 24 ? q.correct_id : 'A',
      time_ms: 5000 + i * 200,
    }));
  const result = real?.result ?? scoreSession(questions, answers);

  const pdf = await renderReportPdf({
    sessionId,
    locale,
    result,
    questions,
    answers,
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="iq-preview-${locale}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
