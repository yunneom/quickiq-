/**
 * Google AdSense integration — fully env-gated.
 *
 * Nothing renders (no script, no slots, zero bytes) unless
 * `NEXT_PUBLIC_ADSENSE_CLIENT` is set to the publisher id
 * (ca-pub-XXXXXXXXXXXXXXXX). This lets the code ship before AdSense
 * approval; once approved, adding the env var in Vercel turns ads on
 * with no code change.
 *
 * Placement policy (매출 보호):
 *   - ads OK   → free test result pages, type description pages, /tests hub
 *   - ads NEVER → IQ result / checkout / thank-you (the 4,900원 paid funnel;
 *     an ad click worth ~50원 must not cannibalize a 4,900원 conversion)
 */

export function adsenseClient(): string | undefined {
  const v = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  return v && v.startsWith('ca-pub-') ? v : undefined;
}

export function isAdsenseEnabled(): boolean {
  return Boolean(adsenseClient());
}
