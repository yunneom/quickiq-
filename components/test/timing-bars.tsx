'use client';

import { useTranslations } from 'next-intl';
import type { CategoryTiming } from '@/lib/scoring';

interface Props {
  timing: CategoryTiming;
}

const KEYS: (keyof CategoryTiming)[] = ['verbal', 'numerical', 'spatial', 'logical'];

export function TimingBars({ timing }: Props) {
  const t = useTranslations('result');

  // Skip if any category has 0 (no timing data captured).
  const values = KEYS.map((k) => timing[k]);
  if (values.some((v) => v <= 0)) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {t('timingTitle')}
        </p>
        <div className="flex items-center gap-2 text-[9px] text-gray-400">
          <span className="inline-block h-1.5 w-3 rounded-full bg-emerald-500" />
          <span>{t('timingFast')}</span>
          <span className="inline-block h-1.5 w-3 rounded-full bg-amber-500" />
          <span>{t('timingSlow')}</span>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {KEYS.map((key) => {
          const ms = timing[key];
          const seconds = (ms / 1000).toFixed(1);
          // Normalize: fastest gets full color, slowest gets 30% (visually
          // pinned both ends so the chart never looks empty).
          const ratio =
            max === min ? 0.6 : 0.3 + ((max - ms) / (max - min)) * 0.7;
          const widthPct = Math.round(ratio * 100);
          const isFast = ms === min && max !== min;
          const isSlow = ms === max && max !== min;
          const colorClass = isFast
            ? 'bg-emerald-500'
            : isSlow
              ? 'bg-amber-500'
              : 'bg-brand-400';
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{t(key)}</span>
                <span className="tabular-nums text-gray-500">{seconds}s</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full ${colorClass} transition-[width] duration-500`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
