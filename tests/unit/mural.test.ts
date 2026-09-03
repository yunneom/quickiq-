import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  MURAL_STYLES,
  MURAL_STYLE_IDS,
  fitHeadline,
  muralEligible,
  muralOverlaySvg,
  muralPrompt,
  optionsAreFigureRefs,
  cardFigureSvg,
} from '../../lib/social/mural';
import { pickMuralForSlot, countByStyle, type MuralEntry } from '../../lib/social/murals';
import { recolorFigureSvg, SHAPE_POSTS } from '../../lib/social/shape-quizzes';

const OPTS = [
  { id: 'a', text: '9' },
  { id: 'b', text: '13' },
  { id: 'c', text: '14' },
  { id: 'd', text: '15' },
];

describe('mural headline fitting', () => {
  it('never drops words from a long prompt — it shrinks the type instead', () => {
    // The first cut truncated at three lines, which silently ate the tail
    // of this exact prompt ("...MIRRORED. Which" — the rest gone).
    const prompt =
      'Three are the same shape rotated. One is MIRRORED. Which one is the odd one out?';
    const { lines, size } = fitHeadline(prompt, { boxWidth: 1252 });
    assert.equal(lines.join(' '), prompt, 'every word must survive the wrap');
    assert.ok(size >= 56 && size <= 100, `unexpected size ${size}`);
  });

  it('keeps a short prompt on one big line', () => {
    const { lines, size } = fitHeadline('다음 수는?', { boxWidth: 1252 });
    assert.equal(lines.length, 1);
    assert.equal(size, 100);
  });

  it('wraps an unbroken Korean run instead of letting it overflow the wall', () => {
    // Korean routinely runs long stretches with no spaces; a space-only
    // wrapper leaves this on one line running off both edges.
    const run = '가나다라마바사아자차카타파하가나다라마바사아자차카타파하';
    const { lines, size } = fitHeadline(run, { boxWidth: 600 });
    assert.ok(lines.length > 1, 'unbroken Korean must still wrap');
    assert.equal(lines.join(''), run, 'no character may be lost in the break');
    for (const line of lines) {
      assert.ok(line.length * size <= 600 + size, `line too wide: ${line}`);
    }
  });

  it('measures Hangul as full-width, so the same count of Korean chars wraps wider', () => {
    const ko = fitHeadline('가나다라 마바사아 자차카타 파하가나', { boxWidth: 600 });
    const en = fitHeadline('abcd efgh ijkl mnop', { boxWidth: 600 });
    assert.ok(
      ko.lines.length >= en.lines.length,
      `Korean (${ko.lines.length}) should not wrap looser than Latin (${en.lines.length})`,
    );
  });
});

describe('mural eligibility', () => {
  it('accepts text-only and figure cards', () => {
    assert.equal(muralEligible({ scene: undefined }), true);
    assert.equal(muralEligible({ scene: { kind: 'figure', svg: '<svg/>', aspect: 1 } }), true);
  });

  it('rejects scenes whose content lives in a satori component', () => {
    // Painting only the prompt of these would ship the question without
    // the numbers/bars that ARE the question.
    assert.equal(muralEligible({ scene: { kind: 'sequence', items: ['1', '2', '?'] } }), false);
    assert.equal(muralEligible({ scene: { kind: 'bars', items: [] } }), false);
    assert.equal(muralEligible({ scene: { kind: 'road', lanes: [] } }), false);
  });

  it('exposes the figure svg only for figure scenes', () => {
    assert.equal(cardFigureSvg({ scene: { kind: 'figure', svg: '<svg id="x"/>', aspect: 1 } }), '<svg id="x"/>');
    assert.equal(cardFigureSvg({ scene: { kind: 'sequence', items: [] } }), undefined);
  });
});

describe('option suppression', () => {
  it('treats "Shape A".."Shape D" as pointers into the figure', () => {
    assert.equal(
      optionsAreFigureRefs([
        { text: 'Shape A' },
        { text: 'Shape B' },
        { text: 'Shape C' },
        { text: 'Shape D' },
      ]),
      true,
    );
  });

  it('keeps real answers — dropping them would leave nothing to choose', () => {
    assert.equal(optionsAreFigureRefs(OPTS), false);
    assert.equal(optionsAreFigureRefs([]), false);
  });

  it('draws the option list for every numeric shape family, and only those', () => {
    for (const post of SHAPE_POSTS) {
      const refs = optionsAreFigureRefs(post.options);
      const numeric = post.options.every((o) => /^\d+$/.test(o.text));
      assert.equal(
        refs,
        !numeric,
        `${post.id}: numeric answers must always be painted as an option list`,
      );
    }
  });
});

