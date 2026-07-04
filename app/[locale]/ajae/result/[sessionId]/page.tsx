import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import {
  AJAE_TEST_TYPE,
  AJAE_AXIS_MAX,
  getAjaeProfile,
} from '@/lib/personality/ajae';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function AjaeResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, AJAE_TEST_TYPE);
  const profile = session?.profile_id
    ? getAjaeProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const a = scores.A ?? 0;
  const bars: ResultBar[] = [
    {
      label:
        loc === 'ko'
          ? `아재력 ${a}/${AJAE_AXIS_MAX}점`
          : `Ajae power ${a}/${AJAE_AXIS_MAX}`,
      pct: Math.round((a / AJAE_AXIS_MAX) * 100),
    },
  ];

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-amber-500 to-orange-700"
      profile={profile}
      bars={bars}
      retakeHref={`/${locale}/ajae`}
      slug="ajae"
      profileId={profile.id}
    />
  );
}
