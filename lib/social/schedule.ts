/**
 * Publishing cadence — the one place the "posts per day" number lives.
 *
 * Leaf module on purpose (no imports): the content planner, the asset
 * rotations (clips, walls, soundtrack, seed comments) and the cron all
 * read it, and several of those are imported BY the planner, so it has
 * to sit below all of them.
 *
 * Cadence history:
 *   · before ONE_A_DAY_EPOCH — 3 posts/day (two cron runs × 2 slots)
 *   · from  ONE_A_DAY_EPOCH — 1 post/day. Reach on the new account fell
 *     sharply under 3/day: same-template reels compete with each other
 *     in the ranker, and each one dilutes the completion/save rate the
 *     account is judged on. Fewer, better.
 *
 * The epoch exists because the day index is also the rotation cursor
 * for every content pool and the ledger key. Rewriting the formula for
 * ALL days would silently change what past days "were": the retry path
 * that reclaims yesterday's failed slot would compute a different post,
 * and every pool would be re-walked from a new position — re-serving
 * puzzles that went out last week. So days before the epoch keep the
 * old arithmetic exactly, and the new arithmetic starts from where the
 * old one stopped.
 */

/** First UTC day index (days since 1970-01-01) on the 1-post/day cadence: 2026-09-09. */
export const ONE_A_DAY_EPOCH = 20705;

export const LEGACY_SLOTS_PER_DAY = 3;
export const SLOTS_PER_DAY = 1;

/** Posts planned for a given day. */
export function slotsForDay(dayIndex: number): number {
  return dayIndex < ONE_A_DAY_EPOCH ? LEGACY_SLOTS_PER_DAY : SLOTS_PER_DAY;
}

/**
 * Monotone post counter across the cadence change — the cursor the
 * asset rotations index their pools with.
 *
 * Continuity matters more here than it looks: the old `dayIndex * 3 +
 * slot` kept stepping by 3 per day once there was only one slot, and
 * `% 3 === 0` forever means a pool of exactly three clips (the
 * collector's per-scene target) would serve the SAME clip every single
 * day. Stepping by one per day walks every pool fully whatever its size.
 */
export function postOrdinal(dayIndex: number, slot: number): number {
  if (dayIndex < ONE_A_DAY_EPOCH) return dayIndex * LEGACY_SLOTS_PER_DAY + slot;
  return ONE_A_DAY_EPOCH * LEGACY_SLOTS_PER_DAY + (dayIndex - ONE_A_DAY_EPOCH) * SLOTS_PER_DAY + slot;
}
