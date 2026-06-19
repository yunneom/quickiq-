import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { PersonalityRunner } from '@/components/personality/personality-runner';
import { locales, type Locale } from '@/i18n';

export default function TetoEgenTestPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  return (
    <PersonalityRunner
      locale={locale as 'ko' | 'en'}
      apiBase="/api/personality/teto-egen"
      resultPathBase={`/${locale}/teto-egen/result`}
      requireGender
    />
  );
}
