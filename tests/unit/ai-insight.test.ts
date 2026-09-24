import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildInsightPrompt, parseInsight } from '../../lib/ai/insight';

const input = {
  locale: 'ko' as const,
  testName: '16 성격 유형',
  profile: {
    name: 'INFP',
    tagline: '조용한 이상주의자',
    strengths: ['공감', '창의성'],
    weaknesses: ['우유부단'],
  },
  axisLines: ['외향 E 37% / 63% 내향 I', '감각 S 40% / 60% 직관 N'],
};

describe('buildInsightPrompt', () => {
  it('embeds type, axes and guardrails', () => {
    const { system, prompt } = buildInsightPrompt(input);
    assert.match(prompt, /INFP/);
    assert.match(prompt, /63% 내향 I/);
    assert.match(system, /진단/); // forbids diagnosis
    assert.match(system, /JSON/);
  });

  it('switches language for en', () => {
    const { system } = buildInsightPrompt({ ...input, locale: 'en' });
    assert.match(system, /second person/);
    assert.doesNotMatch(system, /존댓말/);
  });
});

describe('parseInsight', () => {
  it('accepts {"items":[...]} with exactly 3 strings', () => {
    const out = parseInsight(
      '{"items":["내향 63%라 혼자 충전하는 시간이 중요해요.","직관형이라 큰 그림을 먼저 보는 편이에요.","공감 능력이 강점이에요."]}',
      'ko',
    );
    assert.ok(out);
    assert.equal(out?.length, 3);
  });

  it('accepts a bare array and strips code fences', () => {
    const out = parseInsight(
      '```json\n["You recharge alone (63% introvert).","You see the big picture first.","Empathy is your edge."]\n```',
      'en',
    );
    assert.equal(out?.length, 3);
  });

  it('caps overly long items with an ellipsis', () => {
    const long = 'a'.repeat(200);
    const out = parseInsight(JSON.stringify({ items: [long, long, long] }), 'ko');
    assert.ok(out);
    for (const s of out ?? []) {
      assert.ok(s.length <= 90);
      assert.ok(s.endsWith('…'));
    }
  });

  it('returns null on wrong count, garbage, or non-strings', () => {
    assert.equal(parseInsight('{"items":["only one sentence here"]}', 'ko'), null);
    assert.equal(parseInsight('sorry, I cannot help', 'ko'), null);
    assert.equal(parseInsight('{"items":[1,2,3]}', 'ko'), null);
  });
});
