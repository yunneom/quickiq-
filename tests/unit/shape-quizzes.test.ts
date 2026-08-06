import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SHAPE_POSTS,
  ROTATION_SPECS,
  MIRROR_SPECS,
  LINE_SPECS,
  CUBE_SPECS,
  squaresInGrid,
  trianglesInTriangle,
  segmentIntersections,
  totalCubes,
  markTileSvg,
  triangleGridGeometry,
} from '../../lib/social/shape-quizzes';
import { plansForDay, shapePoolSize } from '../../lib/social/ig-content';

describe('shape pool integrity', () => {
  it('has a healthy pool with unique ids', () => {
    assert.ok(SHAPE_POSTS.length >= 20, `pool only ${SHAPE_POSTS.length}`);
    const ids = SHAPE_POSTS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate ids');
  });

  it('every post: answer is an option, options unique, figure present', () => {
    for (const p of SHAPE_POSTS) {
      const ids = p.options.map((o) => o.id);
      assert.ok(ids.includes(p.answer), `${p.id}: answer ${p.answer} not in options`);
      assert.equal(new Set(ids).size, ids.length, `${p.id}: dup option ids`);
      const texts = p.options.map((o) => o.text);
      assert.equal(new Set(texts).size, texts.length, `${p.id}: dup option texts`);
      assert.ok(p.svg.startsWith('<svg'), `${p.id}: no svg`);
      assert.ok(p.aspect > 0.2 && p.aspect < 1.1, `${p.id}: aspect ${p.aspect}`);
      assert.ok(p.explain.length > 10, `${p.id}: no explain`);
    }
  });

  it('figures never draw the answer as text', () => {
    for (const p of SHAPE_POSTS) {
      const answerText = p.options.find((o) => o.id === p.answer)!.text;
      if (/^\d+$/.test(answerText)) {
        const texts = [...p.svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(
          (m) => m[1],
        );
        assert.ok(
          !texts.includes(answerText),
          `${p.id}: figure prints the answer "${answerText}"`,
        );
      }
    }
  });
});

describe('answers are derived, not hand-counted', () => {
  it('square counts match Σk²', () => {
    assert.equal(squaresInGrid(3), 14);
    assert.equal(squaresInGrid(4), 30);
    assert.equal(squaresInGrid(5), 55);
    for (const n of [3, 4, 5]) {
      const post = SHAPE_POSTS.find((p) => p.id === `squares-${n}`)!;
      const answerText = post.options.find((o) => o.id === post.answer)!.text;
      assert.equal(Number(answerText), squaresInGrid(n), post.id);
      // The drawing really is an n×n grid: 2(n+1) lines.
      assert.equal(
        [...post.svg.matchAll(/<line /g)].length,
        2 * (n + 1),
        `${post.id}: grid line count`,
      );
    }
  });

  it('triangle counts match the closed form', () => {
    assert.equal(trianglesInTriangle(3), 13);
    assert.equal(trianglesInTriangle(4), 27);
    assert.equal(trianglesInTriangle(5), 48);
    for (const n of [3, 4, 5]) {
      const post = SHAPE_POSTS.find((p) => p.id === `triangles-${n}`)!;
      const answerText = post.options.find((o) => o.id === post.answer)!.text;
      assert.equal(Number(answerText), trianglesInTriangle(n), post.id);
      // Outer triangle (3) + 3 internal families of n−1 lines each.
      assert.equal(
        [...post.svg.matchAll(/<line /g)].length,
        3 + 3 * (n - 1),
        `${post.id}: subdivision line count`,
      );
    }
  });

  it('triangle figure IS the grid the formula counts: every crossing is a lattice point', () => {
    for (const n of [3, 4, 5]) {
      const { segments, lattice } = triangleGridGeometry(n);
      const flat = segments.map(
        ([p, q]) => [p[0], p[1], q[0], q[1]] as [number, number, number, number],
      );
      const crossings = segmentIntersections(flat);
      assert.ok(crossings.length > 0, `n=${n}: no internal crossings?`);
      for (const [x, y] of crossings) {
        const onLattice = lattice.some(
          ([lx, ly]) => Math.hypot(lx - x, ly - y) < 1.5,
        );
        assert.ok(
          onLattice,
          `n=${n}: crossing at (${x.toFixed(1)},${y.toFixed(1)}) is off-lattice — the drawing is not a triangular subdivision`,
        );
      }
    }
  });

  it('line-crossing answers are recomputed from the segment geometry', () => {
    for (const spec of LINE_SPECS) {
      const pts = segmentIntersections(spec.lines);
      const k = spec.lines.length;
      assert.equal(
        pts.length,
        (k * (k - 1)) / 2,
        `${spec.id}: not in general position`,
      );
      // Crossings must be visually distinct — no two closer than 24px.
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
          assert.ok(d >= 24, `${spec.id}: crossings ${i},${j} only ${d.toFixed(1)}px apart`);
        }
      }
      const post = SHAPE_POSTS.find((p) => p.id === spec.id)!;
      const answerText = post.options.find((o) => o.id === post.answer)!.text;
      assert.equal(Number(answerText), pts.length, spec.id);
    }
  });

  it('cube answers equal the height-map sum', () => {
    for (const spec of CUBE_SPECS) {
      const post = SHAPE_POSTS.find((p) => p.id === spec.id)!;
      const answerText = post.options.find((o) => o.id === post.answer)!.text;
      assert.equal(Number(answerText), totalCubes(spec.heights), spec.id);
      // Solid stack: 3 faces per cube.
      assert.equal(
        [...post.svg.matchAll(/<polygon /g)].length,
        totalCubes(spec.heights) * 3,
        `${spec.id}: face count`,
      );
    }
  });

  it('rotation puzzles: the correct option is exactly rotation 3·step, unmirrored', () => {
    for (const spec of ROTATION_SPECS) {
      const post = SHAPE_POSTS.find((p) => p.id === spec.id)!;
      const correct = spec.optionSpecs['ABCD'.indexOf(spec.answer)];
      assert.equal(correct.rotation % 360, (spec.step * 3) % 360, spec.id);
      assert.ok(!correct.mirror, `${spec.id}: correct option is mirrored`);
      // Exactly one option is correct: others differ by rotation or mirror.
      spec.optionSpecs.forEach((o, i) => {
        if ('ABCD'[i] === spec.answer) return;
        const sameRotation = o.rotation % 360 === (spec.step * 3) % 360;
        assert.ok(
          !sameRotation || o.mirror,
          `${spec.id}: option ${'ABCD'[i]} duplicates the answer`,
        );
      });
      // The svg really carries the option group with that transform.
      const g = post.svg.match(
        new RegExp(`<g id="opt-${spec.answer}" transform="([^"]+)"`),
      );
      assert.ok(g, `${spec.id}: option group missing`);
      assert.ok(g![1].includes(`rotate(${correct.rotation})`), spec.id);
      assert.ok(!g![1].includes('scale(-1 1)'), `${spec.id}: answer mirrored in svg`);
    }
  });

  it('mirror puzzles: exactly one tile is mirrored and it is the answer', () => {
    for (const spec of MIRROR_SPECS) {
      const mirrored = spec.tiles
        .map((t, i) => (t.mirror ? 'ABCD'[i] : null))
        .filter(Boolean);
      assert.deepEqual(mirrored, [spec.answer], spec.id);
      const post = SHAPE_POSTS.find((p) => p.id === spec.id)!;
      const g = post.svg.match(
        new RegExp(`<g id="opt-${spec.answer}" transform="([^"]+)"`),
      );
      assert.ok(g && g[1].includes('scale(-1 1)'), `${spec.id}: answer tile not mirrored`);
      // Rotations must be distinct so "which one differs" has one reading.
      const rots = spec.tiles.map((t) => t.rotation % 360);
      assert.equal(new Set(rots).size, rots.length, `${spec.id}: duplicate rotations`);
    }
  });
});

