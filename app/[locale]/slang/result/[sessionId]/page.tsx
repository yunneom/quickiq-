import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import {
  SLANG_TEST_TYPE,
  SLANG_AXIS_MAX,
  getSlangProfile,
} from '@/lib/personality/slang';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function SlangResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, SLANG_TEST_TYPE);
  const profile = session?.profile_id
    ? getSlangProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const y = scores.Y ?? 0;
  const bars: ResultBar[] = [
    {
      label:
        loc === 'ko'
          ? `정답 ${y}/${SLANG_AXIS_MAX}개`
          : `Correct ${y}/${SLANG_AXIS_MAX}`,
      pct: Math.round((y / SLANG_AXIS_MAX) * 100),
    },
  ];

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-lime-500 to-emerald-600"
      profile={profile}
      bars={bars}
      retakeHref={`/${locale}/slang`}
      slug="slang"
      profileId={profile.id}
    />
  );
}
