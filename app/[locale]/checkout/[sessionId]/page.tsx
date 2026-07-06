import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutForm } from '@/components/test/checkout-form';
import { FunnelBeacon } from '@/components/analytics/funnel-beacon';
import { getBusinessInfo } from '@/lib/legal/business';
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
  const biz = getBusinessInfo();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-10">
      <FunnelBeacon event="IQ_CheckoutViewed" />
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <CheckoutForm sessionId={sessionId} locale={locale as Locale} />
      </div>

      {/* Product + delivery — 전자상거래법 상품정보·제공시기 고지
          (KakaoPay review #3: 상품 상세페이지 내 서비스 제공기간 명시). */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {t('productTitle')}
        </p>
        <p className="mt-1.5 text-[12px] font-medium text-gray-800">
          {t('productName')} — {t('priceLabel')}
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {t('serviceTitle')}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
          {t('serviceBody')}
        </p>
      </section>

      {/* Withdrawal + refund policy. Prominent (own block, not a footnote)
          so pre-purchase anxiety gets answered before the user has to
          search for it — and to satisfy the merchant review. */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {t('refundTitle')}
        </p>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-gray-600">
          <li>· {t('refundBullet1')}</li>
          <li>· {t('refundBullet2')}</li>
          <li>· {t('refundBullet3')}</li>
        </ul>
        {biz && (
          <p className="mt-2 text-[11px] font-medium text-gray-700">
            {t('refundContact', { email: biz.email })}
          </p>
        )}
      </section>

      <p className="mt-4 text-center text-xs text-gray-500">{t('secureNote')}</p>
    </div>
  );
}
