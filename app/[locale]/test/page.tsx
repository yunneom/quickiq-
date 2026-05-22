import { unstable_setRequestLocale } from 'next-intl/server';
import { TestRunner } from '@/components/test/test-runner';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n';

export default function TestPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  return <TestRunner locale={locale as Locale} />;
}
