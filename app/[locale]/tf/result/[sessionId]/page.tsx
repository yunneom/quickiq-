import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar, type CompatEntry } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import { TF_TEST_TYPE, TF_AXIS_MAX, getTfProfile } from '@/lib/personality/tf';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function TfResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, TF_TEST_TYPE);
  const profile = session?.profile_id
    ? getTfProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const tPct = Math.round(((scores.T ?? 0) / TF_AXIS_MAX) * 100);
  const fPct = Math.round(((scores.F ?? 0) / TF_AXIS_MAX) * 100);
  const bars: ResultBar[] = [
    { label: loc === 'ko' ? '팩폭력 (T)' : 'Fact-power (T)', pct: tPct },
    { label: loc === 'ko' ? '공감력 (F)' : 'Empathy-power (F)', pct: fPct },
  ];

  const compat: CompatEntry[] | undefined = profile.compatibility
    ? Object.entries(profile.compatibility).map(([id, note]) => ({
        name: getTfProfile(id, loc)?.name ?? id,
        note,
      }))
    : undefined;

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-sky-500 to-indigo-600"
      profile={profile}
      bars={bars}
      compat={compat}
      retakeHref={`/${locale}/tf`}
      slug="tf"
      profileId={profile.id}
    />
  );
}
