import { NextResponse } from 'next/server';
import { renderReportPdf } from '@/lib/pdf/render';
import { getQuestions } from '@/lib/questions';
import { getSession } from '@/lib/session-store';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET /api/test/pdf?sessionId=…
 *
 * Returns the PDF report for an already-paid session. Used by the result
 * page's "download PDF" button (paid state) — backup channel for buyers
 * whose Resend email landed in spam or never arrived.
 *
 * Authorization model: knowledge of the sessionId is the capability. The
 * session_id is a UUID and only the buyer ever sees it (URL + email).
 * is_paid must be true — otherwise this would be a free-PDF leak.
 */
export const GET = withErrorHandling('test/pdf', async (req: Request) => {
  const sessionId = new URL(req.url).searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 });
  }
  const session = getSession(sessionId);
  if (!session || !session.result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!session.is_paid) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }

  const questions = getQuestions(session.locale);
  const pdf = await renderReportPdf({
    sessionId,
    locale: session.locale,
    result: session.result,
    questions,
    answers: session.answers,
  });

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="iq-report-${sessionId.slice(0, 8)}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
});
