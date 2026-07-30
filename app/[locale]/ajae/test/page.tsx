import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { PersonalityRunner } from '@/components/personality/personality-runner';
import { locales, type Locale } from '@/i18n';

// Runner pages are pure app UI with no indexable content, and inheriting
// the layout's canonical made every one of them claim to BE the homepage.
export const metadata = {
  robots: { index: false, follow: true },
};


export default function AjaeTestPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  return (
    <PersonalityRunner
      locale={locale as 'ko' | 'en'}
      apiBase="/api/personality/ajae"
      resultPathBase={`/${locale}/ajae/result`}
    />
  );
}
