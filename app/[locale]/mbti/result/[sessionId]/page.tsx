import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar, type CompatEntry } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import { axisPct } from '@/lib/personality/score';
import {
  MBTI_TEST_TYPE,
  MBTI_AXES,
  getMbtiProfile,
} from '@/lib/personality/mbti';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

const POLE_LABELS: Record<'ko' | 'en', Record<string, string>> = {
  ko: {
    E: '외향 E', I: '내향 I',
    S: '감각 S', N: '직관 N',
    T: '사고 T', F: '감정 F',
    J: '계획 J', P: '탐색 P',
  },
  en: {
    E: 'Extravert E', I: 'Introvert I',
    S: 'Sensing S', N: 'Intuition N',
    T: 'Thinking T', F: 'Feeling F',
    J: 'Judging J', P: 'Perceiving P',
  },
};

export default async function MbtiResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, MBTI_TEST_TYPE);
  const profile = session?.profile_id
    ? getMbtiProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const labels = POLE_LABELS[loc];
  const bars: ResultBar[] = MBTI_AXES.map(([high, low]) => {
    const pct = axisPct(scores, high, low);
    return {
      label: `${labels[high]} ${pct}%`,
      rightLabel: `${100 - pct}% ${labels[low]}`,
      pct,
    };
  });

  const compat: CompatEntry[] | undefined = profile.compatibility
    ? Object.entries(profile.compatibility).map(([id, note]) => ({
        name: getMbtiProfile(id, loc)?.name ?? id.toUpperCase(),
        note,
      }))
    : undefined;

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-violet-500 to-indigo-600"
      profile={profile}
      bars={bars}
      compat={compat}
      retakeHref={`/${locale}/mbti`}
    />
  );
}
