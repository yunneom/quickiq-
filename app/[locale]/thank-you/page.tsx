import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { KakaoChannelButton } from '@/components/test/kakao-channel-button';
import { FunnelBeacon } from '@/components/analytics/funnel-beacon';
import { locales, type Locale } from '@/i18n';

export default async function ThankYouPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { sessionId?: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = await getTranslations('thankYou');

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      <FunnelBeacon event="IQ_PaymentSuccess" />
      <div className="grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl">
        ✅
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">{t('title')}</h1>
      <p className="mt-3 text-gray-600">{t('body')}</p>
      {searchParams.sessionId && (
        <Link
          href={`/${locale}/result/${searchParams.sessionId}`}
          className="mt-8 w-full max-w-xs"
          prefetch
        >
          <Button size="lg" className="w-full">
            {t('viewResult')}
          </Button>
        </Link>
      )}
      <div className="mt-2 w-full max-w-xs">
        <KakaoChannelButton />
      </div>
    </div>
  );
}
