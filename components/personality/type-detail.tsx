import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PersonalityProfile } from '@/lib/personality/types';
import type { TestCatalogEntry } from '@/lib/tests/catalog';
import { ResultAd } from '@/components/ads/result-ad';

interface Props {
  locale: 'ko' | 'en';
  slug: string;
  entry: TestCatalogEntry;
  profile: PersonalityProfile;
  /** All profiles in this test (for the "other types" cross-link grid). */
  siblings: PersonalityProfile[];
  /** Other tests to cross-promote (exploration loop). */
  crossTests: TestCatalogEntry[];
}

const COPY = {
  ko: {
    strengths: '강점',
    weaknesses: '주의할 점',
    compatibility: '궁합',
    ctaTitle: '내 유형도 확인해볼까요?',
    ctaBody: (q: number, m: number) => `${q}문항 · ${m}분 · 무료`,
    cta: '테스트 시작하기',
    otherTypes: '다른 유형 둘러보기',
    otherTests: '다른 테스트도 해보기',
    disclaimer: '재미용 콘텐츠 · 과학적 진단이 아닙니다.',
    backToTest: '← 테스트 소개로',
  },
  en: {
    strengths: 'Strengths',
    weaknesses: 'Watch out for',
    compatibility: 'Compatibility',
    ctaTitle: 'Curious about your own type?',
    ctaBody: (q: number, m: number) => `${q} questions · ${m} min · Free`,
    cta: 'Take the test',
    otherTypes: 'Browse other types',
    otherTests: 'Try another test',
    disclaimer: 'For entertainment · Not a scientific assessment.',
    backToTest: '← Test overview',
  },
} as const;

/**
 * Programmatic, indexable per-type landing page — the growth engine the
 * benchmark (16personalities, quiz.thicket.sh) is built on. Each result
 * type gets its own SEO content + share target + CTA back into the test,
 * with cross-links to sibling types and other tests so the sitemap and
 * the on-site exploration loop both compound.
 */
export function TypeDetail({
  locale,
  slug,
  entry,
  profile,
  siblings,
  crossTests,
}: Props) {
  const c = COPY[locale];
  const nameById = new Map(siblings.map((s) => [s.id, s.name]));

  const compatEntries = profile.compatibility
    ? Object.entries(profile.compatibility).map(([id, note]) => ({
        name: nameById.get(id) ?? id,
        note,
      }))
    : [];

  // Article + BreadcrumbList JSON-LD — same schema family the benchmark
  // sites use on every type page to earn rich results for
  // "<type> strengths and weaknesses" plus the SERP breadcrumb display.
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://7iq.vercel.app';
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${profile.name} — ${entry.title[locale]}`,
    description: profile.tagline,
    inLanguage: locale,
    about: entry.title[locale],
    url: `${base}/${locale}/${slug}/types/${profile.id}`,
    publisher: { '@type': 'Organization', name: 'QuickIQ' },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'ko' ? '전체 테스트' : 'All tests',
        item: `${base}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: entry.title[locale],
        item: `${base}/${locale}/${slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.name,
        item: `${base}/${locale}/${slug}/types/${profile.id}`,
      },
    ],
  };

  return (
    <article className="mx-auto max-w-md px-5 pb-12 pt-10">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav aria-label="breadcrumb" className="text-[11px] text-gray-500">
        <Link href={`/${locale}`} className="hover:underline">
          {locale === 'ko' ? '전체 테스트' : 'All tests'}
        </Link>
        <span className="mx-1.5 text-gray-300">/</span>
        <Link href={`/${locale}/${slug}`} className="hover:underline">
          {entry.title[locale]}
        </Link>
      </nav>
      <Link
        href={`/${locale}/${slug}`}
        className={`mt-2 inline-block text-xs font-semibold uppercase tracking-widest ${entry.accentText}`}
      >
        {entry.eyebrow}
      </Link>

      {/* Hero */}
      <div
        className={`mt-4 overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-8 text-white shadow-lg`}
        style={{
          backgroundImage: `linear-gradient(135deg, ${entry.gradient.from}, ${entry.gradient.to})`,
        }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight">{profile.name}</h1>
        <p className="mt-2 text-sm leading-relaxed opacity-95">{profile.tagline}</p>
      </div>

      {/* Description */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-700">{profile.description}</p>
      </section>

      {/* Strengths / Weaknesses */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {c.strengths}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
            {profile.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            {c.weaknesses}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {profile.weaknesses.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compatibility */}
      {compatEntries.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-gray-900">{c.compatibility}</h2>
          <div className="mt-3 space-y-2">
            {compatEntries.map((e) => (
              <div
                key={e.name}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <span className="whitespace-nowrap text-sm font-bold text-gray-900">
                  {e.name}
                </span>
                <span className="text-xs leading-relaxed text-gray-600">{e.note}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA back into the test */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
        <p className="text-base font-bold text-gray-900">{c.ctaTitle}</p>
        <p className="mt-1 text-xs text-gray-500">
          {c.ctaBody(entry.questions, entry.minutes)}
        </p>
        <Link href={`/${locale}/${slug}/test`} prefetch className="mt-4 block">
          <Button size="lg" className="w-full">
            {c.cta}
          </Button>
        </Link>
        <a
          href={`/${locale}/${slug}/types/${profile.id}/story-card`}
          target="_blank"
          rel="noopener"
          className="mt-3 block text-xs font-medium text-gray-500 underline-offset-2 hover:underline"
        >
          {locale === 'ko'
            ? '📱 인스타 스토리용 이미지 받기'
            : '📱 Get the Instagram-story image'}
        </a>
      </section>

      {/* Other types in this test */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">{c.otherTypes}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {siblings
            .filter((s) => s.id !== profile.id)
            .map((s) => (
              <Link
                key={s.id}
                href={`/${locale}/${slug}/types/${s.id}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300"
              >
                {s.name}
              </Link>
            ))}
        </div>
      </section>

      {/* Cross-test exploration loop */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900">{c.otherTests}</h2>
        <div className="mt-3 space-y-2">
          {crossTests.map((t) => (
            <Link
              key={t.slug}
              href={`/${locale}/${t.slug}`}
              prefetch
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300"
            >
              <span
                className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg ${t.accentBg}`}
              >
                {t.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-gray-900">
                  {t.title[locale]}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {t.tagline[locale]}
                </span>
              </span>
              <span aria-hidden className="text-gray-300">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-gray-400">⚠ {c.disclaimer}</p>
      <ResultAd />
    </article>
  );
}
