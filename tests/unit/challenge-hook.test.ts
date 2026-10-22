import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { challengeHeadlinesForTest, challengeHook } from '../../lib/social/challenge-hook';

describe('challengeHook', () => {
  it('is deterministic per day and rotates through every headline', () => {
    assert.deepEqual(challengeHook(20740), challengeHook(20740));
    const n = challengeHeadlinesForTest().length;
    const seen = new Set(Array.from({ length: n }, (_, i) => challengeHook(20740 + i).headline));
    assert.equal(seen.size, n);
  });

  it('every headline is two short ASCII lines (the frame has no emoji font)', () => {
    for (const h of challengeHeadlinesForTest()) {
      const lines = h.split('\n');
      assert.equal(lines.length, 2, h);
      for (const line of lines) {
        assert.ok(/^[\x20-\x7E]+$/.test(line), line);
        assert.ok(line.length <= 20, line);
      }
    }
  });

  it('never puts a made-up statistic on other people', () => {
    for (const h of challengeHeadlinesForTest()) {
      assert.ok(!/%|\b\d+\s*(in|of|out of)\s*\d+/i.test(h), h);
    }
  });
});
