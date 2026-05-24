'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Stats {
  takers: number;
  averageIq: number | null;
}

/**
 * Anonymous landing-page social proof: number of completed tests and
 * average estimated IQ. Hidden until the first 10 completions so a
 * brand-new launch doesn't show "1 person took this test."
 */
export function SocialProof() {
  const t = useTranslations('landing');
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  if (!stats || stats.takers < 10) return null;
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 10c1.93 0 3.5-1.57 3.5-3.5S11.93 3 10 3 6.5 4.57 6.5 6.5 8.07 10 10 10Zm0 1.5c-2.34 0-7 1.17-7 3.5V17h14v-2c0-2.33-4.66-3.5-7-3.5Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="flex-1 text-xs text-gray-700">
        <p className="font-medium">
          {t('socialProof', {
            takers: stats.takers.toLocaleString(),
            avgIq: stats.averageIq ?? '—',
          })}
        </p>
      </div>
    </div>
  );
}
