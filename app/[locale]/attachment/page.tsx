import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import { TestFaq } from '@/components/personality/test-faq';
import { getTestEntry } from '@/lib/tests/catalog';

const COPY = {
  ko: {
    eyebrow: 'ATTACHMENT STYLE',
    headline: '왜 나는 늘\n비슷한 연애를 할까?',
    sub: '16문항 · 3분이면 끝나는 애착 유형 분석.\n당신의 연애 패턴, 4가지 유형으로 풀어드려요.',
    cta: '시작하기 · 무료',
    bullets: [
      '16문항 · 3분',
      '4가지 애착 유형 — 안정·불안·회피·혼란',
      '불안도·회피도 그래프 + 궁합',
      '응시·로그인 정보 없음',
    ],
    disclaimer: '재미용 테스트 · 과학적 진단이 아닙니다.',
  },
  en: {
    eyebrow: 'ATTACHMENT STYLE',
    headline: 'Why do I keep\ndating the same way?',
    sub: 'A 16-question, 3-minute attachment-style analysis.\nUnpack your love pattern across 4 types.',
    cta: 'Start · Free',
    bullets: [
      '16 questions · 3 minutes',
      '4 styles — secure, anxious, avoidant, fearful',
      'Anxiety/avoidance graph + compatibility',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Not a scientific assessment.',
  },
} as const;

export default function AttachmentLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const t = COPY[loc] ?? COPY.ko;
  const entry = getTestEntry('attachment');
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
      <header className="text-xs font-semibold uppercase tracking-widest text-rose-600">
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
              <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-100 text-rose-600">
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
        <Link href={`/${locale}/attachment/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
