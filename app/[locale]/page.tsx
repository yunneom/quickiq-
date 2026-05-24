import Link from 'next/link';
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { UtmCapture } from '@/components/analytics/utm-capture';
import { SocialProof } from '@/components/landing/social-proof';
import { ReportPreview } from '@/components/landing/report-preview';
import {
  FaqLD,
  OrganizationLD,
  ProductLD,
  WebsiteLD,
} from '@/components/seo/json-ld';
import { Faq } from '@/components/landing/faq';
import { LocaleSwitcher } from '@/components/landing/locale-switcher';

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('landing');
  const tMeta = await getTranslations('meta');
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://7iq.vercel.app';
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  // Reach into the raw message tree to pull the FAQ array for JSON-LD
  // — `getTranslations` can't iterate unknown-length lists.
  const messages = (await getMessages()) as unknown as {
    landing?: { faqs?: Array<{ q: string; a: string }> };
  };
  const faqs = messages?.landing?.faqs ?? [];
  // A/B variant: set NEXT_PUBLIC_LANDING_VARIANT=b on Vercel to swap.
  // Defaults to 'a' for stable copy under live traffic.
  const variant = process.env.NEXT_PUBLIC_LANDING_VARIANT === 'b' ? 'b' : 'a';
  const headline = variant === 'b' ? t('variantB.headline') : t('headline');
  const sub = variant === 'b' ? t('variantB.sub') : t('sub');
  const cta = variant === 'b' ? t('variantB.cta') : t('cta');

  return (
    <>
      <OrganizationLD name="IQ Test" url={base} locale={loc} />
      <WebsiteLD name="IQ Test" url={base} locale={loc} />
      <ProductLD
        name={tMeta('title')}
        description={tMeta('description')}
        url={base}
        priceKRW={Number(process.env.NEXT_PUBLIC_PRICE_KRW ?? 9900)}
        locale={loc}
      />
      {faqs.length > 0 && <FaqLD faqs={faqs} />}
      <MetaPixel />
      <UtmCapture />
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-12">
        <header className="text-sm font-semibold tracking-wide text-brand-600">
          IQ TEST
        </header>

        <div className="mt-10 flex-1">
          <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight text-gray-900">
            {headline}
          </h1>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-gray-600">
            {sub}
          </p>

          <ul className="mt-8 space-y-3 text-sm text-gray-700">
            <Trust>{t('trustOne')}</Trust>
            <Trust>{t('trustTwo')}</Trust>
            <Trust>{t('trustThree')}</Trust>
          </ul>

          <SocialProof />

          <ReportPreview />

          <Faq />
        </div>

        <div className="sticky bottom-0 mt-10 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent pb-2 pt-6">
          <Link href={`/${locale}/test`} prefetch>
            <Button size="lg" className="w-full" data-testid="cta-start">
              {cta}
            </Button>
          </Link>
          <p className="mt-3 text-center text-xs text-gray-500">
            {t('disclaimer')}
          </p>
          <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
            <Link href={`/${locale}/about`} className="underline-offset-2 hover:underline">
              About
            </Link>
            <Link href={`/${locale}/privacy`} className="underline-offset-2 hover:underline">
              {t('footerPrivacy')}
            </Link>
            <Link href={`/${locale}/terms`} className="underline-offset-2 hover:underline">
              {t('footerTerms')}
            </Link>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </>
  );
}

function Trust({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-brand-600">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 10.5l4 4 8-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {children}
    </li>
  );
}