describe('figure recolouring', () => {
  const style = MURAL_STYLES.plaster;

  it('replaces every white ink with the wall paint, keeping alpha', () => {
    const out = recolorFigureSvg(
      '<svg><rect fill="rgba(255,255,255,0.94)"/><g stroke="rgba(255, 255, 255, 0.45)"/></svg>',
      { ink: '#3A2F28', accent: '#B4451F', outline: '#F0E6D6' },
    );
    assert.ok(!/255,\s*255,\s*255/.test(out), 'no white may survive');
    assert.match(out, /rgba\(58, 47, 40, 0\.94\)/);
    assert.match(out, /rgba\(58, 47, 40, 0\.45\)/);
  });

  it('leaves no white ink in any real shape figure', () => {
    for (const post of SHAPE_POSTS) {
      const out = recolorFigureSvg(post.svg, {
        ink: style.ink,
        accent: style.accent,
        outline: style.outline,
      });
      assert.ok(
        !/rgba\(255,\s*255,\s*255/.test(out),
        `${post.id} still has white ink after recolour`,
      );
    }
  });

  it('falls back to white rather than blanking a figure on a bad ink value', () => {
    const out = recolorFigureSvg('<svg><rect fill="rgba(255,255,255,0.9)"/></svg>', {
      ink: 'not-a-colour',
      accent: '#fff',
      outline: '#000',
    });
    assert.match(out, /rgba\(255, 255, 255, 0\.9\)/);
  });
});

describe('mural overlay layout', () => {
  const style = MURAL_STYLES.plaster;

  it('paints the headline and every option, and stays inside the wall', () => {
    const svg = muralOverlaySvg({
      style,
      card: { prompt: 'How many squares do you see?', options: OPTS },
      handle: '@quickiq',
    });
    for (const o of OPTS) assert.ok(svg.includes(`>${o.text}<`), `missing option ${o.text}`);
    assert.ok(svg.includes('@quickiq'));
    // Nothing may be painted below the region reserved for the person.
    const ys = [...svg.matchAll(/ y="([\d.]+)"/g)].map((m) => Number(m[1]));
    assert.ok(Math.max(...ys) <= style.blockBottom, 'paint escaped past blockBottom');
  });

  it('drops the handle rather than colliding when the wall runs out', () => {
    const tall = { ...style, blockBottom: style.textTop + 200 };
    const svg = muralOverlaySvg({
      style: tall,
      card: { prompt: 'A very long prompt that will wrap over several lines here', options: OPTS },
      handle: '@quickiq',
    });
    assert.ok(!svg.includes('@quickiq'), 'handle must be omitted, never clamped upward');
  });

  it('suppresses the option list when the figure already labels the tiles', () => {
    const rotate = SHAPE_POSTS.find((p) => p.id.startsWith('rotate-'))!;
    const svg = muralOverlaySvg({
      style,
      card: { prompt: rotate.prompt, options: rotate.options },
      figureSvg: rotate.svg,
    });
    assert.ok(!svg.includes('Shape A'), 'redundant option list painted under the figure');
  });

  it('escapes markup in prompts and options', () => {
    const svg = muralOverlaySvg({
      style,
      card: { prompt: '<script>x</script>', options: [{ id: 'a', text: 'a & b' }] },
    });
    assert.ok(!svg.includes('<script>'));
    assert.ok(svg.includes('&amp;'));
  });
});

describe('generation prompt', () => {
  it('forbids the failure modes actually observed from the model', () => {
    for (const id of MURAL_STYLE_IDS) {
      const p = muralPrompt(MURAL_STYLES[id]).toLowerCase();
      assert.ok(p.includes('no text anywhere'), `${id}: must forbid model-drawn text`);
      assert.ok(p.includes('no status bar'), `${id}: must forbid the hallucinated phone UI`);
      assert.ok(p.includes('from behind'), `${id}: subject must never face camera`);
    }
  });
});

describe('pool rotation', () => {
  const pool: MuralEntry[] = ['brick-1', 'night-1', 'plaster-1'].map((id) => ({
    id,
    style: id.split('-')[0] as MuralEntry['style'],
    storedAt: '2026-01-01T00:00:00Z',
  }));

  it('is deterministic for a given day and slot', () => {
    assert.equal(pickMuralForSlot(5, 1, pool)!.id, pickMuralForSlot(5, 1, pool)!.id);
  });

  it('walks the pool across consecutive slots', () => {
    const ids = [0, 1, 2].map((s) => pickMuralForSlot(5, s, pool)!.id);
    assert.equal(new Set(ids).size, 3, 'consecutive slots must not repeat a wall');
  });

  it('returns null on an empty pool so the card path still publishes', () => {
    assert.equal(pickMuralForSlot(1, 0, []), null);
  });

  it('counts every style, including the ones with nothing loaded', () => {
    const counts = countByStyle(pool);
    assert.equal(counts.brick, 1);
    assert.equal(counts.school, 0);
    assert.deepEqual(Object.keys(counts).sort(), [...MURAL_STYLE_IDS].sort());
  });
});
