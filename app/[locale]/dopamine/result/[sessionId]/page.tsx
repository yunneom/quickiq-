import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import {
  DOPAMINE_TEST_TYPE,
  DOPAMINE_AXIS_MAX,
  getDopamineProfile,
} from '@/lib/personality/dopamine';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function DopamineResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, DOPAMINE_TEST_TYPE);
  const profile = session?.profile_id
    ? getDopamineProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const d = scores.D ?? 0;
  const dPct = Math.round((d / DOPAMINE_AXIS_MAX) * 100);
  const bars: ResultBar[] = [
    {
      label:
        loc === 'ko'
          ? `도파민 지수 ${d}/${DOPAMINE_AXIS_MAX}`
          : `Dopamine index ${d}/${DOPAMINE_AXIS_MAX}`,
      pct: dPct,
    },
  ];

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-orange-500 to-red-600"
      profile={profile}
      bars={bars}
      retakeHref={`/${locale}/dopamine`}
      slug="dopamine"
      profileId={profile.id}
    />
  );
}
