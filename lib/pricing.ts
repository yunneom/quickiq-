/**
 * Single source of truth for the report price across all surfaces:
 * landing CTA, checkout, exit-intent modal, JSON-LD, OG/feed images,
 * email receipts. Driven by the `NEXT_PUBLIC_PRICE_KRW` env so we can
 * A/B prices without a code change.
 *
 * Why server-only formatting:
 *   - the locale-appropriate currency label ("9,900원" vs "$7.50") must
 *     stay consistent across SSR/CSR, and Intl.NumberFormat on the
 *     client gives slightly different output on some Android WebViews.
 *   - we never let the client tell the server what price to charge —
 *     the webhook reconciles against env-defined `priceKRW` only.
 */

/** Raw price in KRW (won), read from env with a sensible default. */
export function priceKRW(): number {
  const raw = process.env.NEXT_PUBLIC_PRICE_KRW;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 9900;
}

const DEFAULT_USD_KRW_PEG = 1320;

/** USD equivalent for the EN audience. Rounded to the nearest dime.
 *  Peg is informational only — Lemon Squeezy MoR handles the actual
 *  FX at charge time. Operator can override via NEXT_PUBLIC_USD_KRW_PEG
 *  when KRW drifts >5% vs the default. */
export function priceUSD(): number {
  const rawPeg = process.env.NEXT_PUBLIC_USD_KRW_PEG;
  const parsed = rawPeg ? Number(rawPeg) : NaN;
  const peg =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_KRW_PEG;
  const krw = priceKRW();
  return Math.round((krw / peg) * 10) / 10;
}

/**
 * Formatted price label for a given locale. Returns:
 *   KO: "9,900원"
 *   EN: "$7.50"
 */
export function priceLabel(locale: 'ko' | 'en'): string {
  if (locale === 'en') {
    return `$${priceUSD().toFixed(2)}`;
  }
  return `${priceKRW().toLocaleString('ko-KR')}원`;
}
