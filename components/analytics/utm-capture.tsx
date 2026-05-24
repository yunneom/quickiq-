'use client';

import { useEffect } from 'react';

/**
 * UTM capture — store ad campaign attribution in sessionStorage on the
 * first hit. The test-runner reads this back on submit so we can attribute
 * paid orders to a specific campaign in the admin dashboard.
 *
 * Reads: utm_source, utm_medium, utm_campaign, utm_term, utm_content.
 * Persists for the lifetime of the browser tab.
 */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const STORAGE_KEY = 'iq-utm';

export function UtmCapture() {
  useEffect(() => {
    try {
      // If we've already captured (this tab), don't overwrite — first
      // touch wins, matches most ad-attribution conventions.
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
      const url = new URL(window.location.href);
      const found: Record<string, string> = {};
      for (const k of UTM_KEYS) {
        const v = url.searchParams.get(k);
        if (v) found[k] = v;
      }
      if (Object.keys(found).length === 0) return;
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch {
      // sessionStorage may be blocked in some private modes — ignore
    }
  }, []);
  return null;
}

export function readUtm(): Record<string, string> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : null;
  } catch {
    return null;
  }
}
