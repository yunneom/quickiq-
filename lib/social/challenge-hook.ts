import { TIMER_SECONDS } from './reel-spec';

/**
 * The reel's first-frame headline — the "only sharp minds get this"
 * line that has to stop the thumb before the 3-second mark, where
 * Instagram decides whether a reel keeps getting shown.
 *
 * It makes the viewer feel singled out (exclusivity + a challenge)
 * WITHOUT inventing a statistic. "Only 20% can solve this" next to a
 * paid IQ product is a factual claim we can't back up, and a made-up
 * figure in promotion of something we sell is deceptive advertising. So
 * these lines dare and flatter but never put a number on other people.
 * A real solve rate can join this list once one is measured.
 *
 * ASCII only: the frame renderer ships no emoji font.
 */

export interface ChallengeHook {
  kicker: string;
  /** Two short lines, split on '\n'. */
  headline: string;
}

const HEADLINES = [
  'ONLY SHARP MINDS\nGET THIS ONE',
  `SOLVE IT IN ${TIMER_SECONDS}s?\nYOU'RE NOT AVERAGE`,
  'GENIUS-LEVEL\nPUZZLE',
  `CAN YOU BEAT\nTHE ${TIMER_SECONDS}s TIMER?`,
  "DON'T SCROLL.\nPROVE IT FIRST.",
  'YOUR BRAIN VS\nTHIS PUZZLE',
  'LOOKS EASY.\nIT ISN\'T.',
] as const;

/** Deterministic per day, so every frame of one reel agrees. */
export function challengeHook(dayIndex: number): ChallengeHook {
  const i = ((dayIndex % HEADLINES.length) + HEADLINES.length) % HEADLINES.length;
  return { kicker: 'DAILY IQ CHALLENGE', headline: HEADLINES[i] };
}

/** Exposed for tests. */
export function challengeHeadlinesForTest(): readonly string[] {
  return HEADLINES;
}
