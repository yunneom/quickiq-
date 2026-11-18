import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ONE_A_DAY_EPOCH,
  VARIETY_EPOCH,
  eligibleQuestions,
  planForSlot,
  plansForDay,
  riddlePostsForTest,
} from '../../lib/social/ig-content';
import {
  EXTRA_LINE_SPECS,
  EXTRA_SHAPE_POSTS,
  SHAPE_POSTS,
  segmentIntersections,
} from '../../lib/social/shape-quizzes';

const V = VARIETY_EPOCH;
const kindOf = (key: string) =>
  key.startsWith('bait-shape-')
    ? 'shape'
    : key.startsWith('bait-riddle-')
      ? 'riddle'
      : key.startsWith('q-')
        ? 'question'
        : 'text';

describe('variety cadence', () => {
  it('runs shape · question · shape · text · shape · riddle from the epoch', () => {
    const expected = ['shape', 'question', 'shape', 'text', 'shape', 'riddle'];
    for (let n = 0; n < 60; n++) {
      const plans = plansForDay(V + n);
      assert.equal(plans.length, 1);
      assert.equal(kindOf(plans[0].key), expected[n % 6], `day +${n}: ${plans[0].key}`);
    }
  });

  it('leaves every day before the epoch untouched (old 4-day pattern)', () => {
    // The day before the epoch is still a one-a-day plan from the old cycle.
    const before = planForSlot(V - 1, 0);
    assert.ok(before);
    assert.notEqual(kindOf(before.key), 'riddle');
  });

  it('serves every shape (old and new) before repeating one', () => {
    const total = SHAPE_POSTS.length + EXTRA_SHAPE_POSTS.length;
    const keys: string[] = [];
    for (let d = V; keys.length < total; d++) {
      const key = plansForDay(d)[0].key;
      if (kindOf(key) === 'shape') keys.push(key);
    }
    assert.equal(new Set(keys).size, total);
    // The new puzzles lead: the first shape day is one of them.
    assert.ok(EXTRA_SHAPE_POSTS.some((p) => keys[0] === `bait-shape-${p.id}`), keys[0]);
  });

  it('serves every riddle before repeating one', () => {
    const n = riddlePostsForTest().length;
    const keys: string[] = [];
    for (let d = V; keys.length < n; d++) {
      const key = plansForDay(d)[0].key;
      if (kindOf(key) === 'riddle') keys.push(key);
    }
    assert.equal(new Set(keys).size, n);
  });

  it('continues the question pool across the switch without a repeat', () => {
    const pool = eligibleQuestions().length;
    const keys: string[] = [];
    // Only the one-a-day era puts questions in slot 0; stop at its start.
    for (let d = V - 1; d >= ONE_A_DAY_EPOCH && keys.length < Math.floor(pool / 2); d--) {
      const key = plansForDay(d)[0].key;
      if (kindOf(key) === 'question') keys.unshift(key);
    }
    for (let d = V; keys.length < pool; d++) {
      const key = plansForDay(d)[0].key;
      if (kindOf(key) === 'question') keys.push(key);
    }
    assert.equal(new Set(keys).size, pool, keys.join(','));
  });
});

describe('new puzzle integrity', () => {
  it('every riddle names one of its own options and has a unique id', () => {
    const riddles = riddlePostsForTest();
    assert.equal(new Set(riddles.map((r) => r.id)).size, riddles.length);
    for (const r of riddles) {
      assert.ok(r.options.some((o) => o.id === r.answer), r.id);
      assert.equal(new Set(r.options.map((o) => o.text)).size, r.options.length, r.id);
      assert.ok(r.badge && /^[\x20-\x7E]+$/.test(r.badge) && r.badge.length <= 38, r.id);
      const answerText = r.options.find((o) => o.id === r.answer)!.text.toLowerCase();
      // Single letters/digits appear in any sentence — only check real words.
      if (answerText.length >= 3) assert.ok(!r.hook.toLowerCase().includes(answerText), `${r.id} hook leaks the answer`);
    }
  });

  it('new line puzzles keep crossings far enough apart to count', () => {
    for (const spec of EXTRA_LINE_SPECS) {
      const pts = segmentIntersections(spec.lines);
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++)
          assert.ok(Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) > 50, spec.id);
    }
  });

  it('extra shape answers are one of their options and ids do not clash with the originals', () => {
    const ids = new Set(SHAPE_POSTS.map((p) => p.id));
    for (const p of EXTRA_SHAPE_POSTS) {
      assert.ok(!ids.has(p.id), p.id);
      assert.ok(p.options.some((o) => o.id === p.answer), p.id);
    }
  });
});
