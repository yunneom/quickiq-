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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://7iq.vercel.app';

const subject = (locale: 'ko' | 'en') =>
  locale === 'ko'
    ? '[IQ Test] 상세 리포트가 도착했습니다'
    : '[IQ Test] Your detailed report is ready';

const intro = (locale: 'ko' | 'en') =>
  locale === 'ko'
    ? '안녕하세요! 응시해주셔서 감사합니다. 첨부된 PDF에서 상세 분석을 확인하실 수 있습니다.'
    : 'Thanks for taking the test! Please find your detailed analysis in the attached PDF.';

function htmlBody(locale: 'ko' | 'en', sessionId: string, result?: ScoreResult): string {
  const t = locale === 'ko'
    ? {
        title: 'IQ Test 상세 리포트',
        greet: '안녕하세요!',
        intro: '응시해주셔서 감사합니다. 첨부된 PDF에 상세 분석이 들어있습니다.',
        scoreLabel: '추정 IQ',
        pctLabel: '상위 백분위',
        cta: '결과 페이지 다시 보기',
        footer: '본 점수는 추정치이며 임상적 진단이 아닙니다.',
      }
    : {
        title: 'Your IQ Test Report',
        greet: 'Hi there!',
        intro: 'Thanks for taking the test. Your detailed analysis is in the attached PDF.',
        scoreLabel: 'Estimated IQ',
        pctLabel: 'Top percentile',
        cta: 'View result page',
        footer: 'This is an estimated score, not a clinical diagnosis.',
      };

  const scoreBlock = result
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
         <tr>
           <td style="background:#1d40b8;color:#fff;border-radius:14px;padding:24px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;">
             <div style="font-size:11px;opacity:0.85;letter-spacing:2px;text-transform:uppercase;">${t.scoreLabel}</div>
             <div style="font-size:42px;font-weight:800;margin:6px 0;">${result.estimatedIq}</div>
             <div style="font-size:13px;opacity:0.85;">${t.pctLabel}: ${result.topPercentile}%</div>
           </td>
         </tr>
       </table>`
    : '';

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<title>${t.title}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Apple SD Gothic Neo,sans-serif;color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fafafa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:18px;padding:36px;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:700;letter-spacing:3px;color:#2554e6;text-transform:uppercase;">IQ TEST</div>
              <h1 style="margin:8px 0 16px;font-size:22px;font-weight:700;color:#111827;">${t.title}</h1>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${t.greet}<br>${t.intro}</p>
              ${scoreBlock}
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">${t.footer}</p>
              <div style="margin:24px 0 0;">
                <a href="${APP_URL}/${locale}/result/${sessionId}" style="display:inline-block;background:#2554e6;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;">${t.cta}</a>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:11px;color:#9ca3af;">${APP_URL.replace(/^https?:\/\//, '')}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

  const send = async () => {
    const resend = new Resend(RESEND_KEY);
    return resend.emails.send({
      from: FROM,
      to: input.email,
      subject: subject(input.locale),
      text: intro(input.locale),
      html: htmlBody(input.locale, input.sessionId, input.result),
      attachments: pdfBuffer
        ? [
            {
              filename: `iq-report-${input.sessionId}.pdf`,
              content: pdfBuffer.toString('base64'),
            },
          ]
        : undefined,
    });
  };

  // Resend retry: up to 3 attempts with exponential backoff (1s, 4s).
  // Common transient failures: Resend rate limit, momentary network hiccup
  // in Vercel Function → KR network. We capture *only* the final error
  // so Sentry doesn't get noisy from intermediate retries that succeeded.
  const delays = [0, 1000, 4000];
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
    try {
      const sent = await send();
      await logEmail(input, 'sent', sent?.data?.id, null);
      if (attempt > 0) {
        console.info(`[email] resend recovered on attempt ${attempt + 1}`);
      }
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`[email] resend attempt ${attempt + 1} failed:`, err);
    }
  }

  console.error('[email] resend failed after retries:', lastErr);
  Sentry.captureException(lastErr, {
    tags: { area: 'email', step: 'send', exhausted: 'true' },
    extra: { sessionId: input.sessionId, attempts: delays.length },
  });
  await logEmail(input, 'failed', null, String(lastErr));
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
