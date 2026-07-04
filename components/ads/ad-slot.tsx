'use client';

import { useEffect, useRef } from 'react';

interface Props {
  /** AdSense publisher id (ca-pub-…). Pass from a Server Component via
   *  adsenseClient() so the slot renders nothing pre-approval. */
  client?: string;
  /** Ad unit slot id from the AdSense dashboard. Optional — when omitted
   *  (pre-dashboard-setup), Auto ads can still fill via the page-level
   *  script, and this component renders nothing. */
  slot?: string;
  /** Reserve vertical space to avoid CLS on mobile. Default 280px. */
  minHeight?: number;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single responsive AdSense display unit. Never rendered on the paid
 * funnel (IQ result → checkout → thank-you) — see lib/ads/adsense.ts
 * for the placement policy.
 */
export function AdSlot({ client, slot, minHeight = 280, className }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blocker or script not yet loaded — fail silently.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <div className={className} style={{ minHeight }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
