'use client';

import { useTranslations } from 'next-intl';
import type { CategoryScores } from '@/lib/scoring';
import { AVERAGE_CATEGORY_SCORES } from '@/lib/scoring/classify';

interface Props {
  scores: CategoryScores;
  /** When true, render comparison bars (you vs. average). */
  showCompare?: boolean;
  blurred?: boolean;
}

const KEYS: (keyof CategoryScores)[] = ['verbal', 'numerical', 'spatial', 'logical'];

export function CategoryBars({ scores, showCompare = true, blurred }: Props) {
  const t = useTranslations('result');

  return (
    <div
      className={blurred ? 'blur-paywall space-y-4' : 'space-y-4'}
      aria-hidden={blurred ? 'true' : undefined}
    >
      {KEYS.map((key) => {
        const you = scores[key];
        const avg = AVERAGE_CATEGORY_SCORES[key];
        const winning = you >= avg;
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{t(key)}</span>
              <span className="font-semibold text-gray-900">{you}</span>
            </div>
            <div className="mt-1 space-y-1.5">
              <Bar value={you} color={winning ? 'bg-brand-600' : 'bg-brand-400'} label={t('youLabel')} />
              {showCompare && (
                <Bar value={avg} color="bg-gray-300" label={t('avgLabel')} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Bar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${color} transition-[width] duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-6 text-right text-[10px] tabular-nums text-gray-400">
        {value}
      </span>
    </div>
  );
}
