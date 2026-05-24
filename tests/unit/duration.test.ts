import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { durationPercentile } from '../../lib/scoring/classify';

describe('durationPercentile', () => {
  it('returns null on null input', () => {
    assert.equal(durationPercentile(null), null);
  });

  it('returns null for sub-90s sessions (bot threshold)', () => {
    assert.equal(durationPercentile(0), null);
    assert.equal(durationPercentile(60_000), null);
    assert.equal(durationPercentile(89_999), null);
  });

  it('clamps to [1, 99] at extreme ends', () => {
    // Very fast (30s) should clamp at 99
    const fast = durationPercentile(120_000);
    assert.ok(fast !== null);
    assert.ok(fast >= 1 && fast <= 99);

    // Very slow (30 min) should clamp at 1
    const slow = durationPercentile(30 * 60_000);
    assert.ok(slow !== null);
    assert.ok(slow >= 1 && slow <= 99);
  });

  it('treats faster sessions as higher percentile', () => {
    // 5 minutes (300s) vs 9 minutes (540s) — 5min is faster
    // → should be a *larger* "faster than X%" number.
    const five = durationPercentile(5 * 60_000);
    const nine = durationPercentile(9 * 60_000);
    assert.ok(five !== null && nine !== null);
    assert.ok(
      five > nine,
      `expected faster session (5min, pct=${five}) > slower (9min, pct=${nine})`,
    );
  });

  it('returns ~50 at the reference mean (~7 min)', () => {
    const r = durationPercentile(7 * 60_000);
    assert.ok(r !== null);
    assert.ok(
      r >= 45 && r <= 55,
      `expected ~50 at reference mean, got ${r}`,
    );
  });
});
