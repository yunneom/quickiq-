import type { MetadataRoute } from 'next';
import { locales } from '@/i18n';

/**
 * Sitemap with hreflang alternates so Google serves the right locale.
 * Each path is emitted once per locale (the canonical URL), and the
 * `alternates.languages` object lists *every* locale's version of that
 * same path — including `x-default` which Google uses when no other
 * hreflang matches the user's Accept-Language.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const now = new Date();
  const paths: Array<{ path: string; priority: number }> = [
    { path: '', priority: 1 },
    { path: '/about', priority: 0.8 },
    { path: '/test', priority: 0.6 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
  ];

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
