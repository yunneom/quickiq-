import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ko';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale comes from the segment param (set by the [locale] layout).
  // If it's missing or unknown we fall back to defaultLocale rather than
  // 404-ing — getRequestConfig also runs for routes outside the [locale]
  // segment (e.g. sitemap.xml), and those don't carry a locale value.
  const raw = await requestLocale;
  const locale = locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;
  if (raw && !locales.includes(raw as Locale)) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
