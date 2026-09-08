import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ONE_A_DAY_EPOCH,
  LEGACY_SLOTS_PER_DAY,
  SLOTS_PER_DAY,
  postOrdinal,
  slotsForDay,
} from '../../lib/social/schedule';
import { pickMuralForSlot, type MuralEntry } from '../../lib/social/murals';
import { pickClipForSlot, type ClipEntry } from '../../lib/social/clips';
import { pickTrackId } from '../../lib/social/audio';

const E = ONE_A_DAY_EPOCH;

describe('cadence', () => {
  it('is 3/day before the epoch and 1/day from it', () => {
    assert.equal(slotsForDay(E - 1), LEGACY_SLOTS_PER_DAY);
    assert.equal(slotsForDay(E), SLOTS_PER_DAY);
    assert.equal(SLOTS_PER_DAY, 1);
  });

  it('postOrdinal is continuous across the switch and monotone', () => {
    // Last legacy post is (E-1, slot 2); the first new post must be the very next number.
    assert.equal(postOrdinal(E, 0), postOrdinal(E - 1, LEGACY_SLOTS_PER_DAY - 1) + 1);
    let prev = -1;
    for (let d = E - 10; d < E + 10; d++) {
      for (let s = 0; s < slotsForDay(d); s++) {
        const o = postOrdinal(d, s);
        assert.ok(o > prev, `ordinal went backwards at day ${d} slot ${s}`);
        prev = o;
      }
    }
  });

  it('steps by one per day after the epoch, so a 3-item pool no longer repeats daily', () => {
    // Regression: `dayIndex * 3 + slot` with a single slot is ≡ 0 (mod 3)
    // forever — a pool of exactly three clips (the collector's per-scene
    // target) would have served the same clip every day.
    for (let d = E; d < E + 30; d++) {
      assert.equal(postOrdinal(d + 1, 0) - postOrdinal(d, 0), 1);
    }
  });
});

describe('asset rotations walk a 3-item pool over consecutive days (post-epoch)', () => {
  const murals: MuralEntry[] = ['a', 'b', 'c'].map((id) => ({
    id,
    style: 'plaster',
    storedAt: 'x',
  }));
  const clips: ClipEntry[] = ['a', 'b', 'c'].map((id) => ({ id, scene: 'rails', storedAt: 'x' }));
  const tracks = ['t-a', 't-b', 't-c'];

  it('murals', () => {
    const ids = [0, 1, 2].map((k) => pickMuralForSlot(E + k, 0, murals)!.id);
    assert.equal(new Set(ids).size, 3, `same wall repeated: ${ids.join(',')}`);
  });

  it('clips', () => {
    const ids = [0, 1, 2].map((k) => pickClipForSlot('rails', E + k, 0, clips)!.id);
    assert.equal(new Set(ids).size, 3, `same clip repeated: ${ids.join(',')}`);
  });

  it('soundtrack', () => {
    const ids = [0, 1, 2].map((k) => pickTrackId(E + k, 0, tracks));
    assert.equal(new Set(ids).size, 3, `same track repeated: ${ids.join(',')}`);
  });

  it('legacy days are untouched: three slots on one pre-epoch day still differ', () => {
    const ids = [0, 1, 2].map((s) => pickClipForSlot('rails', E - 5, s, clips)!.id);
    assert.equal(new Set(ids).size, 3);
  });
});
