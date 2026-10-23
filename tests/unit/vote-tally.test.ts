import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MIN_VOTES, revealComment, tallyVotes, voteLine } from '../../lib/social/reveal';
import type { IgPostPlan } from '../../lib/social/ig-content';

const OPTIONS = [
  { id: 'A', text: '8' },
  { id: 'B', text: '9' },
  { id: 'C', text: '10' },
  { id: 'D', text: '11' },
];

const c = (author: string, text: string) => ({ author, text });

describe('tallyVotes', () => {
  it('counts bare letters, lead-ins and exact option text', () => {
    const t = tallyVotes(
      [c('u1', 'B'), c('u2', 'b!!'), c('u3', 'answer: C'), c('u4', "it's d 🤔"), c('u5', '10')],
      OPTIONS,
    );
    assert.equal(t.total, 5);
    assert.deepEqual(t.counts, { B: 2, C: 2, D: 1 });
  });

  it('ignores sentences, emoji-only and off-range letters', () => {
    const t = tallyVotes(
      [c('u1', 'A tricky one!'), c('u2', '🔥🔥'), c('u3', 'E'), c('u4', 'I think B or C'), c('u5', 'Comment A, B, C or D')],
      OPTIONS,
    );
    assert.equal(t.total, 0);
  });

  it('keeps only the first vote per account', () => {
    const t = tallyVotes([c('u1', 'A'), c('U1', 'B'), c('u2', 'B')], OPTIONS);
    assert.deepEqual(t.counts, { A: 1, B: 1 });
  });

  it('does not match figure-reference option text', () => {
    const t = tallyVotes([c('u1', 'shape a')], [{ id: 'A', text: 'Shape A' }]);
    assert.equal(t.total, 0);
  });
});

describe('voteLine', () => {
  it('stays silent under the minimum sample', () => {
    assert.equal(voteLine('B', { total: MIN_VOTES - 1, counts: { B: 1 } }), null);
    assert.equal(voteLine('B', undefined), null);
  });

  it('provokes with the real share and names the trap answer', () => {
    const line = voteLine('B', { total: 20, counts: { A: 11, B: 5, C: 4 } });
    assert.equal(line, '📊 Only 25% of you got this right (20 answers). Most went with A (55%).');
  });

  it('switches tone when most people got it', () => {
    const line = voteLine('B', { total: 10, counts: { B: 7, A: 3 } }) ?? '';
    assert.ok(line.startsWith('📊 70% of you got it right (10 answers)'), line);
  });
});

describe('revealComment with votes', () => {
  it('puts the real split right under the answer', () => {
    const plan = {
      key: 'bait-x',
      card: { label: 'L', badge: null, prompt: 'p', options: OPTIONS, bg: 'chalk', theme: 'blue', footer: 'f' },
      caption: 'c',
      answer: 'B',
      explain: 'Because.',
    } as IgPostPlan;
    const text = revealComment(plan, { total: 8, counts: { B: 2, C: 6 } }) ?? '';
    const lines = text.split('\n');
    assert.equal(lines[0], '✅ Answer: B — 9');
    assert.ok(lines[1].startsWith('📊 Only 25% of you got this right (8 answers).'), lines[1]);
    assert.equal(revealComment(plan)?.includes('📊'), false);
  });
});
