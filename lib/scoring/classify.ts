/**
 * Convert estimated IQ into a verbal classification label.
 * Bands chosen for friendliness — never used in clinical contexts.
 */

import type { CategoryScores } from './index';

export type ClassificationKey =
  | 'veryHigh'
  | 'high'
  | 'aboveAverage'
  | 'average'
  | 'belowAverage';

export function classifyIq(iq: number): ClassificationKey {
  if (iq >= 130) return 'veryHigh';
  if (iq >= 120) return 'high';
  if (iq >= 110) return 'aboveAverage';
  if (iq >= 90) return 'average';
  return 'belowAverage';
}

export type CategoryKey = keyof CategoryScores;

export function strengthsAndWeaknesses(scores: CategoryScores): {
  strength: CategoryKey;
  weakness: CategoryKey;
} {
  const entries = Object.entries(scores) as [CategoryKey, number][];
  let strength: CategoryKey = entries[0][0];
  let weakness: CategoryKey = entries[0][0];
  let max = -Infinity;
  let min = Infinity;
  for (const [k, v] of entries) {
    if (v > max) {
      max = v;
      strength = k;
    }
    if (v < min) {
      min = v;
      weakness = k;
    }
  }
  return { strength, weakness };
}

export function summaryHookKey(topPercentile: number): 'summaryHookHigh' | 'summaryHookMid' | 'summaryHookLow' {
  if (topPercentile <= 16) return 'summaryHookHigh';
  if (topPercentile <= 50) return 'summaryHookMid';
  return 'summaryHookLow';
}

/**
 * Pick the "lead size" key for the free signature-insight card based on
 * how much the strongest domain outscores the second-strongest. A wide
 * lead earns the louder copy variant ("dominant"), a close race earns
 * the gentler one ("balanced"). Used to vary the FOMO message above
 * the locked category breakdown so it doesn't feel templated.
 */
export type LeadSizeKey = 'dominant' | 'clear' | 'balanced';

export function leadSizeKey(scores: CategoryScores): LeadSizeKey {
  const sorted = Object.values(scores).slice().sort((a, b) => b - a);
  const gap = (sorted[0] ?? 0) - (sorted[1] ?? 0);
  if (gap >= 18) return 'dominant';
  if (gap >= 8) return 'clear';
  return 'balanced';
}

/** Empirical average response time per question (ms) observed in pilot.
 *  Used as the reference point for the "you're X% faster" microcopy. */
const AVG_RESPONSE_MS = 18_000;

export type SpeedKey = 'fast' | 'normal' | 'slow';

export interface SpeedInsight {
  /** Average ms per question across all four domains. */
  avgMs: number;
  /** Whole-number percent faster (+) or slower (−) than the reference. */
  deltaPct: number;
  key: SpeedKey;
}

/**
 * Convert the four-domain timing object into a single "how fast did
 * you answer" insight. Bands:
 *   - fast:   >= 15% under the avg
 *   - normal: within ±15%
 *   - slow:   >= 15% over the avg
 *
 * Returns null when no timing data is available (older sessions, or
 * Supabase-stored sessions where we don't yet persist timing).
 */
/**
 * Map total test duration onto a rough "you finished faster than X%
 * of takers" percentile. The reference distribution is the same
 * normal model as the IQ band — mean 7 min (420s), SD 2 min (120s).
 * We treat _faster_ as the higher percentile (40th percentile of time
 * → "faster than 40%") because that's how users naturally read it.
 *
 * Returns null when `durationMs` is missing or under 90s (probably a
 * bot / abandoned session) — we don't want to flatter people for
 * spamming A.
 */
const DURATION_MEAN_S = 420;
const DURATION_SD_S = 120;

export function durationPercentile(durationMs: number | null): number | null {
  if (!durationMs || durationMs < 90_000) return null;
  const seconds = durationMs / 1000;
  const z = (seconds - DURATION_MEAN_S) / DURATION_SD_S;
  // Lower seconds → lower z → lower CDF → larger "faster than %".
  // P(takers slower than me) = 1 - CDF(z)
  const cum = normalCdf(z);
  const fasterThanPct = Math.round((1 - cum) * 100);
  // Avoid extreme edges that look like fabrications.
  return Math.max(1, Math.min(99, fasterThanPct));
}

function normalCdf(z: number): number {
  // Abramowitz & Stegun 26.2.17 approximation — identical to the one in
  // lib/scoring/index.ts but duplicated here to keep classify.ts free
  // of cross-module dependencies (avoids circular imports).
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * absZ);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);
  return 0.5 * (1 + sign * y);
}

export function speedInsight(timing: {
  verbal: number;
  numerical: number;
  spatial: number;
  logical: number;
} | undefined): SpeedInsight | null {
  if (!timing) return null;
  const values = Object.values(timing).filter((v) => v > 0);
  if (values.length === 0) return null;
  const avgMs = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  // Positive delta means faster. (avg - me) / avg
  const deltaPct = Math.round(((AVG_RESPONSE_MS - avgMs) / AVG_RESPONSE_MS) * 100);
  let key: SpeedKey = 'normal';
  if (deltaPct >= 15) key = 'fast';
  else if (deltaPct <= -15) key = 'slow';
  return { avgMs, deltaPct, key };
}

/**
 * Reference "average" category scores used for comparison visualization.
 * These are intentionally close to 50–60% to fit a believable peer baseline.
 */
export const AVERAGE_CATEGORY_SCORES: CategoryScores = {
  verbal: 56,
  numerical: 52,
  spatial: 48,
  logical: 54,
};
