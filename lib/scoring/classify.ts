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
 * Reference "average" category scores used for comparison visualization.
 * These are intentionally close to 50–60% to fit a believable peer baseline.
 */
export const AVERAGE_CATEGORY_SCORES: CategoryScores = {
  verbal: 56,
  numerical: 52,
  spatial: 48,
  logical: 54,
};
