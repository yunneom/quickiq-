import { adsenseClient } from '@/lib/ads/adsense';
import { AdSlot } from './ad-slot';

/**
 * Server wrapper that gates a single responsive ad unit behind the two
 * AdSense env vars. Placed ONLY on free-content pages (personality test
 * results, type description pages, /tests hub) — never on the IQ paid
 * funnel. Renders nothing until both env vars are configured, so it can
 * be committed before AdSense approval.
 */
export function ResultAd({ className }: { className?: string }) {
  const client = adsenseClient();
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim();
  if (!client || !slot) return null;
  return <AdSlot client={client} slot={slot} className={className ?? 'mt-8'} />;
}
