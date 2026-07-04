import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';
import { TestFaq } from '@/components/personality/test-faq';
import { getTestEntry } from '@/lib/tests/catalog';

const COPY = {
  ko: {
    eyebrow: 'AJAE POWER',
    headline: '삐삐 8282,\n무슨 뜻인지 아세요?',
    sub: '삐삐 암호·PC통신·오락실·비디오 가게 15문제.\n많이 맞출수록… 축하합니다, 아재 인증입니다.',
    cta: '응시하기 · 무료',
    bullets: [
      '15문항 · 2분 · 정답이 있는 추억 퀴즈',
      '4단계 판정 — 청정 신세대부터 레전드 아재까지',
      '신조어 능력고사와 세트로 돌리는 게 국룰',
      '가입·로그인 없음, 익명 응시',
    ],
    disclaimer: '재미용 테스트 · 실제 나이와 무관합니다.',
  },
  en: {
    eyebrow: 'AJAE POWER',
    headline: 'Pager code 8282 —\ndo you know it?',
    sub: '15 questions on retro Korean culture: pagers, dial-up chat, arcades, video rentals.\nThe more you know… congratulations, certified ajae.',
    cta: 'Take the quiz · Free',
    bullets: [
      '15 questions · 2 min · a nostalgia quiz with real answers',
      '4 ranks — Pure New Gen to Legendary Ajae',
      'Pairs perfectly with the K-Slang Quiz',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Unrelated to your actual age.',
  },
} as const;

export default function AjaeLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const t = COPY[loc] ?? COPY.ko;
  const entry = getTestEntry('ajae');
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
      <header className="text-xs font-semibold uppercase tracking-widest text-amber-600">
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
              <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-amber-600">
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
        <Link href={`/${locale}/ajae/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
