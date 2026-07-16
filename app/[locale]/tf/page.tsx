import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import { TestFaq } from '@/components/personality/test-faq';
import { getTestEntry } from '@/lib/tests/catalog';
import { makeTestLandingMetadata } from '@/lib/tests/landing-metadata';

export const generateMetadata = makeTestLandingMetadata('tf');

const COPY = {
  ko: {
    eyebrow: 'T or F',
    headline: '"너 T야?"\n오늘도 들었다면',
    sub: '15문항 · 2분이면 끝나는 팩폭력·공감력 분석.\n당신은 팩폭머신? 눈물버튼? 4가지 유형으로 알려드려요.',
    cta: '시작하기 · 무료',
    bullets: [
      '15문항 · 2분',
      '4가지 유형 — 팩폭머신 T부터 눈물버튼 F까지',
      'T지수·F지수 그래프 + 유형별 궁합',
      '가입·로그인 없음, 익명 응시',
    ],
    disclaimer: '재미용 테스트 · 과학적 검사가 아닙니다.',
  },
  en: {
    eyebrow: 'T or F',
    headline: 'Heard "you\'re\nsuch a T" again?',
    sub: 'A 15-question, 2-minute fact-power vs empathy-power analysis.\nFact-Bomber or Tear-Button? Find your type of the four.',
    cta: 'Start · Free',
    bullets: [
      '15 questions · 2 minutes',
      '4 types — Fact-Bomber T to Tear-Button F',
      'T/F score graph + type compatibility',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Not a scientific assessment.',
  },
} as const;

export default function TfLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const t = COPY[loc] ?? COPY.ko;
  const entry = getTestEntry('tf');
  const faqs = entry.faqs?.[loc] ?? [];
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-12">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <header className="text-xs font-semibold uppercase tracking-widest text-sky-600">
        {t.eyebrow}
      </header>

      <div className="mt-10 flex-1">
        <h1 className="whitespace-pre-line text-4xl font-extrabold leading-tight text-gray-900">
          {t.headline}
        </h1>
        <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-gray-600">
          {t.sub}
        </p>

        <ul className="mt-8 space-y-3 text-sm text-gray-700">
          {t.bullets.map((b) => (
            <li key={b} className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-100 text-sky-600">
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
              {b}
            </li>
          ))}
        </ul>

        <p
          className="mt-5 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800"
          role="note"
        >
          ⚠ {t.disclaimer}
        </p>

        {faqs.length > 0 && <TestFaq locale={loc} faqs={faqs} />}
      </div>

      <div className="sticky bottom-0 mt-10 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent pb-2 pt-6">
        <Link href={`/${locale}/tf/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
