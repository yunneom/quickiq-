import Script from 'next/script';
import { adsenseClient } from '@/lib/ads/adsense';

/**
 * Loads the AdSense bootstrap once per page. Rendered in the locale
 * layout so every page can host slots, but emits nothing when the
 * publisher id env var is absent (pre-approval state).
 *
 * `afterInteractive` keeps it off the critical path — the landing page
 * LCP budget (<2.5s, per CLAUDE.md) is not affected.
 */
export function AdsenseScript() {
  const client = adsenseClient();
  if (!client) return null;
  return (
    <Script
      id="adsense-loader"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
