import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { planForDay, eligibleQuestions } from '../../lib/social/ig-content';

describe('planForDay', () => {
  it('is deterministic — same day, same post', () => {
    const a = planForDay(20661);
    const b = planForDay(20661);
    assert.ok(a && b);
    assert.equal(a.key, b.key);
    assert.equal(a.caption, b.caption);
  });

  it('follows the [bait, bait, question] 3-day cycle', () => {
    for (let d = 0; d < 30; d++) {
      const plan = planForDay(d);
      assert.ok(plan, `no plan for day ${d}`);
      if (d % 3 === 2) {
        assert.match(plan.key, /^q-/, `day ${d} should be a question post`);
      } else {
        assert.match(plan.key, /^bait-/, `day ${d} should be a bait post`);
      }
    }
  });

  it('walks the bait pool without skipping or repeating within a cycle', () => {
    // Consecutive bait slots must advance the pool by exactly one entry.
    const keys: string[] = [];
    for (let d = 0; d < 39; d++) {
      if (d % 3 === 2) continue;
      const plan = planForDay(d);
      assert.ok(plan);
      keys.push(plan.key);
    }
    // 26 bait slots over 39 days; pool must not repeat until exhausted.
    const poolSize = new Set(keys).size;
    assert.deepEqual(keys.slice(0, poolSize), [...new Set(keys)]);
  });

  it('every caption promotes the IQ test with the bio CTA', () => {
    for (let d = 0; d < 6; d++) {
      const plan = planForDay(d);
      assert.ok(plan);
      assert.ok(
        plan.caption.includes('link in bio'),
        `day ${d} caption is missing the bio CTA`,
      );
      assert.ok(plan.caption.includes('#quickiq'));
    }
  });

  it('cards are always renderable: prompt + at least 2 options', () => {
    for (let d = 0; d < 60; d++) {
      const plan = planForDay(d);
      assert.ok(plan);
      assert.ok(plan.card.prompt.length > 0);
      assert.ok(plan.card.options.length >= 2);
      for (const o of plan.card.options) {
        assert.ok(o.text.length > 0, `day ${d} option ${o.id} has empty text`);
      }
    }
  });
});

describe('eligibleQuestions', () => {
  it('never includes figure-based or spatial items', () => {
    for (const q of eligibleQuestions()) {
      assert.ok(!q.figure_id);
      assert.ok(!q.question_image_url);
      assert.notEqual(q.category, 'spatial');
    }
  });
});
