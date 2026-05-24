'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'iq-pwa-dismissed';

/**
 * Conditional A2HS (Add to Home Screen) prompt. Two modes:
 *
 * - Chrome / Edge on Android: catch `beforeinstallprompt`, show our
 *   own button that triggers the native install dialog.
 * - iOS Safari: no programmatic API; show a hint "Share → Add to
 *   Home Screen" because most users don't know that's possible.
 *
 * Hidden once dismissed (sessionStorage) so it doesn't nag.
 */
export function InstallPrompt() {
  const t = useTranslations('result');
  const [deferredEvt, setDeferredEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(DISMISSED_KEY)) {
      setDismissed(true);
      return;
    }
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    // iOS Safari: no beforeinstallprompt; sniff and show the hint instead.
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !/Android/i.test(ua);
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isIos && !isStandalone) setIosHint(true);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (dismissed) return null;
  if (!deferredEvt && !iosHint) return null;

  const install = async () => {
    if (!deferredEvt) return;
    try {
      await deferredEvt.prompt();
      await deferredEvt.userChoice;
    } finally {
      window.sessionStorage.setItem(DISMISSED_KEY, '1');
      setDismissed(true);
    }
  };

  const dismiss = () => {
    window.sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-brand-900">{t('pwaTitle')}</p>
          <p className="mt-1 text-xs text-brand-800">{t('pwaBody')}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-xs text-brand-700 underline-offset-2 hover:underline"
          aria-label="close"
        >
          ×
        </button>
      </div>
      {deferredEvt ? (
        <button
          type="button"
          onClick={install}
          className="mt-3 grid w-full place-items-center rounded-xl bg-brand-600 py-2 text-sm font-semibold text-white"
        >
          {t('pwaInstall')}
        </button>
      ) : (
        <p className="mt-3 rounded-lg bg-white px-3 py-2 text-center text-xs font-medium text-brand-900">
          📱 {t('pwaInstallediOS')}
        </p>
      )}
    </div>
  );
}
