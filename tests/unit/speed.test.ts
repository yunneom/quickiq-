import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { speedInsight } from '../../lib/scoring/classify';

describe('speedInsight', () => {
  // The internal reference is 18_000ms per question — see classify.ts.

  it('returns null when timing is undefined', () => {
    assert.equal(speedInsight(undefined), null);
  });

  it('returns null when all timing values are zero', () => {
    const r = speedInsight({ verbal: 0, numerical: 0, spatial: 0, logical: 0 });
    assert.equal(r, null);
  });

  it('bands "fast" at >=15% under the reference', () => {
    // 15s per question → 17% faster → "fast"
    const r = speedInsight({
      verbal: 15000,
      numerical: 15000,
      spatial: 15000,
      logical: 15000,
    });
    assert.ok(r);
    assert.equal(r.key, 'fast');
    assert.ok(r.deltaPct >= 15);
  });

  it('bands "slow" at >=15% over the reference', () => {
    // 22s per question → ~22% slower → "slow"
    const r = speedInsight({
      verbal: 22000,
      numerical: 22000,
      spatial: 22000,
      logical: 22000,
    });
    assert.ok(r);
    assert.equal(r.key, 'slow');
    assert.ok(r.deltaPct <= -15);
  });

  it('bands "normal" inside the ±15% band', () => {
    // 18s per question = exactly the reference → 0% delta → normal
    const r = speedInsight({
      verbal: 18000,
      numerical: 18000,
      spatial: 18000,
      logical: 18000,
    });
    assert.ok(r);
    assert.equal(r.key, 'normal');
    assert.equal(r.deltaPct, 0);
  });

  it('ignores zero entries when averaging', () => {
    // One category had no recorded time (e.g. all-empty answers in a
    // single domain). The average is taken over the non-zero subset.
    const r = speedInsight({
      verbal: 18000,
      numerical: 18000,
      spatial: 0,
      logical: 18000,
    });
    assert.ok(r);
    assert.equal(r.avgMs, 18000);
    assert.equal(r.key, 'normal');
  });
});
