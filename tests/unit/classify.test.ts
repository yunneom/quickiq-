import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyIq,
  leadSizeKey,
  strengthsAndWeaknesses,
  summaryHookKey,
} from '../../lib/scoring/classify';

describe('classifyIq', () => {
  it('maps IQ to band', () => {
    assert.equal(classifyIq(135), 'veryHigh');
    assert.equal(classifyIq(125), 'high');
    assert.equal(classifyIq(115), 'aboveAverage');
    assert.equal(classifyIq(100), 'average');
    assert.equal(classifyIq(85), 'belowAverage');
  });

  it('uses inclusive lower bounds on band edges', () => {
    assert.equal(classifyIq(130), 'veryHigh');
    assert.equal(classifyIq(120), 'high');
    assert.equal(classifyIq(110), 'aboveAverage');
    assert.equal(classifyIq(90), 'average');
    assert.equal(classifyIq(89), 'belowAverage');
  });
});

describe('summaryHookKey', () => {
  it('maps percentile to hook variant', () => {
    assert.equal(summaryHookKey(5), 'summaryHookHigh');
    assert.equal(summaryHookKey(16), 'summaryHookHigh');
    assert.equal(summaryHookKey(35), 'summaryHookMid');
    assert.equal(summaryHookKey(50), 'summaryHookMid');
    assert.equal(summaryHookKey(75), 'summaryHookLow');
  });
});

describe('strengthsAndWeaknesses', () => {
  it('picks max + min category', () => {
    const r = strengthsAndWeaknesses({
      verbal: 80,
      numerical: 50,
      spatial: 70,
      logical: 60,
    });
    assert.equal(r.strength, 'verbal');
    assert.equal(r.weakness, 'numerical');
  });

  it('breaks ties by first-encountered (stable)', () => {
    const r = strengthsAndWeaknesses({
      verbal: 60,
      numerical: 60,
      spatial: 60,
      logical: 60,
    });
    assert.equal(r.strength, 'verbal');
    assert.equal(r.weakness, 'verbal');
  });
});

describe('leadSizeKey', () => {
  it('dominant when gap >= 18', () => {
    assert.equal(
      leadSizeKey({ verbal: 90, numerical: 50, spatial: 60, logical: 65 }),
      'dominant',
    );
  });
  it('clear when gap in [8, 18)', () => {
    assert.equal(
      leadSizeKey({ verbal: 75, numerical: 60, spatial: 65, logical: 67 }),
      'clear',
    );
  });
  it('balanced when gap < 8', () => {
    assert.equal(
      leadSizeKey({ verbal: 65, numerical: 62, spatial: 60, logical: 63 }),
      'balanced',
    );
  });
});
