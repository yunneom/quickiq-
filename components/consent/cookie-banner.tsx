'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const STORAGE_KEY = 'iq-cookie-consent';

type Consent = 'accepted' | 'declined' | null;

function read(): Consent {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'accepted' || v === 'declined' ? v : null;
}

function write(v: Consent) {
  if (typeof window === 'undefined' || v == null) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // ignore — silent failure means the banner re-shows next visit
  }
}

export function CookieBanner() {
  const t = useTranslations('cookies');
  const locale = useLocale();
  const [state, setState] = useState<Consent | 'loading'>('loading');

  useEffect(() => {
    setState(read());
  }, []);

  // Don't render anything on first paint to avoid layout jitter.
  if (state === 'loading' || state === 'accepted' || state === 'declined') {
    return null;
  }

  const choose = (v: 'accepted' | 'declined') => {
    write(v);
    setState(v);
  };

  return (
    <div
      role="region"
      aria-label="cookie consent"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 safe-bottom"
    >
      <div className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
        <p className="text-xs leading-relaxed text-gray-700">
          {t('message')}{' '}
          <Link
            href={`/${locale}/privacy`}
            className="font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {t('privacy')}
          </Link>
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => choose('declined')}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('decline')}
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
