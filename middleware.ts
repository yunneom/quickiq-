import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, type Locale } from './i18n';

// next-intl handles locale-prefixed URLs, cookie persistence, and the
// Accept-Language fallback. `localeDetection: true` reads Accept-Language
// on the first hit; an explicit /ko / /en visit is remembered via the
// NEXT_LOCALE cookie.
const intl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

/** Vercel resolves the visitor's country from the connecting IP. */
function geoLocale(req: NextRequest): Locale | null {
  const country = req.headers.get('x-vercel-ip-country')?.toUpperCase();
  if (!country) return null; // local dev / non-Vercel — let Accept-Language decide
  return country === 'KR' ? 'ko' : 'en';
}

/**
 * Locale resolution order for a URL without a locale prefix:
 *   1. NEXT_LOCALE cookie — an explicit user choice always wins.
 *   2. IP country (x-vercel-ip-country) — KR lands on /ko, everyone else
 *      on /en. Global ad/IG traffic often carries a Korean-less device
 *      language but a decisive IP, and vice versa; IP is the stronger
 *      signal for "which storefront should this visitor see".
 *   3. Accept-Language via next-intl (dev fallback where no geo header).
 *
 * 307 (temporary) redirect on purpose: the destination depends on who is
 * asking, so it must never be cached as permanent.
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocalePrefix = /^\/(ko|en)(\/|$)/.test(pathname);

  if (!hasLocalePrefix && !req.cookies.has('NEXT_LOCALE')) {
    const locale = geoLocale(req);
    if (locale) {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  return intl(req);
}

export const config = {
  // Exclude all opengraph-image route variants (root + per-result dynamic),
  // other SEO/asset endpoints, and the `/r/{code}` short-URL redirect
  // (which derives its own locale from the resolved session) from i18n
  // middleware.
  matcher: [
    '/((?!api|_next|_vercel|admin|opengraph-image|story-image|feed-image|icon|apple-icon|manifest|r/|.*\\.png|.*\\.jpg|.*\\..*).*)',
  ],
};
