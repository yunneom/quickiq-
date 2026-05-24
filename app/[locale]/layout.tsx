import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { notFound } from 'next/navigation';
import { CookieBanner } from '@/components/consent/cookie-banner';
import { GatedAnalytics } from '@/components/consent/gated-analytics';

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
        <NextIntlClientProvider messages={messages}>
          <main className="min-h-screen safe-top safe-bottom">{children}</main>
          <CookieBanner />
        </NextIntlClientProvider>
        <GatedAnalytics />
      </body>
    </html>
  );
}
