import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { bucket, variantAB } from '../../lib/ab';

describe('bucket', () => {
  it('is stable for the same input', () => {
    const id = 'fixture-session-id-1234';
    const a = bucket(id, 4);
    const b = bucket(id, 4);
    assert.equal(a, b);
  });

  it('respects the bucket count', () => {
    const id = 'fixture-session-id-1234';
    for (let n = 1; n <= 8; n++) {
      const v = bucket(id, n);
      assert.ok(v >= 0 && v < n, `bucket=${v} out of range for n=${n}`);
    }
  });

  it('salt changes the bucket', () => {
    const id = 'fixture-session-id-1234';
    // It's unlikely (but not impossible) for two salts to yield the
    // same bucket. Try several until we observe a difference.
    let differs = false;
    for (let i = 0; i < 20; i++) {
      if (bucket(id, 2, `salt-${i}`) !== bucket(id, 2, `other-${i}`)) {
        differs = true;
        break;
      }
    }
    assert.ok(differs, 'salt should affect bucket assignment');
  });

  it('roughly even distribution over 10k synthetic UUIDs (50/50 ± 3%)', () => {
    let a = 0;
    let b = 0;
    for (let i = 0; i < 10_000; i++) {
      if (bucket(randomUUID(), 2) === 0) a++;
      else b++;
    }
    const skew = Math.abs(a - b) / 10_000;
    assert.ok(skew < 0.03, `skew=${skew} too large (a=${a}, b=${b})`);
  });
});

describe('variantAB', () => {
  it('returns a or b', () => {
    const v = variantAB(randomUUID());
    assert.ok(v === 'a' || v === 'b');
  });

  it('different salts can flip the same id', () => {
    // Same property as the bucket salt test, expressed through the
    // public AB API.
    const id = randomUUID();
    let flipped = false;
    for (let i = 0; i < 20; i++) {
      if (variantAB(id, `salt-${i}`) !== variantAB(id, `other-${i}`)) {
        flipped = true;
        break;
      }
    }
    assert.ok(flipped, 'distinct salts should produce distinct assignments');
  });
});
