/**
 * Shared reel geometry/timing — imported by BOTH the edge frame renderer
 * and the node video builder, so it must stay dependency-free.
 *
 * A reel is built from a handful of still frames:
 *   frame 0..countdownFrom-1  → countdown "5", "4", … "1" (1s each)
 *   frame countdownFrom       → outro card, held for outroSeconds
 * Total: countdownFrom + outroSeconds seconds of video.
 */
export const REEL = {
  width: 1080,
  height: 1920,
  fps: 30,
  countdownFrom: 5,
  outroSeconds: 3,
} as const;

export const REEL_FRAME_COUNT = REEL.countdownFrom + 1;

export const REEL_DURATION_SECONDS = REEL.countdownFrom + REEL.outroSeconds;

/** Per-frame hold times, in render order. */
export function reelFrameSchedule(): Array<{ frame: number; seconds: number }> {
  const schedule: Array<{ frame: number; seconds: number }> = [];
  for (let i = 0; i < REEL.countdownFrom; i++) {
    schedule.push({ frame: i, seconds: 1 });
  }
  schedule.push({ frame: REEL.countdownFrom, seconds: REEL.outroSeconds });
  return schedule;
}
