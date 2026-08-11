import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pickComments } from '../../lib/social/comments';

describe('pickComments (seed engagement)', () => {
  it('is deterministic for a given (day, slot)', () => {
    const a = pickComments(20676, 1);
    const b = pickComments(20676, 1);
    assert.deepEqual(a, b);
  });

  it('returns two non-empty, distinct lines', () => {
    for (let day = 0; day < 20; day++) {
      for (let slot = 0; slot < 3; slot++) {
        const [cta, reaction] = pickComments(day, slot);
        assert.ok(cta.length > 0, `day ${day} slot ${slot}: empty CTA`);
        assert.ok(reaction.length > 0, `day ${day} slot ${slot}: empty reaction`);
        assert.notEqual(cta, reaction, `day ${day} slot ${slot}: identical pair`);
      }
    }
  });

  it('never leaks an answer letter/number pattern like "answer is X"', () => {
    for (let day = 0; day < 12; day++) {
      for (let slot = 0; slot < 3; slot++) {
        for (const line of pickComments(day, slot)) {
          assert.ok(!/answer is|correct answer/i.test(line), line);
        }
      }
    }
  });

  it('varies across consecutive posts (not stuck on one pair)', () => {
    const seen = new Set<string>();
    for (let ordinal = 0; ordinal < 8; ordinal++) {
      seen.add(pickComments(ordinal, 0).join('|'));
    }
    assert.ok(seen.size > 1, 'every post got the identical comment pair');
  });
});
