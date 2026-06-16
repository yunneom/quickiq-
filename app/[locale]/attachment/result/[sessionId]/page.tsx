import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { PersonalityResult, type ResultBar, type CompatEntry } from '@/components/personality/personality-result';
import { fetchPersonalitySession } from '@/lib/personality/session';
import {
  ATTACHMENT_TEST_TYPE,
  ATTACHMENT_AXIS_MAX,
  getAttachmentProfile,
} from '@/lib/personality/attachment';

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function AttachmentResultPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const notFoundCopy = loc === 'ko' ? '결과를 찾을 수 없습니다.' : 'Result not found.';

  const session = await fetchPersonalitySession(sessionId, ATTACHMENT_TEST_TYPE);
  const profile = session?.profile_id
    ? getAttachmentProfile(session.profile_id, loc)
    : undefined;

  if (!session || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center text-gray-500">
        {notFoundCopy}
      </div>
    );
  }

  const scores = session.axis_scores ?? {};
  const anxPct = Math.round(((scores.ANX ?? 0) / ATTACHMENT_AXIS_MAX) * 100);
  const avoPct = Math.round(((scores.AVO ?? 0) / ATTACHMENT_AXIS_MAX) * 100);
  const bars: ResultBar[] = [
    { label: loc === 'ko' ? '불안도' : 'Anxiety', pct: anxPct },
    { label: loc === 'ko' ? '회피도' : 'Avoidance', pct: avoPct },
  ];

  const compat: CompatEntry[] | undefined = profile.compatibility
    ? Object.entries(profile.compatibility).map(([id, note]) => ({
        name: getAttachmentProfile(id, loc)?.name ?? id,
        note,
      }))
    : undefined;

  return (
    <PersonalityResult
      locale={loc}
      gradientClass="from-rose-500 to-pink-600"
      profile={profile}
      bars={bars}
      compat={compat}
      retakeHref={`/${locale}/attachment`}
    />
  );
}
