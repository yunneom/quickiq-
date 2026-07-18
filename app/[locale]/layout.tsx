import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { notFound } from 'next/navigation';
import { CookieBanner } from '@/components/consent/cookie-banner';
import { GatedAnalytics } from '@/components/consent/gated-analytics';
import { AdsenseScript } from '@/components/ads/adsense-script';
import { BusinessFooter } from '@/components/legal/business-footer';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { UtmCapture } from '@/components/analytics/utm-capture';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!locales.includes(params.locale as Locale)) notFound();
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return {
    metadataBase: new URL(base),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: params.locale === 'en' ? 'en_US' : 'ko_KR',
      url: `${base}/${params.locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
    // Canonical + hreflang for the locale root. Child routes inherit
    // the metadataBase + provide their own canonical when needed (e.g.
    // /about has its own generateMetadata).
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        ko: '/ko',
        en: '/en',
        'x-default': '/ko',
      },
    },
    appleWebApp: {
      capable: true,
      title: 'IQ Test',
      statusBarStyle: 'default',
    },
    formatDetection: {
      telephone: false,
    },
    // Google Search Console — HTML-tag verification for the preview URL
    // property. Survives middleware redirects from bare "/" to /ko or /en
    // because both locale layouts emit the same tag. Safe to keep in
    // production: it just proves ownership, no analytics or tracking.
    verification: {
      google: '0QJZai3TbosSlkFY-Qf3_TdyJe7ZPf7bF7jDR6pgXd0',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#2554e6',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  // Read the skip-link label from the message tree directly so we can
  // render it in plain HTML (no useTranslations hook in a server file).
  const skipLabel =
    (messages as unknown as { errors?: { skipToContent?: string } }).errors
      ?.skipToContent ?? 'Skip to content';
  return (
    <html lang={locale}>
      <head>
        {/* DNS prefetch for fonts CDN (used by edge OG image route) and
            Lemon Squeezy checkout (loaded only on the checkout step). */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://app.lemonsqueezy.com" />
        {/* Preload the brand-color theme so it paints with the first byte
            of HTML on iOS Safari (improves LCP visual stability). */}
        <meta name="theme-color" content="#2554e6" />
      </head>
      <body className="font-sans">
        {/* Skip-to-content link — visible only when keyboard-focused
            (see .skip-to-content in globals.css). Keyboard users can
            tab past the cookie banner / sticky CTA into the test. */}
        <a href="#main-content" className="skip-to-content">
          {skipLabel}
        </a>
        <NextIntlClientProvider messages={messages}>
          <main
            id="main-content"
            className="min-h-screen safe-top safe-bottom"
          >
            {children}
          </main>
          {/* 전자상거래법 제13조 사업자정보 — every page bottom. Renders
              nothing until NEXT_PUBLIC_BIZ_* env vars are set. */}
          <BusinessFooter locale={locale === 'en' ? 'en' : 'ko'} />
          <CookieBanner />
        </NextIntlClientProvider>
        <GatedAnalytics />
        <AdsenseScript />
        {/* Pixel + UTM capture were mounted on only 2 landing pages, so ads
            landing on /mbti etc. and the post-payment /thank-you hard load
            sent nothing to Meta. Layout mount = every page measured. */}
        <MetaPixel />
        <UtmCapture />
      </body>
    </html>
  );
}
