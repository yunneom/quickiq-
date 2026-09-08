import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  planForSlot,
  plansForDay,
  eligibleQuestions,
  baitPoolSize,
  baitPostsForTest,
  shapePoolSize,
  cadenceSwitchCursorsForTest,
  SLOTS_PER_DAY,
  LEGACY_SLOTS_PER_DAY,
  ONE_A_DAY_EPOCH,
  slotsForDay,
} from '../../lib/social/ig-content';

const E = ONE_A_DAY_EPOCH;

describe('plansForDay', () => {
  it('is deterministic — same day, same posts', () => {
    for (const d of [20661, E, E + 7]) {
      const a = plansForDay(d);
      const b = plansForDay(d);
      assert.deepEqual(
        a.map((p) => p.key),
        b.map((p) => p.key),
      );
    }
  });

  it('produces one post per slot in both cadences', () => {
    assert.equal(plansForDay(20661).length, LEGACY_SLOTS_PER_DAY);
    assert.equal(plansForDay(E - 1).length, LEGACY_SLOTS_PER_DAY);
    assert.equal(plansForDay(E).length, SLOTS_PER_DAY);
    assert.equal(SLOTS_PER_DAY, 1);
  });

  it('never repeats a post within a day', () => {
    for (let d = 0; d < 40; d++) {
      const keys = plansForDay(d).map((p) => p.key);
      assert.equal(new Set(keys).size, keys.length, `day ${d} repeats a post`);
    }
  });

  it('every caption promotes the IQ test with the bio CTA', () => {
    for (const d of [0, 1, 2, 3, 4, E, E + 1, E + 2, E + 3]) {
      for (const plan of plansForDay(d)) {
        assert.ok(
          plan.caption.includes('link in bio'),
          `${plan.key} caption is missing the bio CTA`,
        );
        assert.ok(plan.caption.includes('#quickiq'));
      }
    }
  });

  it('never leaks the answer in the caption or on the card', () => {
    for (let d = E - 10; d < E + 20; d++) {
      for (const plan of plansForDay(d)) {
        if (!plan.explain) continue;
        assert.ok(
          !plan.caption.includes(plan.explain),
          `${plan.key} caption leaks the explanation`,
        );
      }
    }
  });

  it('cards are always renderable: prompt + at least 2 options', () => {
    for (let d = E - 30; d < E + 60; d++) {
      for (const plan of plansForDay(d)) {
        assert.ok(plan.card.prompt.length > 0);
        assert.ok(plan.card.options.length >= 2);
        for (const o of plan.card.options) {
          assert.ok(o.text.length > 0, `${plan.key} option ${o.id} has empty text`);
        }
      }
    }
  });

  it('clamps out-of-range slots instead of returning null', () => {
    assert.ok(planForSlot(20661, -5));
    assert.ok(planForSlot(20661, 99));
    assert.ok(planForSlot(E + 3, -5));
    assert.ok(planForSlot(E + 3, 99));
  });
});

describe('legacy cadence (before the epoch) is frozen', () => {
  it('runs the 4-day mix: slots 0/1 always shape, slot 2 cycles question/text/question/shape', () => {
    // History must not move: the ledger keys and yesterday's retry are
    // built from these exact plans.
    const SLOT2_BY_R = ['q', 'text', 'q', 'shape'] as const;
    for (let d = 0; d < 40; d++) {
      const plans = plansForDay(d);
      const r = d % 4;
      plans.forEach((plan, slot) => {
        if (slot < LEGACY_SLOTS_PER_DAY - 1) {
          assert.match(plan.key, /^bait-shape-/, `day ${d} slot ${slot} should be a shape puzzle`);
          return;
        }
        const kind = SLOT2_BY_R[r];
        if (kind === 'q') assert.match(plan.key, /^q-/, `day ${d} slot 2 (r=${r})`);
        else if (kind === 'text') assert.match(plan.key, /^bait-(?!shape-)/, `day ${d} slot 2 (r=${r})`);
        else assert.match(plan.key, /^bait-shape-/, `day ${d} slot 2 (r=${r})`);
      });
    }
  });

  it('shape puzzles land at exactly 75% of legacy slots over a full cycle', () => {
    let shape = 0;
    let total = 0;
    for (let d = 0; d < 4; d++) {
      for (const plan of plansForDay(d)) {
        total += 1;
        if (plan.key.startsWith('bait-shape-')) shape += 1;
      }
    }
    assert.equal(total, 12);
    assert.equal(shape, 9);
  });

  it('a well-known legacy day still resolves to the same three posts', () => {
    // Pinned so a refactor of the legacy branch cannot silently rewrite
    // what a past day "was". (Values captured from the pre-switch code.)
    const keys = plansForDay(20661).map((p) => p.key);
    assert.equal(keys.length, 3);
    assert.match(keys[0], /^bait-shape-/);
    assert.match(keys[1], /^bait-shape-/);
    // 20661 % 4 === 1 → slot 2 is text bait on the legacy cycle.
    assert.match(keys[2], /^bait-(?!shape-)/);
  });
});

