import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutForm } from '@/components/test/checkout-form';
import { FunnelBeacon } from '@/components/analytics/funnel-beacon';
import { locales, type Locale } from '@/i18n';

// Conversion path — never index in search results. Each session is
// unique and the URL is meaningless to outside visitors.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params: { locale, sessionId },
}: {
  params: { locale: string; sessionId: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = await getTranslations('checkout');

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-10">
      <FunnelBeacon event="IQ_CheckoutViewed" />
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <CheckoutForm sessionId={sessionId} locale={locale as Locale} />
      </div>

      {/* Refund-policy card. Prominent (own block, not a footnote) so
          pre-purchase anxiety gets answered before the user has to
          search for it. */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {t('refundTitle')}
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-gray-600">
          <li>· {t('refundBullet1')}</li>
          <li>· {t('refundBullet2')}</li>
          <li>· {t('refundBullet3')}</li>
        </ul>
      </section>

      <p className="mt-4 text-center text-xs text-gray-500">{t('secureNote')}</p>
    </div>
  );
}
