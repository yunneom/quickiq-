import type {
  AxisScoreMap,
  PersonalityAnswer,
  PersonalityQuestion,
} from './types';

/**
 * Shared scoring primitives for personality tests. Each option carries an
 * AxisScoreMap; these helpers tally answers into per-axis totals and then
 * resolve a winner. Test-specific index.ts files compose these into a
 * final profileId (e.g. MBTI concatenates 4 dichotomy winners, love-lang
 * picks the single top axis).
 */

/** Sum every selected option's per-axis points into a single totals map. */
export function tallyAxes(
  answers: PersonalityAnswer[],
  questions: PersonalityQuestion[],
): AxisScoreMap {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const totals: AxisScoreMap = {};
  for (const ans of answers) {
    if (!ans.selected_id) continue;
    const q = qMap.get(ans.question_id);
    if (!q) continue;
    const opt = q.options.find((o) => o.id === ans.selected_id);
    if (!opt) continue;
    for (const [axis, pts] of Object.entries(opt.scores)) {
      totals[axis] = (totals[axis] ?? 0) + pts;
    }
  }
  return totals;
}

/**
 * Pick the highest-scoring axis from a candidate list. Ties resolve to the
 * earlier axis in `order` so results are deterministic. Used by love-lang
 * (5 axes) and enneagram (9 axes).
 */
export function dominantAxis(scores: AxisScoreMap, order: string[]): string {
  let best = order[0];
  let bestScore = scores[best] ?? 0;
  for (const axis of order) {
    const s = scores[axis] ?? 0;
    if (s > bestScore) {
      best = axis;
      bestScore = s;
    }
  }
  return best;
}

/**
 * For a binary dichotomy (e.g. E vs I), return whichever pole scored higher.
 * Ties resolve to `low` (the second arg) so we never over-claim the louder
 * pole on a 50/50 split — mirrors teto-egen's "ties go to E" rule.
 */
export function dichotomyWinner(
  scores: AxisScoreMap,
  high: string,
  low: string,
): string {
  return (scores[high] ?? 0) > (scores[low] ?? 0) ? high : low;
}

/** Axis totals sorted high → low, as [axis, score] pairs. For ranked bars. */
export function rankAxes(
  scores: AxisScoreMap,
  order: string[],
): Array<[string, number]> {
  return order
    .map((axis) => [axis, scores[axis] ?? 0] as [string, number])
    .sort((a, b) => b[1] - a[1]);
}

/** Convert two axis totals into a 0–100 percentage for the first axis. */
export function axisPct(scores: AxisScoreMap, a: string, b: string): number {
  const av = scores[a] ?? 0;
  const bv = scores[b] ?? 0;
  const total = av + bv || 1;
  return Math.round((av / total) * 100);
}
