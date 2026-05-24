import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

// `localeDetection: true` makes next-intl read Accept-Language on the
// first hit and redirect to /ko vs /en automatically. Korean carriers
// usually send `ko-KR,en-US;q=0.9` so KR users land on /ko by default,
// English browsers land on /en. Users can override by typing /ko or
// /en explicitly — the choice is then remembered via a cookie.
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  // Exclude all opengraph-image route variants (root + per-result dynamic)
  // and other SEO/asset endpoints from i18n middleware.
  matcher: [
    '/((?!api|_next|_vercel|opengraph-image|story-image|icon|apple-icon|manifest|.*\\.png|.*\\.jpg|.*\\..*).*)',
  ],
};
