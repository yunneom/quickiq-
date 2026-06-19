import { useTranslations } from 'next-intl';
import type { ClassificationKey } from '@/lib/scoring/classify';

interface Props {
  topPercentile: number;
  estimatedIq: number;
  classKey: ClassificationKey;
  /** Pre-formatted duration label (e.g. "5m 12s"), or null to hide. */
  durationLabel: string | null;
}

/**
 * Hero card at the top of the result page. Extracted from page.tsx so
 * the page stays focused on layout/composition while the visual chunk
 * lives next to the other test-* components.
 *
 * Server component — uses useTranslations through next-intl's RSC
 * adapter (just an import). No 'use client' needed because the chip
 * styling is static and the data is passed in as props.
 */
export function ResultHero({
  topPercentile,
  estimatedIq,
  classKey,
  durationLabel,
}: Props) {
  const t = useTranslations('result');
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-white shadow-lg">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-white/5" />

      <div className="relative" data-testid="result-hero">
        <p className="text-xs uppercase tracking-widest opacity-80">
          {t('title')}
        </p>
        <p
          className="mt-2 text-5xl font-extrabold tracking-tight"
          data-testid="result-percentile"
        >
          {t('topPercentile', { pct: topPercentile })}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {t('estimatedIq', { iq: estimatedIq })}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {t(`classification.${classKey}`)}
          </span>
          {durationLabel && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
              {durationLabel}
            </span>
          )}
        </div>
        <p
          className="mt-4 text-[11px] font-medium opacity-90"
          data-testid="result-hero-disclaimer"
        >
          ⓘ {t('estimatedNotice')}
        </p>
      </div>
    </div>
  );
}