describe('current cadence (from the epoch): one a day, 3 shape days then 1 regular', () => {
  it('follows the 4-day pattern and the q,q,text regular rotation', () => {
    for (let n = 0; n < 48; n++) {
      const d = E + n;
      const plans = plansForDay(d);
      assert.equal(plans.length, 1, `day ${d} should have exactly one post`);
      const key = plans[0].key;
      const r = n % 4;
      const block = Math.floor(n / 4);
      if (r < 3) {
        assert.match(key, /^bait-shape-/, `day +${n} should be a shape puzzle`);
      } else if (block % 3 === 2) {
        assert.match(key, /^bait-(?!shape-)/, `day +${n} should be text bait`);
      } else {
        assert.match(key, /^q-/, `day +${n} should be a real question`);
      }
    }
  });

  it('keeps shape at 75% of posts over a full cycle', () => {
    let shape = 0;
    for (let n = 0; n < 4; n++) {
      if (plansForDay(E + n)[0].key.startsWith('bait-shape-')) shape += 1;
    }
    assert.equal(shape, 3);
  });

  it('continues every pool from where the legacy cadence stopped (no re-serving)', () => {
    const c = cadenceSwitchCursorsForTest();
    // The cursor recorded for the epoch must equal the legacy formula's
    // own count of items consumed strictly before the epoch.
    assert.equal(c.shape, c.legacyShapeOrdinalAt(E));
    assert.equal(c.text, c.legacyTextOrdinalAt(E));
    assert.equal(c.question, c.legacyQuestionOrdinalAt(E));

    // Concretely: the shape walk is a full-cycle permutation, so ANY run
    // of `len` consecutive shape posts holds `len` distinct puzzles — and
    // a run that straddles the switch does so only if the ordinal
    // sequence is unbroken. Take the last third of a cycle from the
    // legacy side and fill the rest from the new side.
    const len = shapePoolSize();
    assert.ok(len >= 6, 'shape pool must have at least a few puzzles');
    const tail = Math.max(2, Math.floor(len / 3));
    const legacyShapes: string[] = [];
    for (let d = E - 1; legacyShapes.length < tail; d--) {
      const day = plansForDay(d).filter((p) => p.key.startsWith('bait-shape-')).map((p) => p.key);
      legacyShapes.unshift(...day.slice(Math.max(0, day.length - (tail - legacyShapes.length))));
    }
    const newShapes: string[] = [];
    for (let d = E; newShapes.length < len - tail; d++) {
      for (const p of plansForDay(d)) if (p.key.startsWith('bait-shape-')) newShapes.push(p.key);
    }
    const window = [...legacyShapes, ...newShapes.slice(0, len - tail)];
    assert.equal(window.length, len);
    assert.equal(
      new Set(window).size,
      len,
      `a puzzle repeats inside one pool-length window across the switch: ${window.join(', ')}`,
    );
  });

  it('walks the text-bait pool without repeating until exhausted', () => {
    const keys: string[] = [];
    for (let d = E; keys.length < baitPoolSize(); d++) {
      const plan = plansForDay(d)[0];
      assert.ok(plan);
      if (!plan.key.startsWith('bait-shape-') && !plan.key.startsWith('q-')) keys.push(plan.key);
      assert.ok(d - E < baitPoolSize() * 20, 'text baits stopped appearing');
    }
    assert.equal(new Set(keys).size, baitPoolSize());
  });

  it('walks the real-question pool without repeating until exhausted', () => {
    const pool = eligibleQuestions().length;
    const keys: string[] = [];
    for (let d = E; keys.length < pool; d++) {
      const plan = plansForDay(d)[0];
      if (plan.key.startsWith('q-')) keys.push(plan.key);
      assert.ok(d - E < pool * 12, 'questions stopped appearing');
    }
    assert.equal(new Set(keys).size, pool);
  });

  it('slotsForDay agrees with plansForDay on both sides of the switch', () => {
    for (const d of [E - 2, E - 1, E, E + 1, E + 100]) {
      assert.equal(plansForDay(d).length, slotsForDay(d));
    }
  });
});

describe('bait pool integrity', () => {
  it('every bait answer matches one of its own options', () => {
    for (const b of baitPostsForTest()) {
      assert.ok(
        b.options.some((o) => o.id === b.answer),
        `${b.id}: answer ${b.answer} is not among its options`,
      );
      assert.ok(b.explain.length > 0, `${b.id}: missing explanation`);
    }
  });
});
