import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';
import { PERSONALITY_REGISTRY } from '@/lib/personality/registry';

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
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const now = new Date();

  const staticPaths: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1 },
    { path: '/tests', priority: 0.95 },
    { path: '/about', priority: 0.8 },
    { path: '/iq', priority: 0.9 },
    { path: '/mbti', priority: 0.9 },
    { path: '/teto-egen', priority: 0.9 },
    { path: '/attachment', priority: 0.9 },
    { path: '/love-lang', priority: 0.9 },
    { path: '/enneagram', priority: 0.9 },
    { path: '/test', priority: 0.6 },
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
