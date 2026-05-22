import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { CheckoutForm } from '@/components/test/checkout-form';
import { locales, type Locale } from '@/i18n';

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
      <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <CheckoutForm sessionId={sessionId} locale={locale as Locale} />
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">{t('secureNote')}</p>
      <p className="mt-1 text-center text-xs text-gray-400">{t('refundPolicy')}</p>
    </div>
  );
}
