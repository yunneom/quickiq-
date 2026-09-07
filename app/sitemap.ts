import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { PERSONALITY_REGISTRY } from '@/lib/personality/registry';
import { TEST_CATALOG } from '@/lib/tests/catalog';
import { getSiteUrl } from '@/lib/site-url';

/**
 * lastmod is a claim about CONTENT, and Google only keeps trusting it
 * while it stays true. A build-time clock made every one of the 138 URLs
 * "modified" on every deploy — several times a day on this repo — which
 * is indistinguishable from a sitemap that lies, and a crawler that has
 * stopped believing lastmod has one less reason to come back. So this is
 * a date, set by hand, bumped only when the pages' content or linking
 * actually changes (e.g. the type-index grid added to every landing).
 */
const LASTMOD = new Date('2026-09-04T00:00:00Z');

/**
 * Sitemap with hreflang alternates so Google serves the right locale.
 * Each path is emitted once per locale (the canonical URL), and the
 * `alternates.languages` object lists *every* locale's version of that
 * same path — including `x-default` which Google uses when no other
 * hreflang matches the user's Accept-Language.
 *
 * Beyond the static marketing/test paths, this enumerates every
 * programmatic per-type page (e.g. /ko/mbti/types/intj). That content
 * architecture is the SEO growth engine the benchmark relies on — each
 * result type is a long-tail landing page, multiplying surface area
 * without new hand-written pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = LASTMOD;

  const staticPaths: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1 },
    { path: '/tests', priority: 0.95 },
    { path: '/about', priority: 0.8 },
    // Test landings derive from the catalog so a newly added test can
    // never be missing from the sitemap again (the hand-written list
    // silently dropped 4 of the 10).
    ...TEST_CATALOG.map((t) => ({ path: `/${t.slug}`, priority: 0.9 })),
    // '/test' and the per-test runners are noindex — advertising them
    // here would contradict their own robots directive.
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
  ];

  // Programmatic per-type pages — one per (slug × profile id).
  const typePaths: Array<{ path: string; priority: number }> = Object.entries(
    PERSONALITY_REGISTRY,
  ).flatMap(([slug, reg]) =>
    reg.getAll('ko').map((p) => ({
      path: `/${slug}/types/${p.id}`,
      priority: 0.7,
    })),
  );

  const paths = [...staticPaths, ...typePaths];

  return locales.flatMap((locale) =>
    paths.map(({ path, priority }) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority,
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}${path}`]),
          ),
          'x-default': `${base}/ko${path}`,
        },
      },
    })),
  );
}
