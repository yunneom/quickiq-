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
