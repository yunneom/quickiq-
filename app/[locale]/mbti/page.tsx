import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { locales, type Locale } from '@/i18n';

const COPY = {
  ko: {
    eyebrow: '16 PERSONALITIES',
    headline: '진짜 내 성격은\n16유형 중 무엇?',
    sub: '20문항 · 3분이면 끝나는 정밀 성격 유형 분석.\n4가지 축으로 당신의 유형을 찾아드려요.',
    cta: '시작하기 · 무료',
    bullets: [
      '20문항 · 3분',
      '16가지 유형 정밀 분석',
      '강점·약점 + 찰떡 궁합 유형',
      '응시·로그인 정보 없음',
    ],
    disclaimer: '재미용 테스트 · 과학적 진단이 아닙니다.',
  },
  en: {
    eyebrow: '16 PERSONALITIES',
    headline: 'Which of the\n16 types are you?',
    sub: 'A 20-question, 3-minute personality analysis.\nFour axes reveal your type.',
    cta: 'Start · Free',
    bullets: [
      '20 questions · 3 minutes',
      'All 16 types analyzed',
      'Strengths, weaknesses & best matches',
      'No sign-up, anonymous',
    ],
    disclaimer: 'For entertainment · Not a scientific assessment.',
  },
} as const;

export default function MbtiLanding({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const t = COPY[locale as 'ko' | 'en'] ?? COPY.ko;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-12">
      <header className="text-xs font-semibold uppercase tracking-widest text-violet-600">
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
              <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-100 text-violet-600">
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
      </div>

      <div className="sticky bottom-0 mt-10 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent pb-2 pt-6">
        <Link href={`/${locale}/mbti/test`} prefetch>
          <Button size="lg" className="w-full">
            {t.cta}
          </Button>
        </Link>
      </div>
    </div>
  );
}