describe('every option tile is visually distinct (rasterized)', () => {
  // A mirror-symmetric mark would make "the mirrored one" identical to a
  // rotation — the exact bug this guards against. Rasterize every option
  // pair and require a real pixel difference.
  async function raster(svg: string): Promise<Buffer> {
    const sharp = (await import('sharp')).default;
    return sharp(Buffer.from(svg)).resize(96, 96).ensureAlpha().raw().toBuffer();
  }
  function diffRatio(a: Buffer, b: Buffer): number {
    let diff = 0;
    for (let i = 3; i < a.length; i += 4) {
      if (Math.abs(a[i] - b[i]) > 40) diff += 1;
    }
    return diff / (a.length / 4);
  }

  it('rotation puzzles: no two options rasterize alike', async () => {
    for (const spec of ROTATION_SPECS) {
      const tiles = await Promise.all(
        spec.optionSpecs.map((o) => raster(markTileSvg(spec.mark, o.rotation, o.mirror))),
      );
      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          assert.ok(
            diffRatio(tiles[i], tiles[j]) > 0.02,
            `${spec.id}: options ${'ABCD'[i]} and ${'ABCD'[j]} look identical`,
          );
        }
      }
    }
  });

  it('mirror puzzles: the mirrored tile differs from every rotation shown', async () => {
    for (const spec of MIRROR_SPECS) {
      const tiles = await Promise.all(
        spec.tiles.map((t) => raster(markTileSvg(spec.mark, t.rotation, t.mirror))),
      );
      for (let i = 0; i < tiles.length; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
          assert.ok(
            diffRatio(tiles[i], tiles[j]) > 0.02,
            `${spec.id}: tiles ${'ABCD'[i]} and ${'ABCD'[j]} look identical`,
          );
        }
      }
      // Stronger: the mirrored tile must not match ANY rotation of the
      // plain mark (else the "odd one out" could be read as a rotation).
      const mirroredIdx = spec.tiles.findIndex((t) => t.mirror);
      const mirrored = tiles[mirroredIdx];
      for (let r = 0; r < 360; r += 15) {
        const candidate = await raster(markTileSvg(spec.mark, r));
        assert.ok(
          diffRatio(mirrored, candidate) > 0.02,
          `${spec.id}: mirrored tile equals plain rotation ${r}°`,
        );
      }
    }
  });
});

