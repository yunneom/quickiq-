import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REEL,
  REEL_FRAMES,
  TIMER_SECONDS,
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

  it('gives at least 20s of solving time, timer bar matching it', () => {
    const question =
      REEL_FRAMES.find((f) => f.key === 'question')?.seconds ?? 0;
    assert.ok(question >= 20, `only ${question}s of solving time`);
    assert.equal(question, TIMER_SECONDS);
  });

  it('runs the ad AFTER the clock, never inside the solving window', () => {
    const order = REEL_FRAMES.map((f) => f.key);
    assert.ok(
      order.indexOf('ad') > order.indexOf('question'),
      'the ad must not interrupt solving time',
    );
    // Nothing before the ad may be counted as ad time.
    const beforeAd = REEL_FRAMES.slice(0, order.indexOf('ad')).reduce(
      (sum, f) => sum + f.seconds,
      0,
    );
    assert.equal(beforeAd, TIMER_SECONDS);
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
