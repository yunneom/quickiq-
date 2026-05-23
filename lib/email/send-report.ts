import { Resend } from 'resend';
import * as Sentry from '@sentry/nextjs';
import { renderReportPdf } from '@/lib/pdf/render';
import { getQuestions } from '@/lib/questions';
import { getSession } from '@/lib/session-store';
import type { ScoreResult, AnswerInput } from '@/lib/scoring';
import {
  isSupabaseConfigured,
  createSupabaseAdmin,
} from '@/lib/supabase/server';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? 'report@example.com';

interface SendInput {
  sessionId: string;
  email: string;
  locale: 'ko' | 'en';
  result?: ScoreResult;
}

const subject = (locale: 'ko' | 'en') =>
  locale === 'ko'
    ? '[IQ Test] 상세 리포트가 도착했습니다'
    : '[IQ Test] Your detailed report is ready';

const intro = (locale: 'ko' | 'en') =>
  locale === 'ko'
    ? '안녕하세요! 응시해주셔서 감사합니다. 첨부된 PDF에서 상세 분석을 확인하실 수 있습니다.'
    : 'Thanks for taking the test! Please find your detailed analysis in the attached PDF.';

export async function sendReport(input: SendInput): Promise<void> {
  if (!input.result) {
    console.warn('[email] no result for session', input.sessionId, '— skipping');
    return;
  }

  // Pull the original questions + the buyer's answers so we can embed a
  // per-question breakdown in the PDF. Falls back to the summary-only PDF
  // if the session is gone (e.g. memory cleared by a restart).
  const session = getSession(input.sessionId);
  const questions = getQuestions(input.locale);
  const answers: AnswerInput[] | undefined = session?.answers;

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await renderReportPdf({
      sessionId: input.sessionId,
      locale: input.locale,
      result: input.result,
      questions: answers ? questions : undefined,
      answers,
    });
  } catch (err) {
    console.error('[email] PDF render failed:', err);
    Sentry.captureException(err, { tags: { area: 'email', step: 'pdf' }, extra: { sessionId: input.sessionId } });
  }

  if (!RESEND_KEY) {
    console.log(
      `[email] dev-mode (no RESEND_API_KEY). Would send to ${input.email} — PDF ${pdfBuffer ? `${pdfBuffer.length} bytes` : 'unavailable'}`,
    );
    return;
  }

  try {
    const resend = new Resend(RESEND_KEY);
    const sent = await resend.emails.send({
      from: FROM,
      to: input.email,
      subject: subject(input.locale),
      text: intro(input.locale),
      attachments: pdfBuffer
        ? [
            {
              filename: `iq-report-${input.sessionId}.pdf`,
              content: pdfBuffer.toString('base64'),
            },
          ]
        : undefined,
    });
    await logEmail(input, 'sent', sent?.data?.id, null);
  } catch (err) {
    console.error('[email] resend failed:', err);
    Sentry.captureException(err, { tags: { area: 'email', step: 'send' }, extra: { sessionId: input.sessionId } });
    await logEmail(input, 'failed', null, String(err));
  }
}

async function logEmail(
  input: SendInput,
  status: 'sent' | 'failed',
  resendId: string | null | undefined,
  error: string | null,
) {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createSupabaseAdmin();
    await admin.from('email_logs').insert({
      session_id: input.sessionId,
      email: input.email,
      template: 'report',
      resend_id: resendId ?? null,
      status,
      error,
    });
  } catch (err) {
    console.error('[email] log write failed:', err);
  }
}
