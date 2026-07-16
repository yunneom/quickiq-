import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PersonalityProfile } from '@/lib/personality/types';
import { TEST_CATALOG } from '@/lib/tests/catalog';
import { PersonalityShare } from '@/components/personality/personality-share';
import { ResultAd } from '@/components/ads/result-ad';

export interface ResultBar {
  /** Left-side label (e.g. "외향 E", "인정의 말"). */
  label: string;
  /** 0–100 fill percentage. */
  pct: number;
  /** Optional right-side label for a two-pole axis (e.g. "I 내향"). */
  rightLabel?: string;
}

export interface CompatEntry {
  name: string;
  note: string;
}

interface ResultCopy {
  title: string;
  strengthsTitle: string;
  weaknessesTitle: string;
  breakdownTitle: string;
  compatibilityTitle: string;
  retake: string;
  disclaimer: string;
  detailLink: string;
  otherTests: string;
  shareText: (name: string) => string;
}

const COPY: Record<'ko' | 'en', ResultCopy> = {
  ko: {
    title: '당신의 유형',
    strengthsTitle: '강점',
    weaknessesTitle: '주의할 점',
    breakdownTitle: '세부 분석',
    compatibilityTitle: '궁합',
    retake: '다시 응시',
    disclaimer: '재미용 테스트 · 과학적 진단이 아닙니다.',
    detailLink: '내 유형 자세히 보기 →',
    otherTests: '다른 테스트도 해보기',
    shareText: (name) => `내 결과는 "${name}" 나왔어! 너도 해볼래?`,
  },
  en: {
    title: 'Your type',
    strengthsTitle: 'Strengths',
    weaknessesTitle: 'Watch out for',
    breakdownTitle: 'Breakdown',
    compatibilityTitle: 'Compatibility',
    retake: 'Retake',
    disclaimer: 'For entertainment · Not a scientific assessment.',
    detailLink: 'See your type in detail →',
    otherTests: 'Try another test',
    shareText: (name) => `I got "${name}"! What about you?`,
  },
};

interface Props {
  locale: 'ko' | 'en';
  /** Tailwind gradient classes for the hero, e.g. "from-violet-500 to-indigo-600". */
  gradientClass: string;
  profile: PersonalityProfile;
  /** Axis bars rendered under the hero. */
  bars: ResultBar[];
  /** Optional compatibility list (relationship-style tests). */
  compat?: CompatEntry[];
  retakeHref: string;
  /** Test slug (e.g. 'mbti') — enables the canonical type-page link + share. */
  slug: string;
  /** Resolved profile id (e.g. 'infp') for the type-page deep link. */
  profileId: string;
}

/**
 * Generic result UI shared by MBTI, 애착 유형, 사랑의 언어, 에니어그램.
 * 테토/에겐 keeps its own bespoke result page (it predates this component);
 * everything else funnels through here so the look stays consistent and
 * new tests only need to supply data, not layout.
 */
export function PersonalityResult({
  locale,
  gradientClass,
  profile,
  bars,
  compat,
  retakeHref,
  slug,
  profileId,
}: Props) {
  const c = COPY[locale] ?? COPY.ko;
  const typeHref = `/${locale}/${slug}/types/${profileId}`;
  const storyCardUrl = `/${locale}/${slug}/types/${profileId}/story-card`;
  // Cross-promote up to 3 other tests for the exploration loop.
  // IQ (the only paid product) is LAST in the catalog, so the old
  // `.slice(0, 3)` meant no free-test result page ever linked to it —
  // the viral traffic → revenue funnel structurally didn't exist. Pin IQ
  // first, then rotate the remaining two by slug so link equity spreads
  // across the whole catalog instead of always the same pair.
  const others = TEST_CATALOG.filter((t) => t.slug !== slug && t.slug !== 'iq');
  const offset = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % others.length;
  const crossTests = [
    TEST_CATALOG.find((t) => t.slug === 'iq')!,
    others[offset % others.length],
    others[(offset + 1) % others.length],
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
      {/* Hero */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClass} px-6 py-8 text-white shadow-lg`}
      >
        <p className="text-xs uppercase tracking-widest opacity-80">{c.title}</p>
        <p className="mt-2 text-4xl font-extrabold tracking-tight" data-testid="result-profile">
          {profile.name}
        </p>
        <p className="mt-2 text-sm leading-relaxed opacity-95">{profile.tagline}</p>
        <p className="mt-4 text-[11px] font-medium opacity-90">ⓘ {c.disclaimer}</p>
      </div>

      {/* Axis breakdown bars */}
      {bars.length > 0 && (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {c.breakdownTitle}
          </p>
          <div className="mt-3 space-y-3">
            {bars.map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs font-medium text-gray-600">
                  <span>{bar.label}</span>
                  {bar.rightLabel ? (
                    <span>{bar.rightLabel}</span>
                  ) : (
                    <span>{bar.pct}%</span>
                  )}
                </div>
                <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                    style={{ width: `${Math.min(100, Math.max(0, bar.pct))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-700">{profile.description}</p>
      </section>

      {/* Strengths / Weaknesses */}
      <section className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            {c.strengthsTitle}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-emerald-900">
            {profile.strengths.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
            {c.weaknessesTitle}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {profile.weaknesses.map((w) => (
              <li key={w}>· {w}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Compatibility */}
      {compat && compat.length > 0 && (
        <section className="mt-6">
          <h2 className="text-base font-semibold text-gray-900">
            {c.compatibilityTitle}
          </h2>
          <div className="mt-3 space-y-2">
            {compat.map((entry) => (
              <div
                key={entry.name}
                className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
              >
                <span className="whitespace-nowrap text-sm font-bold text-gray-900">
                  {entry.name}
                </span>
                <span className="text-xs leading-relaxed text-gray-600">
                  {entry.note}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Canonical type-page deep link (rich SEO content + share target) */}
      <Link
        href={typeHref}
        prefetch
        className="mt-6 block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:border-brand-300"
      >
        {c.detailLink}
      </Link>

      {/* Share — pre-filled archetype copy + tag-a-friend */}
      <PersonalityShare
        locale={locale}
        shareUrl={typeHref}
        shareText={c.shareText(profile.name)}
        storyCardUrl={storyCardUrl}
      />

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

      {/* Ad — free result pages only; gated off until AdSense env vars exist */}
      <ResultAd />

      {/* Retake */}
      <div className="mt-8">
        <Link href={retakeHref} prefetch>
          <Button size="md" variant="secondary" className="w-full">
            {c.retake}
          </Button>
        </Link>
      </div>
    </div>
  );
}
