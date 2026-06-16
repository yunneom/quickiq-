import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { PersonalityProfile } from '@/lib/personality/types';

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
  },
  en: {
    title: 'Your type',
    strengthsTitle: 'Strengths',
    weaknessesTitle: 'Watch out for',
    breakdownTitle: 'Breakdown',
    compatibilityTitle: 'Compatibility',
    retake: 'Retake',
    disclaimer: 'For entertainment · Not a scientific assessment.',
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
}: Props) {
  const c = COPY[locale] ?? COPY.ko;

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
