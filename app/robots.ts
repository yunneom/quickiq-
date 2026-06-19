import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

/**
 * robots.txt — defense in depth. Conversion paths and admin surfaces
 * already carry `robots: noindex` metadata, but a well-behaved crawler
 * shouldn't even hit them: that saves crawl budget for the pages we
 * actually want indexed (/, /about), and keeps the admin/result URLs
 * out of any aggregator caches.
 *
 * Per-locale variants (/ko/checkout, /en/checkout) are covered by the
 * trailing-slash-less prefix matchers.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/checkout',
          '/checkout/',
          '/thank-you',
          // Short-URL redirects → result pages. Already noindex
          // downstream but tell crawlers up-front.
          '/r/',
          // Per-locale conversion paths.
          '/ko/checkout/',
          '/en/checkout/',
          '/ko/thank-you',
          '/en/thank-you',
          // Per-session result URLs — unique to each buyer; never
          // useful to index.
          '/ko/result/',
          '/en/result/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
