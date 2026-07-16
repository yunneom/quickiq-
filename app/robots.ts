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
          // Per-locale conversion paths.
          '/ko/checkout/',
          '/en/checkout/',
          '/ko/thank-you',
          '/en/thank-you',
          // NOTE: /r/ and /{locale}/result/ are deliberately NOT blocked.
          // They are the share destinations — KakaoTalk/Twitter scrapers
          // respect robots.txt, so blocking them stripped the OG preview
          // card from every shared result link. The result pages carry
          // `robots: { index: false }` metadata instead, which keeps them
          // out of search while letting scrapers build the share card.
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
