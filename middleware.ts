import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Exclude all opengraph-image route variants (root + per-result dynamic)
  // and other SEO/asset endpoints from i18n middleware.
  matcher: [
    '/((?!api|_next|_vercel|opengraph-image|icon|apple-icon|manifest|.*\\.png|.*\\.jpg|.*\\..*).*)',
  ],
};
