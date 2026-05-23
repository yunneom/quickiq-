/**
 * Shared cookie-consent helpers — read by client components that
 * conditionally mount analytics SDKs (Vercel Analytics, Meta Pixel).
 *
 * Storage key matches components/consent/cookie-banner.tsx.
 */

const STORAGE_KEY = 'iq-cookie-consent';

export type ConsentState = 'accepted' | 'declined' | 'unset';

export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unset';
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === 'accepted' || v === 'declined') return v;
  return 'unset';
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === 'accepted';
}
