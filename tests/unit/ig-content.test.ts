import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  planForSlot,
  plansForDay,
  eligibleQuestions,
  baitPoolSize,
  baitPostsForTest,
  SLOTS_PER_DAY,
} from '../../lib/social/ig-content';

describe('plansForDay', () => {
  it('is deterministic — same day, same posts', () => {
    const a = plansForDay(20661);
    const b = plansForDay(20661);
    assert.deepEqual(
      a.map((p) => p.key),
      b.map((p) => p.key),
    );
  });

  it('produces one post per slot', () => {
    const plans = plansForDay(20661);
    assert.equal(plans.length, SLOTS_PER_DAY);
  });

  it('never repeats a post within a day', () => {
    for (let d = 0; d < 40; d++) {
      const keys = plansForDay(d).map((p) => p.key);
      assert.equal(new Set(keys).size, keys.length, `day ${d} repeats a post`);
    }
  });

  it('ends each day with a real test question, bait before it', () => {
    for (let d = 0; d < 20; d++) {
      const plans = plansForDay(d);
      plans.forEach((plan, slot) => {
        if (slot === SLOTS_PER_DAY - 1) {
          assert.match(plan.key, /^q-/, `day ${d} slot ${slot} should be a question`);
        } else {
          assert.match(plan.key, /^bait-/, `day ${d} slot ${slot} should be bait`);
        }
      });
    }
  });

  it('walks the bait pool without repeating until it is exhausted', () => {
    const keys: string[] = [];
    const days = Math.ceil(baitPoolSize() / (SLOTS_PER_DAY - 1));
    for (let d = 0; d < days; d++) {
      for (let slot = 0; slot < SLOTS_PER_DAY - 1; slot++) {
        const plan = planForSlot(d, slot);
        assert.ok(plan);
        keys.push(plan.key);
      }
    }
    assert.equal(new Set(keys).size, baitPoolSize());
  });

  it('every caption promotes the IQ test with the bio CTA', () => {
    for (let d = 0; d < 5; d++) {
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
    for (let d = 0; d < 20; d++) {
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
    for (let d = 0; d < 60; d++) {
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
  });
});

describe('bait pool integrity', () => {
  it('has unique ids', () => {
    const ids = baitPostsForTest().map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('every answer points at an option that exists', () => {
    for (const b of baitPostsForTest()) {
      assert.ok(
        b.options.some((o) => o.id === b.answer),
        `${b.id} answer ${b.answer} is not among its options`,
      );
    }
  });

  it('has no duplicate option ids or duplicate option text', () => {
    for (const b of baitPostsForTest()) {
      const ids = b.options.map((o) => o.id);
      const texts = b.options.map((o) => o.text.toLowerCase());
      assert.equal(new Set(ids).size, ids.length, `${b.id} has duplicate option ids`);
      assert.equal(new Set(texts).size, texts.length, `${b.id} has duplicate options`);
    }
  });

  it('is big enough to run 2 bait posts a day for a month without repeats', () => {
    assert.ok(
      baitPoolSize() >= 30 * (SLOTS_PER_DAY - 1) - 20,
      `bait pool is only ${baitPoolSize()}`,
    );
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

describe('cinematic background mapping', () => {
  it('every plan has a valid bg scene', () => {
    for (let d = 0; d < 60; d++) {
      for (const plan of plansForDay(d)) {
        assert.ok(
          ['rails', 'road', 'chalk', 'slate'].includes(plan.card.bg),
          `${plan.key} has bg ${plan.card.bg}`,
        );
      }
    }
  });

  it('rails is reserved for train/bridge problems, road for vehicular ones', () => {
    for (let d = 0; d < 120; d++) {
      for (const plan of plansForDay(d)) {
        const text = plan.card.prompt.toLowerCase();
        if (plan.card.bg === 'rails') {
          assert.ok(
            /train|bridge/.test(text),
            `${plan.key} got rails without a train: ${plan.card.prompt}`,
          );
        }
        if (plan.card.bg === 'road') {
          assert.ok(
            /km\/h|car|bus|cyclist|runner|race|driv/.test(text),
            `${plan.key} got road without a vehicle: ${plan.card.prompt}`,
          );
        }
      }
    }
  });
});

describe('copy safety (regressions found by the English audit)', () => {
  it('no hook or badge leaks the correct answer', () => {
    for (const b of baitPostsForTest()) {
      const correct = b.options.find((o) => o.id === b.answer);
      assert.ok(correct, `${b.id} has no correct option`);
      const answer = correct.text.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (answer.length < 5) continue; // numbers collide by chance
      for (const plan of [b]) {
        const surfaces = [plan.hook, plan.badge ?? ''].join(' ').toLowerCase();
        assert.ok(
          !surfaces.replace(/[^a-z0-9]/g, '').includes(answer),
          `${b.id} leaks "${correct.text}" in its hook/badge`,
        );
      }
    }
  });

  it('hooks survive the ASCII badge filter intact', () => {
    // hookBadge strips non-ASCII, so a curly apostrophe would silently
    // publish DONT / ISNT / NATURES in 27px caps.
    for (const b of baitPostsForTest()) {
      assert.ok(
        !/[‘’“”]/.test(b.hook),
        `${b.id} hook uses a curly quote that the badge filter deletes`,
      );
    }
  });

  it('every caption is solvable on its own — sequences included', () => {
    for (let d = 0; d < 120; d++) {
      for (const plan of plansForDay(d)) {
        if (plan.card.scene?.kind !== 'sequence') continue;
        // Whitespace-insensitive: the caption may render "2 + 3 = 10"
        // where the tile reads "2+3=10" — same information either way.
        const flat = plan.caption.replace(/\s+/g, '');
        for (const tile of plan.card.scene.items.filter((i) => i !== '?')) {
          assert.ok(
            flat.includes(tile.replace(/\s+/g, '')),
            `${plan.key} caption is missing "${tile}" from its sequence`,
          );
        }
      }
    }
  });

  it('uses US spelling and time formats', () => {
    const british = /\b(metres?|maths|favourite|colour|analyse)\b/i;
    for (const b of baitPostsForTest()) {
      const all = [b.hook, b.prompt, b.explain, ...b.options.map((o) => o.text)].join(' ');
      assert.ok(!british.test(all), `${b.id} uses British spelling: ${all.match(british)?.[0]}`);
      for (const o of b.options) {
        assert.ok(
          !/^\s*(after\s+)?\d+\s*h(\s|$|\s*\d)/i.test(o.text),
          `${b.id} option "${o.text}" uses the "2 h 30" format`,
        );
      }
    }
  });
});

describe('Instagram distribution rules', () => {
  it('stays within the 5-hashtag cap', () => {
    for (let d = 0; d < 30; d++) {
      for (const plan of plansForDay(d)) {
        const tags = plan.caption.match(/#\w+/g) ?? [];
        assert.ok(
          tags.length <= 5,
          `${plan.key} has ${tags.length} hashtags: ${tags.join(' ')}`,
        );
      }
    }
  });

  it('opens every caption with a searchable phrase, not an emoji', () => {
    for (let d = 0; d < 20; d++) {
      for (const plan of plansForDay(d)) {
        const first = plan.caption.split('\n')[0];
        assert.ok(/^[A-Za-z]/.test(first), `${plan.key} caption starts with "${first.slice(0, 20)}"`);
        assert.ok(first.length >= 15, `${plan.key} opening line is too thin`);
      }
    }
  });
});
