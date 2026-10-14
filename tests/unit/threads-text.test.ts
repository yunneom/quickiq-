import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { THREADS_TEXT_MAX, threadsLink, threadsPostText } from '../../lib/social/threads-text';
import { ONE_A_DAY_EPOCH, plansForDay, type IgPostPlan } from '../../lib/social/ig-content';

const SITE = 'https://iq.example.com';

function plan(over: Partial<IgPostPlan> = {}): IgPostPlan {
  return {
    key: 'bait-x',
    card: {
      label: 'LOGIC',
      badge: null,
      prompt: 'card prompt',
      options: [
        { id: 'A', text: '10' },
        { id: 'B', text: '12' },
      ],
      bg: 'chalk',
      theme: 'blue',
      footer: 'f',
    },
    caption: 'ig caption #iqtest',
    answer: 'B',
    explain: 'because',
    hook: '90% get this wrong 👀',
    prompt: 'What comes next? 2, 4, 6, ?',
    ...over,
  } as IgPostPlan;
}

describe('threadsPostText', () => {
  it('leads with the hook and carries a tracked, clickable link', () => {
    const text = threadsPostText(plan(), SITE, 'daily');
    assert.ok(text.startsWith('90% get this wrong'));
    assert.ok(text.includes(threadsLink(SITE, 'daily')));
    assert.ok(text.includes('utm_source=threads'));
    assert.ok(!/link in bio/i.test(text));
  });

  it('uses the full prompt, not the card prompt', () => {
    const text = threadsPostText(plan(), SITE, 'daily');
    assert.ok(text.includes('2, 4, 6, ?'));
    assert.ok(!text.includes('card prompt'));
  });

  it('carries exactly one hashtag (Threads reads it as the topic)', () => {
    const text = threadsPostText(plan(), SITE, 'daily');
    assert.equal(text.match(/#\w+/g)?.length, 1);
  });

  it('never states the answer or the explanation', () => {
    const text = threadsPostText(plan({ explain: 'SECRET-EXPLAIN' }), SITE, 'daily');
    assert.ok(!text.includes('SECRET-EXPLAIN'));
    assert.ok(!/answer:/i.test(text));
  });

  it('drops figure-only options', () => {
    const p = plan();
    p.card.options = [
      { id: 'A', text: 'Shape A' },
      { id: 'B', text: 'Shape B' },
    ];
    assert.ok(!threadsPostText(p, SITE, 'daily').includes('Shape A'));
  });

  it('stays under the limit and keeps the link when the prompt is huge', () => {
    const text = threadsPostText(plan({ prompt: 'x'.repeat(900) }), SITE, 'encore');
    assert.ok(text.length <= THREADS_TEXT_MAX, `length ${text.length}`);
    assert.ok(text.includes(threadsLink(SITE, 'encore')));
  });

  it('fits every real plan for a full cycle under the limit', () => {
    for (let d = ONE_A_DAY_EPOCH; d < ONE_A_DAY_EPOCH + 60; d++) {
      for (const p of plansForDay(d)) {
        const text = threadsPostText(p, 'https://iq.dailyenterkr.com', 'daily');
        assert.ok(text.length <= THREADS_TEXT_MAX, `${p.key}: ${text.length}`);
        assert.ok(p.hook && text.startsWith(p.hook.slice(0, 10)), p.key);
        if (p.answer && p.explain) assert.ok(!text.includes(p.explain), p.key);
      }
    }
  });
});
