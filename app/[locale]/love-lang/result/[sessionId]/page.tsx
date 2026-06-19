import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import { rankAxes } from '@/lib/personality/score';
import {
  LOVE_LANG_TEST_TYPE,
  LOVE_LANG_AXES,
  getLoveLangProfile,
} from '@/lib/personality/love-lang';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function LoveLangResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, LOVE_LANG_TEST_TYPE);
  const profile = session?.profile_id
    ? getLoveLangProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const total = LOVE_LANG_AXES.reduce((sum, a) => sum + (scores[a] ?? 0), 0) || 1;
  // All 5 languages ranked high → low, as percentage of total answers.
  const bars: ResultBar[] = rankAxes(scores, LOVE_LANG_AXES).map(([axis, score]) => ({
    label: getLoveLangProfile(axis, loc)?.name ?? axis,
    pct: Math.round((score / total) * 100),
  }));

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-red-500 to-rose-600"
      profile={profile}
      bars={bars}
      retakeHref={`/${locale}/love-lang`}
      slug="love-lang"
      profileId={profile.id}
    />
  );
}
