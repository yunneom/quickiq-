import { getOrCreateInsight, type AiInsightRecord, type InsightLocale } from '@/lib/ai/insight';
import type { PersonalityProfile } from '@/lib/personality/types';

interface Props {
  locale: InsightLocale;
  sessionId: string;
  cached: AiInsightRecord | null | undefined;
  testName: string;
  profile: PersonalityProfile;
  axisLines: string[];
}

const COPY = {
  ko: {
    title: '당신만을 위한 한마디',
    eyebrow: 'AI 개인 해설',
    note: '응답 패턴을 바탕으로 생성된 재미용 해설이에요 · 진단이 아닙니다',
  },
  en: {
    title: 'A note just for you',
    eyebrow: 'AI insight',
    note: 'Generated from your answer pattern for fun · not an assessment',
  },
} as const;

/**
 * Async server component — render inside <Suspense> so the rest of the
 * result page streams first and this section fills in when the model
 * responds (cached sessions resolve instantly). Renders nothing when the
 * feature is disabled or generation fails.
 */
export async function AiInsight({ locale, sessionId, cached, testName, profile, axisLines }: Props) {
  const items = await getOrCreateInsight(sessionId, cached, {
    locale,
    testName,
    profile,
    axisLines,
  });
  if (!items) return null;
  const c = COPY[locale];
  return (
    <section
      className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/60 p-5"
      data-testid="ai-insight"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-700">{c.eyebrow}</p>
      <h2 className="mt-1 text-base font-bold text-gray-900">{c.title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((line) => (
          <li key={line} className="flex gap-2 text-sm leading-relaxed text-gray-800">
            <span aria-hidden className="text-brand-500">✦</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-gray-500">ⓘ {c.note}</p>
    </section>
  );
}
