import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { ReportPdf } from './report-template';
import type { ScoreResult, AnswerInput } from '@/lib/scoring';
import type { Question } from '@/lib/questions/types';

export async function renderReportPdf(args: {
  sessionId: string;
  locale: 'ko' | 'en';
  result: ScoreResult;
  /** Optional — when present, the PDF includes a per-question breakdown page. */
  questions?: Question[];
  answers?: AnswerInput[];
}): Promise<Buffer> {
  const element = createElement(ReportPdf, {
    sessionId: args.sessionId,
    locale: args.locale,
    result: args.result,
    generatedAt: new Date(),
    questions: args.questions,
    answers: args.answers,
  });
  // @ts-expect-error renderToBuffer accepts ReactElement at runtime
  return renderToBuffer(element);
}
