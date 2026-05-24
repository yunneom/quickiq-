'use client';

import Script from 'next/script';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  if (!PIXEL_ID) return null;
  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* Meta Pixel requires a real 1×1 tracking pixel inside noscript — */}
        {/* next/image can't render here because there's no JS to hydrate.   */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') fbq('track', name, params);
}

/**
 * Custom funnel events (prefixed `IQ_`) we fire at every meaningful step
 * so admin + Meta can see the drop-off curve. Standard `trackEvent`
 * uses Meta's "track" channel (built-in events); these use `trackCustom`
 * which is the right channel for non-standard names.
 *
 * Defined as a constant union so call sites get autocomplete and typos
 * fail typecheck instead of silently disappearing into the void.
 */
export type FunnelEvent =
  | 'IQ_TestStart'
  | 'IQ_Q1Answered'
  | 'IQ_Q15Answered'
  | 'IQ_Q25Answered'
  | 'IQ_TestSubmitted'
  | 'IQ_ResultViewed'
  | 'IQ_CheckoutViewed'
  | 'IQ_PaymentSuccess'
  | 'IQ_ExitIntent';

export function trackFunnel(name: FunnelEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === 'function') fbq('trackCustom', name, params);
  // Mirror into our public stats endpoint so we can see funnel drop-off
  // even without a Meta Pixel ID configured (in early launch when we're
  // still waiting for Meta approval).
  try {
    void fetch('/api/funnel/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: name, ...params }),
      keepalive: true,
    });
  } catch {
    // best-effort; never block the user
  }
}
