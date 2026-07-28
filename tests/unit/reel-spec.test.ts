import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REEL,
  REEL_FRAMES,
  REEL_FRAME_COUNT,
  REEL_DURATION_SECONDS,
  reelFrameSchedule,
  reelFrameKey,
} from '../../lib/social/reel-spec';

describe('reel spec', () => {
  it('meets Instagram REELS constraints', () => {
    // 9:16 exactly — IG recommends 0.5625 for full-bleed reels.
    assert.equal(REEL.width / REEL.height, 9 / 16);
    // Even dimensions (H.264 4:2:0 requires them).
    assert.equal(REEL.width % 2, 0);
    assert.equal(REEL.height % 2, 0);
    // 23–60 fps per spec.
    assert.ok(REEL.fps >= 23 && REEL.fps <= 60);
    // Reels must be at least 3 seconds.
    assert.ok(REEL_DURATION_SECONDS >= 3);
  });

  it('gives the question enough reading time (no countdown pressure)', () => {
    const reading = REEL_FRAMES.filter((f) => f.key !== 'outro').reduce(
      (sum, f) => sum + f.seconds,
      0,
    );
    assert.ok(reading >= 8, `only ${reading}s of reading time`);
  });

  it('schedule covers every frame exactly once, in order', () => {
    const schedule = reelFrameSchedule();
    assert.equal(schedule.length, REEL_FRAME_COUNT);
    schedule.forEach((s, i) => assert.equal(s.frame, i));
  });

  it('schedule seconds sum to the reel duration', () => {
    const total = reelFrameSchedule().reduce((sum, s) => sum + s.seconds, 0);
    assert.equal(total, REEL_DURATION_SECONDS);
  });

  it('clamps frame indexes to a valid role', () => {
    assert.equal(reelFrameKey(-3), REEL_FRAMES[0].key);
    assert.equal(reelFrameKey(99), REEL_FRAMES[REEL_FRAME_COUNT - 1].key);
  });

  it('ends on the call to action', () => {
    assert.equal(REEL_FRAMES[REEL_FRAME_COUNT - 1].key, 'outro');
  });
});
