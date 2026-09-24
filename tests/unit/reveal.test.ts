import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  IG_COMMENT_MAX,
  REVEAL_WINDOW_DAYS,
  parsePostKey,
  planForLedgerKey,
  revealComment,
  revealDueDays,
} from '../../lib/social/reveal';
import { ONE_A_DAY_EPOCH, plansForDay, type IgPostPlan } from '../../lib/social/ig-content';

const E = ONE_A_DAY_EPOCH;

describe('parsePostKey', () => {
  it('reads a scheduled key back into its parts', () => {
    assert.deepEqual(parsePostKey('20707:0:bait-shape-cubes-8'), {
      day: 20707,
      slot: 0,
      planKey: 'bait-shape-cubes-8',
      test: null,
    });
  });

  it('reads legacy three-slot keys and real-question keys', () => {
    assert.deepEqual(parsePostKey('20704:2:q-en-003'), {
      day: 20704,
      slot: 2,
      planKey: 'q-en-003',
      test: null,
    });
  });

  it('separates a test label so a test post can be refused', () => {
    assert.deepEqual(parsePostKey('20707:0:bait-shape-cubes-8:test-1'), {
      day: 20707,
      slot: 0,
      planKey: 'bait-shape-cubes-8',
      test: '1',
    });
  });

  it('rejects anything that is not a ledger key', () => {
    for (const bad of ['', 'nope', '20707', '20707:0', '20707:x:foo', '-1:0:foo', '20707:0:']) {
      assert.equal(parsePostKey(bad), null, JSON.stringify(bad));
    }
  });
});

describe('revealDueDays', () => {
  it('covers the last few days and never today', () => {
    const days = revealDueDays(20710);
    assert.deepEqual(days, [20707, 20708, 20709]);
    assert.equal(days.length, REVEAL_WINDOW_DAYS);
    assert.ok(!days.includes(20710));
  });

  it('does not reach below day zero', () => {
    assert.deepEqual(revealDueDays(1), [0]);
    assert.deepEqual(revealDueDays(0), []);
  });
});

describe('revealComment', () => {
  const withText: IgPostPlan = {
    key: 'bait-x',
    caption: 'c',
    card: {
      label: 'L',
      badge: null,
      prompt: 'p',
      options: [
        { id: 'A', text: '40 km/h' },
        { id: 'B', text: '48 km/h' },
      ],
      bg: 'slate',
      theme: 'blue',
      footer: 'f',
    },
    answer: 'B',
    explain: 'Harmonic mean.',
  };

  it('names the option, repeats its text, explains, and ends with the bio CTA', () => {
    const text = revealComment(withText)!;
    assert.ok(text.startsWith('✅ Answer: B — 48 km/h'), text);
    assert.ok(text.includes('Harmonic mean.'));
    assert.ok(text.includes('link in bio'));
  });

  it('drops the option text when the options are only figure references', () => {
    const shapes: IgPostPlan = {
      ...withText,
      card: {
        ...withText.card,
        options: ['A', 'B', 'C', 'D'].map((id) => ({ id, text: `Shape ${id}` })),
      },
    };
    const text = revealComment(shapes)!;
    assert.ok(text.startsWith('✅ Answer: B\n'), text);
    assert.ok(!text.includes('Shape B'));
  });

  it('returns null when the plan carries no answer', () => {
    assert.equal(revealComment({ ...withText, answer: undefined }), null);
    assert.equal(revealComment({ ...withText, answer: '  ' }), null);
  });

  it('can reveal every post on the current cadence, inside the comment limit', () => {
    // The whole point: no scheduled post may be un-revealable, and none
    // may produce a comment Instagram would reject.
    for (let d = E - 12; d < E + 60; d++) {
      for (const plan of plansForDay(d)) {
        const text = revealComment(plan);
        assert.ok(text, `${d}: ${plan.key} has no reveal`);
        assert.ok(text.length <= IG_COMMENT_MAX, `${plan.key} reveal is ${text.length} chars`);
        assert.ok(text.includes(`Answer: ${plan.answer}`), `${plan.key} does not name its answer`);
        if (plan.explain) assert.ok(text.includes(plan.explain.trim()), `${plan.key} lost its explanation`);
      }
    }
  });
});

describe('planForLedgerKey', () => {
  it('resolves a real ledger key back to the same plan', () => {
    for (const d of [E - 2, E, E + 3, E + 7]) {
      plansForDay(d).forEach((plan, slot) => {
        const parsed = parsePostKey(`${d}:${slot}:${plan.key}`)!;
        assert.equal(planForLedgerKey(parsed)?.key, plan.key);
      });
    }
  });

  it('refuses when the key no longer matches — content changed under a live post', () => {
    const plan = plansForDay(E + 1)[0];
    const parsed = parsePostKey(`${E + 1}:0:${plan.key}-edited`)!;
    assert.equal(planForLedgerKey(parsed), null);
  });

  it('refuses a slot that does not exist', () => {
    const parsed = parsePostKey(`${E + 1}:5:whatever`)!;
    assert.equal(planForLedgerKey(parsed), null);
  });
});
