'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackFunnel } from '@/components/analytics/meta-pixel';

interface Props {
  locale: 'ko' | 'en';
  sessionId: string;
  /** Non-paid users only — the parent decides eligibility. */
}

const DISMISS_KEY = 'iq-exit-intent-dismissed';

/**
 * One-shot exit-intent prompt for the free result page. Fires on the
 * first time the cursor leaves the viewport via the top edge (desktop)
 * or the document gets a `visibilitychange` to hidden (mobile, since
 * mobile browsers don't fire mouseleave on tab swipe).
 *
 * Dismissals are remembered in localStorage so we never nag the same
 * visitor twice — that would erode trust faster than it would convert.
 */
export function ExitIntentModal({ locale, sessionId }: Props) {
  const t = useTranslations('result');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(DISMISS_KEY) === '1') return;

    let armed = true;
    // Give the user a couple seconds to read the result before we even
    // start watching for exit intent — otherwise the modal feels like a
    // landmine on instant tab close.
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 2500);

    const trigger = () => {
      if (!armed) return;
      armed = false;
      setOpen(true);
      trackFunnel('IQ_ExitIntent', { sessionId });
    };

    const onMouseLeave = (e: MouseEvent) => {
      // Only fire when the cursor leaves through the *top* of the
      // viewport (i.e. heading for the tab bar / close button).
      if (e.clientY <= 0) trigger();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') trigger();
    };
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sessionId]);

  function dismiss() {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, '1');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          {t('exitIntentEyebrow')}
        </p>
        <h2
          id="exit-intent-title"
          className="mt-2 text-xl font-bold text-gray-900"
        >
          {t('exitIntentTitle')}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{t('exitIntentBody')}</p>
        <Link
          href={`/${locale}/checkout/${sessionId}`}
          className="mt-5 block"
          onClick={dismiss}
        >
          <Button size="lg" className="w-full">
            {t('exitIntentCta')}
          </Button>
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 block w-full text-center text-xs text-gray-500 hover:text-gray-700"
        >
          {t('exitIntentDismiss')}
        </button>
      </div>
    </div>
  );
}
