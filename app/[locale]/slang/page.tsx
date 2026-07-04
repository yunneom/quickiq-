import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import { TestFaq } from '@/components/personality/test-faq';
import { getTestEntry } from '@/lib/tests/catalog';

const COPY = {
  ko: {
    eyebrow: 'SLANG QUIZ',
    headline: '틀리면\n70대 할배 판정',
    sub: '신조어·줄임말·은어 15문제.\n당신의 언어 나이, 여기서 판정해 드립니다. 자신 있으면 들어와요.',
    cta: '도전하기 · 무료',
    bullets: [
      '15문항 · 2분 · 정답이 있는 실전 퀴즈',
      '4단계 판정 — 70대 할배부터 알파 만렙까지',
      '결과 카드로 단톡방·부모님께 도발 가능',
      '가입·로그인 없음, 익명 응시',
    ],
    disclaimer: '재미용 테스트 · 실제 나이와 무관합니다.',
  },
  en: {
    eyebrow: 'SLANG QUIZ',
    headline: 'Fail this and\nyou\'re officially 70',
    sub: '15 questions on Korean Gen Z/Alpha slang.\nWe\'ll certify your language age. Enter only if you dare.',
    cta: 'Take the challenge · Free',
    bullets: [
      '15 questions · 2 min · real answers, real stakes',
      '4 ranks — from Certified Grandpa to Gen Alpha Max',
      'Share the result card to provoke the group chat',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Unrelated to your actual age.',
  },
} as const;

export default function SlangLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const t = COPY[loc] ?? COPY.ko;
  const entry = getTestEntry('slang');
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
      <header className="text-xs font-semibold uppercase tracking-widest text-lime-600">
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
              <span className="grid h-6 w-6 place-items-center rounded-full bg-lime-100 text-lime-600">
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
        <Link href={`/${locale}/slang/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
