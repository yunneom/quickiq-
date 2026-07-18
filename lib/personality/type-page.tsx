import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { TypeDetail } from '@/components/personality/type-detail';
import { TEST_CATALOG, getTestEntry } from '@/lib/tests/catalog';
import { getRegistryEntry } from '@/lib/personality/registry';
import { locales, type Locale } from '@/i18n';

/**
 * Factory helpers so each programmatic type route
 * (app/[locale]/<slug>/types/[type]) is a 3-line file. Keeps
 * generateStaticParams / generateMetadata / the page component identical
 * across all 5 personality tests while letting Next statically read each
 * export per route module.
 */

interface TypeParams {
  params: { locale: string; type: string };
}

/** All (locale × type) combos for a test → fully static pre-render. */
export function makeTypeStaticParams(slug: string) {
  return async function generateStaticParams() {
    const entry = getRegistryEntry(slug);
    if (!entry) return [];
    // Profile ids are locale-independent, so read the ko pool for the list.
    const ids = entry.getAll('ko').map((p) => p.id);
    return locales.flatMap((locale) => ids.map((type) => ({ locale, type })));
  };
}

export function makeTypeMetadata(slug: string) {
  return async function generateMetadata({
    params: { locale, type },
  }: TypeParams): Promise<Metadata> {
    if (!locales.includes(locale as Locale)) return {};
    const reg = getRegistryEntry(slug);
    const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
    const profile = reg?.getProfile(type, loc);
    if (!profile) return {};
    const catalog = getTestEntry(slug as never);
    const title = `${profile.name} — ${catalog.title[loc]} | QuickIQ`;
    return {
      title,
      description: profile.tagline,
      alternates: {
        languages: {
          ko: `/ko/${slug}/types/${type}`,
          en: `/en/${slug}/types/${type}`,
          'x-default': `/ko/${slug}/types/${type}`,
        },
      },
    };
  };
}

export function makeTypePage(slug: string) {
  return function TypePage({ params: { locale, type } }: TypeParams) {
    if (!locales.includes(locale as Locale)) notFound();
    unstable_setRequestLocale(locale);
    const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';

    const reg = getRegistryEntry(slug);
    const profile = reg?.getProfile(type, loc);
    if (!reg || !profile) notFound();

    const entry = getTestEntry(slug as never);
    const siblings = reg.getAll(loc);
    // Cross-promote 3 other tests. Deterministic per (slug, type) rotation
    // — the old fixed slice(0, 3) sent every one of the ~108 type pages'
    // internal links to the same three tests, starving the rest (and the
    // IQ landing) of link equity. Hash keeps output static per page.
    const pool = TEST_CATALOG.filter((t) => t.slug !== slug);
    const seed = (slug + type)
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const crossTests = [0, 1, 2].map((i) => pool[(seed + i) % pool.length]);

    return (
      <TypeDetail
        locale={loc}
        slug={slug}
        entry={entry}
        profile={profile}
        siblings={siblings}
        crossTests={crossTests}
      />
    );
  };
}
