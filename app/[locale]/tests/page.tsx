import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { TEST_CATALOG } from '@/lib/tests/catalog';
import { ResultAd } from '@/components/ads/result-ad';

const COPY = {
  ko: {
    title: '전체 테스트 — 무료 성격·인지 진단 6종 | QuickIQ',
    description:
      'MBTI 16유형 · 애착 유형 · 사랑의 5가지 언어 · 에니어그램 9유형 · 테토/에겐 · IQ 테스트까지 모두 무료. 응시·로그인 정보 없이 익명으로, 결과는 즉시. 친구·연인과 공유해 비교해 보세요.',
    eyebrow: 'ALL TESTS',
    h1: '무료 성격·인지 테스트 6종',
    intro:
      '학술 도구를 단순화한 자기 보고식 추정 테스트 모음이에요. 임상 진단이 아니라 자기 탐구와 친구·연인과의 공감대 형성에 가깝습니다. 평균 3분 안에 끝나고, 결과 페이지는 친구 공유와 인스타 스토리에 그대로 올릴 수 있게 디자인됐어요.',
    timeLabel: (m: number) => `${m}분`,
    qLabel: (n: number) => `${n}문항`,
    sectionTitle: '테스트 목록',
    methodologyTitle: '어떻게 만들어졌나요?',
    methodology:
      '각 테스트는 공개된 학술 모델(MBTI · ECR-R · 사랑의 5가지 언어 · 에니어그램 등)을 참고해 자체 문항을 새로 작성했고, 점수 알고리즘과 결과 카피는 모두 직접 만들었습니다. 저작권 보호 검사의 원본 문항은 사용하지 않았어요.',
    disclaimerTitle: '주의사항',
    disclaimerBody:
      '모든 테스트 결과는 추정·재미 목적입니다. 임상 진단을 대체하지 않으며, 진로·의료 결정의 단일 근거로 사용하지 마세요.',
    back: '← 홈으로',
  },
  en: {
    title: 'All Tests — 6 Free Personality & Cognitive Quizzes | QuickIQ',
    description:
      'MBTI 16 types · Attachment style · 5 love languages · Enneagram 9 types · Teto/Egen · IQ test — all free. Anonymous, no sign-up, instant results. Share with friends or partner and compare.',
    eyebrow: 'ALL TESTS',
    h1: '6 free personality & cognitive tests',
    intro:
      'A curated set of self-report estimation quizzes inspired by well-known academic models. Closer to self-discovery and shared conversation than to clinical assessment. Each one takes about 3 minutes and the result pages are designed for friend shares and Instagram stories.',
    timeLabel: (m: number) => `${m} min`,
    qLabel: (n: number) => `${n} Q`,
    sectionTitle: 'The tests',
    methodologyTitle: 'How they were built',
    methodology:
      'Each test references public academic models (MBTI, ECR-R, 5 Love Languages, Enneagram, etc.) but uses originally written items and an in-house scoring algorithm. No copyrighted instrument items are reproduced.',
    disclaimerTitle: 'Disclaimer',
    disclaimerBody:
      'All results are estimates for entertainment and self-reflection. Not a substitute for clinical assessment. Do not use as the sole basis for medical or career decisions.',
    back: '← Home',
  },
} as const;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const c = COPY[locale as 'ko' | 'en'] ?? COPY.ko;
  return {
    title: c.title,
    description: c.description,
    alternates: {
      languages: {
        ko: '/ko/tests',
        en: '/en/tests',
        'x-default': '/ko/tests',
      },
    },
  };
}

/**
 * Indexable category landing — the SEO sibling of the hub. Hub focuses
 * on conversion (big cards, sticky CTAs), this page focuses on content
 * (richer intro, methodology, disclaimer) so it can rank for category
 * queries like "성격 테스트 모음" / "free personality tests" without
 * cannibalizing the hub's UX.
 */
export default function AllTestsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  unstable_setRequestLocale(locale);
  const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
  const c = COPY[loc];

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: TEST_CATALOG.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title[loc],
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${locale}/${t.slug}`,
    })),
  };

  return (
    <article className="mx-auto max-w-md px-5 pb-12 pt-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <nav aria-label="breadcrumb" className="text-[11px] text-gray-500">
        <Link href={`/${locale}`} className="hover:underline">
          {c.back}
        </Link>
      </nav>

      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-brand-600">
        {c.eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-gray-900">
        {c.h1}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{c.intro}</p>

      <h2 className="mt-8 text-base font-semibold text-gray-900">
        {c.sectionTitle}
      </h2>
      <ul className="mt-3 space-y-3">
        {TEST_CATALOG.map((t) => (
          <li key={t.slug}>
            <Link
              href={`/${locale}/${t.slug}`}
              prefetch
              className="group block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-2xl ${t.accentBg}`}
                >
                  {t.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${t.accentText}`}
                    >
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

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600">
          {c.methodologyTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          {c.methodology}
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-700">
          {c.disclaimerTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900">
          {c.disclaimerBody}
        </p>
      </section>
      <ResultAd />
    </article>
  );
}
