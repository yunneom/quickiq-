import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import { TestFaq } from '@/components/personality/test-faq';
import { getTestEntry } from '@/lib/tests/catalog';
import { makeTestLandingMetadata } from '@/lib/tests/landing-metadata';

export const generateMetadata = makeTestLandingMetadata('dopamine');

const COPY = {
  ko: {
    eyebrow: 'DOPAMINE',
    headline: '"5분만 봐야지"가\n새벽 2시가 되는 당신',
    sub: '15문항 · 2분이면 끝나는 도파민 의존도 점검.\n수도승부터 도파민 노예까지, 당신의 레벨은?',
    cta: '시작하기 · 무료',
    bullets: [
      '15문항 · 2분',
      '4단계 — 수도승 · 밸런스 장인 · 헌터 · 노예',
      '도파민 지수 0~45점 그래프',
      '가입·로그인 없음, 익명 응시',
    ],
    disclaimer: '재미용 테스트 · 의학적 진단이 아닙니다.',
  },
  en: {
    eyebrow: 'DOPAMINE',
    headline: 'When "just 5 minutes"\nbecomes 2am',
    sub: 'A 15-question, 2-minute dopamine-dependence audit.\nFrom Monk to Goblin — what\'s your level?',
    cta: 'Start · Free',
    bullets: [
      '15 questions · 2 minutes',
      '4 levels — Monk · Artisan · Hunter · Goblin',
      'Dopamine index graph (0–45)',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Not a medical diagnosis.',
  },
} as const;

export default function DopamineLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const t = COPY[loc] ?? COPY.ko;
  const entry = getTestEntry('dopamine');
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
      <header className="text-xs font-semibold uppercase tracking-widest text-orange-600">
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
              <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-100 text-orange-600">
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
        <Link href={`/${locale}/dopamine/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
