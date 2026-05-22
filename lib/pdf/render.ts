import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { ReportPdf } from './report-template';
import type { ScoreResult } from '@/lib/scoring';

export async function renderReportPdf(args: {
  sessionId: string;
  locale: 'ko' | 'en';
  result: ScoreResult;
}): Promise<Buffer> {
  const element = createElement(ReportPdf, {
    sessionId: args.sessionId,
    locale: args.locale,
    result: args.result,
    generatedAt: new Date(),
  });
  // @ts-expect-error renderToBuffer accepts ReactElement at runtime
  return renderToBuffer(element);
}
