'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

/**
 * Small intro screen shown before the actual test starts. Sets
 * expectation about length / 60s timer / no-back so users don't bail
 * mid-test surprised by the constraints. Toggled off if they've
 * dismissed it once (sessionStorage).
 */
const DISMISSED_KEY = 'iq-intro-dismissed';

export function TestIntro({ onStart }: { onStart: () => void }) {
  const t = useTranslations('test');
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.sessionStorage.getItem(DISMISSED_KEY));
  });

  if (dismissed) {
    // Auto-start after a tick — caller transitions to running state.
    if (typeof window !== 'undefined') queueMicrotask(onStart);
    return null;
  }

  const start = () => {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
    onStart();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 pb-10 pt-12">
      <h1 className="text-2xl font-extrabold text-gray-900">{t('introTitle')}</h1>
      <ul className="mt-6 space-y-3 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
          {t('introBody1')}
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
          {t('introBody2')}
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
          {t('introBody3')}
        </li>
      </ul>
      <Button size="lg" className="mt-10 w-full" onClick={start}>
        {t('introCta')}
      </Button>
    </div>
  );
}
