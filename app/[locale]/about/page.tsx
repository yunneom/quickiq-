import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getTranslations,
  unstable_setRequestLocale,
} from 'next-intl/server';
import { locales, type Locale } from '@/i18n';

interface PageParams {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageParams): Promise<Metadata> {
  if (!locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      languages: {
        ko: '/ko/about',
        en: '/en/about',
        'x-default': '/ko/about',
      },
    },
  };
}

/**
 * Static SEO landing for the four reasoning domains + the methodology.
 * Boosts E-E-A-T signals (transparent scoring model, named limits)
 * and gives Google a content-dense page to surface for queries like
 * "how is IQ calculated" / "스피어만 G 요인 검사" without competing
 * with the conversion-optimized landing page.
 */
export default async function AboutPage({ params: { locale } }: PageParams) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = await getTranslations('about');

  const sections: Array<{ titleKey: string; bodyKey: string }> = [
    { titleKey: 'verbalTitle', bodyKey: 'verbalBody' },
    { titleKey: 'numericalTitle', bodyKey: 'numericalBody' },
    { titleKey: 'spatialTitle', bodyKey: 'spatialBody' },
    { titleKey: 'logicalTitle', bodyKey: 'logicalBody' },
  ];

  return (
    <article className="mx-auto max-w-md px-5 pb-12 pt-10">
      <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
        {t('title')}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-gray-600">
        {t('subtitle')}
      </p>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          {t('methodologyTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {t('methodologyBody')}
        </p>
      </section>

      <h2 className="mt-10 text-base font-semibold text-gray-900">
        {t('categoriesTitle')}
      </h2>
      <ul className="mt-3 space-y-3">
        {sections.map((s) => (
          <li
            key={s.titleKey}
            className="rounded-2xl border border-gray-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-gray-900">
              {t(s.titleKey)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {t(s.bodyKey)}
            </p>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          {t('limitsTitle')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          {t('limitsBody')}
        </p>
      </section>

      <div className="mt-8 text-center">
        <Link
          href={`/${locale}`}
          className="text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
        >
          ← {t('back')}
        </Link>
      </div>
    </article>
  );
}
