/**
 * Shared reel geometry/timing — imported by BOTH the edge frame renderer
 * and the node video builder, so it must stay dependency-free.
 *
 * A reel is built from three stills. There is deliberately NO countdown:
 * a ticking timer rushed viewers who were still reading the question, and
 * reading time is what makes them stop scrolling. Instead the question
 * holds long enough to read twice, gets a nudge frame that changes the
 * pixels (retention) without changing the puzzle, and closes on the CTA.
 */
export const REEL = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Frame roles, in render order. `f=<index>` on /api/ig/reel-frame. */
export const REEL_FRAMES = [
  { key: 'question', seconds: 12 },
  { key: 'nudge', seconds: 6 },
  { key: 'outro', seconds: 4 },
] as const;

export type ReelFrameKey = (typeof REEL_FRAMES)[number]['key'];

export const REEL_FRAME_COUNT = REEL_FRAMES.length;

export const REEL_DURATION_SECONDS = REEL_FRAMES.reduce(
  (sum, f) => sum + f.seconds,
  0,
);

/**
 * Answering window — everything before the outro. The on-screen timer
 * bar drains across exactly this many seconds.
 */
export const TIMER_SECONDS = REEL_FRAMES.filter(
  (f) => f.key !== 'outro',
).reduce((sum, f) => sum + f.seconds, 0);

/** Per-frame hold times, in render order. */
export function reelFrameSchedule(): Array<{ frame: number; seconds: number }> {
  return REEL_FRAMES.map((f, i) => ({ frame: i, seconds: f.seconds }));
}

/** Frame role for an index, clamped to the valid range. */
export function reelFrameKey(index: number): ReelFrameKey {
  const i = Math.min(Math.max(index, 0), REEL_FRAME_COUNT - 1);
  return REEL_FRAMES[i].key;
}
