import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import { rankAxes } from '@/lib/personality/score';
import {
  ENNEAGRAM_TEST_TYPE,
  ENNEAGRAM_AXES,
  getEnneagramProfile,
} from '@/lib/personality/enneagram';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function EnneagramResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, ENNEAGRAM_TEST_TYPE);
  const profile = session?.profile_id
    ? getEnneagramProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const ranked = rankAxes(scores, ENNEAGRAM_AXES);
  const topScore = ranked[0]?.[1] || 1;
  // Show the top 3 types, scaled so the dominant type reads as 100%.
  const bars: ResultBar[] = ranked.slice(0, 3).map(([axis, score]) => ({
    label: getEnneagramProfile(axis, loc)?.name ?? axis,
    pct: Math.round((score / topScore) * 100),
  }));

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-teal-500 to-emerald-600"
      profile={profile}
      bars={bars}
      retakeHref={`/${locale}/enneagram`}
      slug="enneagram"
      profileId={profile.id}
    />
  );
}
