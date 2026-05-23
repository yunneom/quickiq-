'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { hasAnalyticsConsent } from '@/lib/consent';

/**
 * Mounts Vercel Analytics + Speed Insights ONLY when the user has
 * accepted cookies (or hasn't decided yet — Vercel Analytics is
 * anonymous and PIPA-permitted as long as we honor opt-out).
 *
 * If the user declined, both SDKs stay unmounted for the session.
 * Re-evaluates on storage events so the banner choice takes effect
 * immediately, not just on next page load.
 */
export function GatedAnalytics() {
  const [allow, setAllow] = useState<boolean | null>(null);

  useEffect(() => {
    // Default to "allow" until the user explicitly declines.
    // Vercel Analytics is fully anonymous, so showing while consent
    // is "unset" is the conservative defensible position.
    const evaluate = () => {
      const state = (typeof window !== 'undefined' &&
        window.localStorage.getItem('iq-cookie-consent')) || null;
      setAllow(state !== 'declined');
    };
    evaluate();
    window.addEventListener('storage', evaluate);
    return () => window.removeEventListener('storage', evaluate);
  }, []);

  if (allow === false) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