describe('publishing mix', () => {
  it('shape puzzles take 50% of bait slots (1.5 of 3 posts/day avg)', () => {
    let shape = 0;
    let total = 0;
    for (let day = 20000; day < 20028; day++) {
      for (const plan of plansForDay(day)) {
        total += 1;
        if (plan.key.startsWith('bait-shape-')) shape += 1;
      }
    }
    assert.equal(total, 28 * 3);
    assert.equal(shape, 42, `expected 42 shape posts in 28 days, got ${shape}`);
  });

  it('consecutive shape slots never repeat a puzzle', () => {
    const seen: string[] = [];
    for (let day = 20000; day < 20000 + 16; day++) {
      for (const plan of plansForDay(day)) {
        if (plan.key.startsWith('bait-shape-')) seen.push(plan.key);
      }
    }
    for (let i = 1; i < seen.length; i++) {
      assert.notEqual(seen[i], seen[i - 1], `repeat at ${i}: ${seen[i]}`);
    }
    // A full cycle visits every pool entry.
    assert.equal(new Set(seen.slice(0, shapePoolSize())).size, shapePoolSize());
  });

  it('shape plans render as cards: label, figure scene, no answer-reveal', () => {
    for (let day = 20000; day < 20016; day++) {
      for (const plan of plansForDay(day)) {
        if (!plan.key.startsWith('bait-shape-')) continue;
        assert.equal(plan.card.label, 'VISUAL PUZZLE');
        assert.equal(plan.card.scene?.kind, 'figure');
        assert.equal(plan.card.bg, 'slate');
        assert.ok(plan.answer, plan.key);
        // Options (incl. the correct number) DO appear in the caption —
        // that is the accessible copy. What must never appear is which
        // one is right.
        assert.ok(plan.explain && !plan.caption.includes(plan.explain), plan.key);
        assert.ok(
          !/answer is|correct answer|answer:\s/i.test(plan.caption),
          `${plan.key}: caption reveals the answer`,
        );
      }
    }
  });
});
