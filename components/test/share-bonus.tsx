'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  pct: number;
}

const UNLOCK_KEY = 'iq-share-bonus-unlocked';

/**
 * "Share to unlock" bonus insight card. Hidden by default; reveals
 * once `markShareBonusUnlocked()` flips the localStorage flag (called
 * from share-buttons after a successful Web Share / copy / Kakao).
 *
 * Mounts once on result page, polls localStorage via the `storage`
 * event to react instantly without prop drilling.
 */
export function ShareBonus({ pct }: Props) {
  const t = useTranslations('result');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === '1');
    const onStorage = (e: StorageEvent) => {
      if (e.key === UNLOCK_KEY) {
        setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === '1');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!unlocked) return null;

  return (
    <section className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
        {t('bonusTitle')}
      </p>
      <p className="mt-1 text-sm text-emerald-900">
        {t('bonusBody', { pct })}
      </p>
    </section>
  );
}

/**
 * Flip the localStorage flag and dispatch a same-tab storage event so
 * `<ShareBonus>` re-reads it immediately (the native storage event
 * fires only across tabs).
 */
export function markShareBonusUnlocked(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UNLOCK_KEY, '1');
    window.dispatchEvent(new StorageEvent('storage', { key: UNLOCK_KEY }));
  } catch {
    // QuotaExceeded etc. — silent: the bonus just stays hidden
  }
}
