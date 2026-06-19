import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { UtmCapture } from '@/components/analytics/utm-capture';
import { LocaleSwitcher } from '@/components/landing/locale-switcher';
import { TEST_CATALOG } from '@/lib/tests/catalog';
import { locales, type Locale } from '@/i18n';

const HUB_COPY = {
  ko: {
    brand: 'QUICKIQ',
    headline: '당신을 알아가는\n6가지 테스트',
    sub: '무료 응시 · 결과 즉시 확인\n로그인·이메일 입력 없이 익명으로 진행',
    timeLabel: (m: number) => `${m}분`,
    qLabel: (n: number) => `${n}문항`,
    cta: '응시하기',
    disclaimer: '⚠ 모든 테스트는 추정·재미 목적이며 임상 진단이 아닙니다.',
    footerAbout: 'About',
    footerPrivacy: '개인정보',
    footerTerms: '이용약관',
  },
  en: {
    brand: 'QUICKIQ',
    headline: '6 tests to\nknow yourself',
    sub: 'Free · Instant results\nAnonymous · no sign-up, no email',
    timeLabel: (m: number) => `${m} min`,
    qLabel: (n: number) => `${n} Q`,
    cta: 'Start',
    disclaimer: '⚠ All tests are for estimation/entertainment, not a clinical diagnosis.',
    footerAbout: 'About',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
  },
} as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const c = HUB_COPY[locale as 'ko' | 'en'] ?? HUB_COPY.ko;
  const title =
    locale === 'en'
      ? 'QuickIQ — 6 personality & cognitive tests'
      : 'QuickIQ — 6가지 성격·인지 테스트';
  return {
    title,
    description: c.sub.replace(/\n/g, ' '),
    alternates: {
      languages: { ko: '/ko', en: '/en', 'x-default': '/ko' },
    },
  };
}

/**
 * Multi-test hub — replaces the IQ-only landing now that the suite has
 * fanned out to 6 tests. The IQ landing moved to /[locale]/iq; all other
 * tests already live at their own slug. Card order is curated by market
 * fit: famous tests first (MBTI, Teto/Egen, Attachment), then niche.
 */
export default function HubPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const c = HUB_COPY[loc];

  return (
    <>
      <MetaPixel />
      <UtmCapture />
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-12">
        <header className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">
          {c.brand}
        </header>

        <div className="mt-8">
          <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight text-gray-900">
            {c.headline}
          </h1>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {c.sub}
          </p>
        </div>

        <ul className="mt-8 flex-1 space-y-3">
          {TEST_CATALOG.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/${locale}/${t.slug}`}
                prefetch
                className="group block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-md"
                data-testid={`hub-card-${t.slug}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-2xl ${t.accentBg}`}
                  >
                    {t.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${t.accentText}`}>
                        {t.eyebrow}
                      </p>
                      <p className="flex-shrink-0 text-[11px] font-medium text-gray-400">
                        {c.timeLabel(t.minutes)} · {c.qLabel(t.questions)}
                      </p>
                    </div>
                    <p className="mt-1 text-base font-bold text-gray-900">
                      {t.title[loc]}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">
                      {t.tagline[loc]}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="self-center text-lg text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500"
                  >
                    →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <p className="text-center text-[11px] leading-relaxed text-gray-500">
            {c.disclaimer}
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
            <Link href={`/${locale}/tests`} className="underline-offset-2 hover:underline">
              {locale === 'en' ? 'All tests' : '전체 테스트'}
            </Link>
            <Link href={`/${locale}/about`} className="underline-offset-2 hover:underline">
              {c.footerAbout}
            </Link>
            <Link href={`/${locale}/privacy`} className="underline-offset-2 hover:underline">
              {c.footerPrivacy}
            </Link>
            <Link href={`/${locale}/terms`} className="underline-offset-2 hover:underline">
              {c.footerTerms}
            </Link>
          </div>
          <LocaleSwitcher />
        </div>
      </div>
    </>
  );
}
