/**
 * Shape/visual puzzle pool — the "figure" half of the bait rotation.
 *
 * Visual puzzles stop a thumb harder than text (you can attempt one
 * without reading), so they get ~75% of the publishing slots. Every
 * figure is GENERATED from parameters and its answer is derived from the
 * same parameters — never hand-counted — so a miscounted figure cannot
 * ship: the unit tests recompute each answer from the geometry.
 *
 * Families:
 *   · squares  — "how many squares?" on an n×n grid   (Σ k², provable)
 *   · triangles — count in a side-n triangular grid   (known closed form)
 *   · rotate   — shape rotates by a fixed step, pick the next frame
 *   · mirror   — 4 tiles, three rotations + one mirrored: odd one out
 *   · lines    — k lines in general position → C(k,2) intersections
 *   · cubes    — solid isometric stack → total cubes = Σ heights
 *
 * SVG strings are rendered by resvg via an <img data:> in the card, so
 * full SVG (transforms included) is available — satori's JSX limits
 * don't apply inside the figure.
 */

import type { IgCardOption } from './ig-content';

export interface ShapePost {
  /** Stable id — part of the ledger key, never reuse or rename. */
  id: string;
  hook: string;
  badge: string | null;
  prompt: string;
  options: IgCardOption[];
  /** Self-contained figure, white-on-transparent for the dark panel. */
  svg: string;
  /** height / width — the renderer computes the box from this. */
  aspect: number;
  answer: string;
  explain: string;
}

/** Logical drawing width; the renderer scales to the card. */
const W = 840;

const INK = 'rgba(255,255,255,0.94)';
const INK_SOFT = 'rgba(255,255,255,0.45)';
const GOLD = '#FFE14D';

function svgDoc(height: number, body: string): { svg: string; aspect: number } {
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${height}">${body}</svg>`,
    aspect: height / W,
  };
}

// ---------------------------------------------------------------------------
// squares — how many squares in an n×n grid (all sizes)
// ---------------------------------------------------------------------------

/** Σ k² for k=1..n — the number of axis-aligned squares in an n×n grid. */
export function squaresInGrid(n: number): number {
  let total = 0;
  for (let k = 1; k <= n; k++) total += k * k;
  return total;
}

function squaresFigure(n: number): { svg: string; aspect: number } {
  const side = 520;
  const cell = side / n;
  const x0 = (W - side) / 2;
  const y0 = 30;
  const lines: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = i * cell;
    lines.push(
      `<line x1="${x0}" y1="${y0 + p}" x2="${x0 + side}" y2="${y0 + p}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
      `<line x1="${x0 + p}" y1="${y0}" x2="${x0 + p}" y2="${y0 + side}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    );
  }
  return svgDoc(side + 60, lines.join(''));
}

// ---------------------------------------------------------------------------
// triangles — count ALL triangles in a side-n triangular grid
// ---------------------------------------------------------------------------

/**
 * Closed form for the number of triangles (both orientations, all sizes)
 * in an equilateral triangle subdivided into unit triangles of side n:
 * floor(n(n+2)(2n+1)/8).
 */
export function trianglesInTriangle(n: number): number {
  return Math.floor((n * (n + 2) * (2 * n + 1)) / 8);
}

type Pt = [number, number];
const mixPt = (p: Pt, q: Pt, t: number): Pt => [
  p[0] + (q[0] - p[0]) * t,
  p[1] + (q[1] - p[1]) * t,
];

/**
 * The subdivision segments AND the lattice vertices for a side-n
 * triangular grid — exported so the test can verify that every crossing
 * in the drawing lands on a lattice point (i.e. the figure really is
 * the grid the closed-form counts).
 */
export function triangleGridGeometry(n: number): {
  segments: Array<[Pt, Pt]>;
  lattice: Pt[];
  height: number;
} {
  const sideLen = 600;
  const h = (sideLen * Math.sqrt(3)) / 2;
  const A: Pt = [W / 2, 26];
  const B: Pt = [(W - sideLen) / 2, 26 + h];
  const C: Pt = [(W + sideLen) / 2, 26 + h];

  const segments: Array<[Pt, Pt]> = [
    [A, B],
    [B, C],
    [C, A],
  ];
  for (let k = 1; k < n; k++) {
    const t = k / n;
    // Parallel to BC: across the triangle at height t.
    segments.push([mixPt(A, B, t), mixPt(A, C, t)]);
    // Parallel to AC: from t down AB to (1−t) along BC.
    segments.push([mixPt(A, B, t), mixPt(B, C, 1 - t)]);
    // Parallel to AB: from t down AC to t along BC.
    segments.push([mixPt(A, C, t), mixPt(B, C, t)]);
  }

  const lattice: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= n - i; j++) {
      // A + i/n·(B−A) + j/n·(C−A)
      lattice.push([
        A[0] + ((B[0] - A[0]) * i + (C[0] - A[0]) * j) / n,
        A[1] + ((B[1] - A[1]) * i + (C[1] - A[1]) * j) / n,
      ]);
    }
  }
  return { segments, lattice, height: Math.round(h) + 52 };
}

function trianglesFigure(n: number): { svg: string; aspect: number } {
  const { segments, height } = triangleGridGeometry(n);
  const body = segments
    .map(
      ([p, q]) =>
        `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    )
    .join('');
  return svgDoc(height, body);
}

// ---------------------------------------------------------------------------
// rotate — which frame comes next?
// ---------------------------------------------------------------------------

/**
 * Asymmetric marks — every rotation/mirror state must be visually
 * distinct. CRITICAL: none of these may have a mirror symmetry axis,
 * or "spot the mirrored one" stops having a unique answer (a mirrored
 * symmetric shape is identical to one of its rotations). The unit tests
 * rasterize every tile pair to enforce this.
 */
const MARK_PATHS: Record<string, string> = {
  // A flag: vertical pole with a triangular banner to the right at the top.
  flag: 'M -6 -60 L 6 -60 L 6 60 L -6 60 Z M 6 -60 L 58 -38 L 6 -16 Z',
  // A true L: long thin vertical arm, shorter foot — no mirror axis
  // (equal arms would put a symmetry axis on the diagonal).
  ell: 'M -50 -60 L -10 -60 L -10 20 L 46 20 L 46 60 L -50 60 Z',
  // An arrow whose tail hooks right at the bottom — the hook breaks the
  // left/right symmetry a straight arrow would have.
  arrow: 'M 0 -62 L 44 -6 L 16 -6 L 16 30 L 46 30 L 46 62 L -16 62 L -16 -6 L -44 -6 Z',
};

/** One tile as a standalone SVG — exported so tests can rasterize it. */
export function markTileSvg(
  mark: keyof typeof MARK_PATHS,
  rotation: number,
  mirror?: boolean,
): string {
  const body = markTile(MARK_PATHS[mark], 0, 0, 170, rotation, { mirror });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170">${body}</svg>`;
}

/**
 * A–D drawn as stroke paths, centered on origin in a ±20 box. The card
 * pipeline rasterizes figure SVGs with resvg WITHOUT fonts, so <text>
 * silently renders nothing — every glyph must be geometry.
 */
const LETTER_PATHS: Record<string, string> = {
  A: 'M -13 18 L 0 -18 L 13 18 M -7 6 L 7 6',
  B: 'M -10 -18 L -10 18 M -10 -18 L 2 -18 C 16 -18 16 0 2 0 L -10 0 M 2 0 C 17 0 17 18 2 18 L -10 18',
  C: 'M 13 -12 C 4 -22 -13 -18 -13 0 C -13 18 4 22 13 12',
  D: 'M -10 -18 L -10 18 M -10 -18 L 0 -18 C 15 -14 15 14 0 18 L -10 18',
};

/** A question mark as strokes, same reason. */
const QUESTION_PATH =
  'M -14 -18 C -14 -34 16 -34 16 -16 C 16 -4 2 -4 2 8 M 2 22 L 2 26';

function letterBadge(letter: string, cx: number, cy: number): string {
  const path = LETTER_PATHS[letter];
  if (!path) return '';
  return `<g transform="translate(${cx} ${cy})"><circle r="26" fill="rgba(255,255,255,0.14)"/><path d="${path}" transform="scale(0.85)" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function markTile(
  path: string,
  x: number,
  y: number,
  size: number,
  rotation: number,
  opts: { mirror?: boolean; label?: string; unknown?: boolean; id?: string } = {},
): string {
  const half = size / 2;
  const box = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="18" fill="rgba(255,255,255,0.08)" stroke="${
    opts.unknown ? GOLD : INK_SOFT
  }" stroke-width="4"${opts.unknown ? ' stroke-dasharray="14 12"' : ''}/>`;
  const label = opts.label ? letterBadge(opts.label, x + half, y + size + 40) : '';
  if (opts.unknown) {
    return `${box}<g transform="translate(${x + half} ${y + half}) scale(${(size / 170).toFixed(3)})"><path d="${QUESTION_PATH}" fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round"/></g>${label}`;
  }
  const scale = (size / 170).toFixed(3);
  const transform = `translate(${x + half} ${y + half}) scale(${scale})${
    opts.mirror ? ' scale(-1 1)' : ''
  } rotate(${rotation})`;
  const idAttr = opts.id ? ` id="${opts.id}"` : '';
  return `${box}<g${idAttr} transform="${transform}"><path d="${path}" fill="${INK}"/></g>${label}`;
}

export interface RotationSpec {
  id: string;
  mark: keyof typeof MARK_PATHS;
  /** Clockwise step per frame, degrees. */
  step: number;
  /** Option rotations in A,B,C,D order; `mirror` marks the trap option. */
  optionSpecs: Array<{ rotation: number; mirror?: boolean }>;
  answer: string;
}

/** Exported for tests: the correct option must be rotation 3·step, unmirrored. */
export const ROTATION_SPECS: RotationSpec[] = [
  {
    id: 'rotate-flag-90',
    mark: 'flag',
    step: 90,
    optionSpecs: [
      { rotation: 180 },
      { rotation: 270 },
      { rotation: 270, mirror: true },
      { rotation: 0 },
    ],
    answer: 'B',
  },
  {
    id: 'rotate-arrow-45',
    mark: 'arrow',
    step: 45,
    optionSpecs: [
      { rotation: 135 },
      { rotation: 90 },
      { rotation: 180 },
      { rotation: 135, mirror: true },
    ],
    answer: 'A',
  },
  {
    id: 'rotate-ell-90',
    mark: 'ell',
    step: 90,
    optionSpecs: [
      { rotation: 90 },
      { rotation: 180 },
      { rotation: 270, mirror: true },
      { rotation: 270 },
    ],
    answer: 'D',
  },
  {
    id: 'rotate-flag-45',
    mark: 'flag',
    step: 45,
    optionSpecs: [
      { rotation: 90 },
      { rotation: 135, mirror: true },
      { rotation: 135 },
      { rotation: 180 },
    ],
    answer: 'C',
  },
  {
    id: 'rotate-arrow-90',
    mark: 'arrow',
    step: 90,
    optionSpecs: [
      { rotation: 270, mirror: true },
      { rotation: 270 },
      { rotation: 0 },
      { rotation: 180 },
    ],
    answer: 'B',
  },
  {
    id: 'rotate-ell-45',
    mark: 'ell',
    step: 45,
    optionSpecs: [
      { rotation: 180 },
      { rotation: 90 },
      { rotation: 135, mirror: true },
      { rotation: 135 },
    ],
    answer: 'D',
  },
];

function rotationFigure(spec: RotationSpec): { svg: string; aspect: number } {
  const tile = 180;
  const gap = (W - tile * 4) / 5;
  const rowY = 10;
  const optY = rowY + tile + 76;
  const parts: string[] = [];

  for (let i = 0; i < 3; i++) {
    parts.push(
      markTile(MARK_PATHS[spec.mark], gap + i * (tile + gap), rowY, tile, spec.step * i),
    );
  }
  parts.push(
    markTile('', gap + 3 * (tile + gap), rowY, tile, 0, { unknown: true }),
  );

  const letters = ['A', 'B', 'C', 'D'];
  spec.optionSpecs.forEach((opt, i) => {
    parts.push(
      markTile(MARK_PATHS[spec.mark], gap + i * (tile + gap), optY, tile, opt.rotation, {
        mirror: opt.mirror,
        label: letters[i],
        id: `opt-${letters[i]}`,
      }),
    );
  });

  return svgDoc(optY + tile + 78, parts.join(''));
}

// ---------------------------------------------------------------------------
// mirror — odd one out (three rotations, one mirror image)
// ---------------------------------------------------------------------------

export interface MirrorSpec {
  id: string;
  mark: keyof typeof MARK_PATHS;
  /** Rotations for tiles A..D; exactly one carries mirror:true. */
  tiles: Array<{ rotation: number; mirror?: boolean }>;
  answer: string;
}

export const MIRROR_SPECS: MirrorSpec[] = [
  {
    id: 'mirror-flag-1',
    mark: 'flag',
    tiles: [
      { rotation: 0 },
      { rotation: 90 },
      { rotation: 45, mirror: true },
      { rotation: 180 },
    ],
    answer: 'C',
  },
  {
    id: 'mirror-arrow-1',
    mark: 'arrow',
    tiles: [
      { rotation: 30 },
      { rotation: 120 },
      { rotation: 240 },
      { rotation: 300, mirror: true },
    ],
    answer: 'D',
  },
  {
    id: 'mirror-ell-1',
    mark: 'ell',
    tiles: [
      { rotation: 45, mirror: true },
      { rotation: 0 },
      { rotation: 90 },
      { rotation: 225 },
    ],
    answer: 'A',
  },
  {
    id: 'mirror-flag-2',
    mark: 'flag',
    tiles: [
      { rotation: 315 },
      { rotation: 135, mirror: true },
      { rotation: 225 },
      { rotation: 45 },
    ],
    answer: 'B',
  },
  {
    id: 'mirror-arrow-2',
    mark: 'arrow',
    tiles: [
      { rotation: 60, mirror: true },
      { rotation: 150 },
      { rotation: 210 },
      { rotation: 330 },
    ],
    answer: 'A',
  },
  {
    id: 'mirror-ell-2',
    mark: 'ell',
    tiles: [
      { rotation: 180 },
      { rotation: 270 },
      { rotation: 315, mirror: true },
      { rotation: 90 },
    ],
    answer: 'C',
  },
];

function mirrorFigure(spec: MirrorSpec): { svg: string; aspect: number } {
  const tile = 250;
  const gapX = (W - tile * 2) / 3;
  const rows: string[] = [];
  const letters = ['A', 'B', 'C', 'D'];
  spec.tiles.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    rows.push(
      markTile(
        MARK_PATHS[spec.mark],
        gapX + col * (tile + gapX),
        14 + row * (tile + 82),
        tile,
        t.rotation,
        { mirror: t.mirror, label: letters[i], id: `opt-${letters[i]}` },
      ),
    );
  });
  return svgDoc(14 + 2 * (tile + 82), rows.join(''));
}

// ---------------------------------------------------------------------------
// lines — how many intersection points?
// ---------------------------------------------------------------------------

export interface LineSpec {
  id: string;
  /** Lines as [x1,y1,x2,y2] inside the logical box. */
  lines: Array<[number, number, number, number]>;
}

/**
 * Intersections of the segments, exported so the test can PROVE the
 * answer instead of trusting a hand count.
 */
export function segmentIntersections(
  lines: LineSpec['lines'],
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const [x1, y1, x2, y2] = lines[i];
      const [x3, y3, x4, y4] = lines[j];
      const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (Math.abs(d) < 1e-9) continue;
      const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
      const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
      if (t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98) {
        pts.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
      }
    }
  }
  return pts;
}

export const LINE_SPECS: LineSpec[] = [
  {
    // 4 segments in general position → C(4,2) = 6 crossings.
    id: 'lines-4',
    lines: [
      [70, 60, 780, 430],
      [60, 380, 790, 100],
      [250, 30, 520, 480],
      [40, 150, 800, 200],
    ],
  },
  {
    // 5 segments in general position → C(5,2) = 10 crossings.
    id: 'lines-5',
    lines: [
      [60, 100, 790, 360],
      [70, 430, 780, 70],
      [200, 30, 560, 480],
      [40, 240, 800, 205],
      [680, 30, 330, 480],
    ],
  },
];

function linesFigure(spec: LineSpec): { svg: string; aspect: number } {
  const H = 510;
  const body = spec.lines
    .map(
      ([x1, y1, x2, y2]) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`,
    )
    .join('');
  return svgDoc(H, body);
}

// ---------------------------------------------------------------------------
// cubes — solid isometric stacks
// ---------------------------------------------------------------------------

export interface CubeSpec {
  id: string;
  /** heights[y][x] — a solid stack of that many cubes per column. */
  heights: number[][];
}

export function totalCubes(heights: number[][]): number {
  return heights.flat().reduce((a, b) => a + b, 0);
}

export const CUBE_SPECS: CubeSpec[] = [
  { id: 'cubes-8', heights: [[3, 2], [2, 1]] },
  { id: 'cubes-9', heights: [[2, 2, 1], [2, 1, 1]] },
  { id: 'cubes-10', heights: [[3, 2, 1], [2, 1, 1]] },
  { id: 'cubes-11', heights: [[3, 3], [2, 2], [1, 0]] },
];

function cubesFigure(spec: CubeSpec): { svg: string; aspect: number } {
  const AX: [number, number] = [92, 46];
  const AY: [number, number] = [-92, 46];
  const AZ: [number, number] = [0, -104];

  interface Cube { x: number; y: number; z: number }
  const cubes: Cube[] = [];
  spec.heights.forEach((row, y) =>
    row.forEach((h, x) => {
      for (let z = 0; z < h; z++) cubes.push({ x, y, z });
    }),
  );
  // Painter's algorithm: back rows first, low cubes first.
  cubes.sort((a, b) => a.x + a.y - (b.x + b.y) || a.z - b.z);

  const pt = (x: number, y: number, z: number): [number, number] => [
    x * AX[0] + y * AY[0] + z * AZ[0],
    x * AX[1] + y * AY[1] + z * AZ[1],
  ];
  const poly = (pts: Array<[number, number]>, fill: string) =>
    `<polygon points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="${fill}" stroke="#0B0E14" stroke-width="3"/>`;

  const faces: string[] = [];
  const all: Array<[number, number]> = [];
  for (const c of cubes) {
    const { x, y, z } = c;
    const top = [pt(x, y, z + 1), pt(x + 1, y, z + 1), pt(x + 1, y + 1, z + 1), pt(x, y + 1, z + 1)];
    const right = [pt(x + 1, y, z), pt(x + 1, y + 1, z), pt(x + 1, y + 1, z + 1), pt(x + 1, y, z + 1)];
    const left = [pt(x, y + 1, z), pt(x + 1, y + 1, z), pt(x + 1, y + 1, z + 1), pt(x, y + 1, z + 1)];
    faces.push(poly(top, 'rgba(255,255,255,0.92)'));
    faces.push(poly(left, 'rgba(255,255,255,0.55)'));
    faces.push(poly(right, 'rgba(255,255,255,0.28)'));
    all.push(...top, ...right, ...left);
  }

  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const minX = Math.min(...xs) - 28;
  const maxX = Math.max(...xs) + 28;
  const minY = Math.min(...ys) - 28;
  const maxY = Math.max(...ys) + 28;
  // Bound BOTH axes: the card has limited vertical room under the prompt.
  const scale = Math.min(W / (maxX - minX), 600 / (maxY - minY), 1.6);
  const drawW = (maxX - minX) * scale;
  const height = Math.round((maxY - minY) * scale);
  const tx = (W - drawW) / 2 - minX * scale;
  const ty = -minY * scale;
  return svgDoc(height, `<g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(3)})">${faces.join('')}</g>`);
}

// ---------------------------------------------------------------------------
// Pool assembly
// ---------------------------------------------------------------------------

function numberOptions(values: number[], answer: number): {
  options: IgCardOption[];
  answerId: string;
} {
  const letters = ['A', 'B', 'C', 'D'];
  const options = values.map((v, i) => ({ id: letters[i], text: String(v) }));
  const idx = values.indexOf(answer);
  if (idx === -1 || new Set(values).size !== values.length) {
    throw new Error(`bad option set: ${values.join(',')} answer=${answer}`);
  }
  return { options, answerId: letters[idx] };
}

function shapeOptions(): IgCardOption[] {
  return ['A', 'B', 'C', 'D'].map((l) => ({ id: l, text: `Shape ${l}` }));
}

function buildPool(): ShapePost[] {
  const posts: ShapePost[] = [];

  const squareCfg: Array<{ n: number; distractors: number[] }> = [
    { n: 3, distractors: [9, 13, 15] },
    { n: 4, distractors: [16, 24, 28] },
    { n: 5, distractors: [40, 50, 62] },
  ];
  for (const { n, distractors } of squareCfg) {
    const answer = squaresInGrid(n);
    const values = [...distractors, answer].sort((a, b) => a - b);
    const { options, answerId } = numberOptions(values, answer);
    const fig = squaresFigure(n);
    posts.push({
      id: `squares-${n}`,
      hook: 'Almost everyone forgets the big ones 👀',
      badge: 'COUNT CAREFULLY',
      prompt: 'How many squares do you see?',
      options,
      ...fig,
      answer: answerId,
      explain: `Count every size, not just the small cells: 1×1 through ${n}×${n} give ${Array.from(
        { length: n },
        (_, i) => (n - i) ** 2,
      ).join(' + ')} = ${answer}.`,
    });
  }

  const triCfg: Array<{ n: number; distractors: number[] }> = [
    { n: 3, distractors: [9, 11, 15] },
    { n: 4, distractors: [16, 24, 31] },
    { n: 5, distractors: [35, 44, 52] },
  ];
  for (const { n, distractors } of triCfg) {
    const answer = trianglesInTriangle(n);
    const values = [...distractors, answer].sort((a, b) => a - b);
    const { options, answerId } = numberOptions(values, answer);
    const fig = trianglesFigure(n);
    posts.push({
      id: `triangles-${n}`,
      hook: 'This one breaks brains 🧠',
      badge: '99% COUNT WRONG',
      prompt: 'How many triangles are hiding in this figure?',
      options,
      ...fig,
      answer: answerId,
      explain: `Count upward AND downward triangles of every size — the total is ${answer}.`,
    });
  }

  for (const spec of ROTATION_SPECS) {
    const fig = rotationFigure(spec);
    posts.push({
      id: spec.id,
      hook: 'Only fast rotators get this in 20s 🔄',
      badge: 'PATTERN TEST',
      prompt: 'The shape turns the same way each step. Which one comes next?',
      options: shapeOptions(),
      ...fig,
      answer: spec.answer,
      explain: `It rotates ${spec.step}° clockwise every step, so the next frame is ${spec.step * 3}° — option ${spec.answer}. One option is a mirror image: close, but wrong.`,
    });
  }

  for (const spec of MIRROR_SPECS) {
    const fig = mirrorFigure(spec);
    posts.push({
      id: spec.id,
      hook: 'One of these is not like the others 🔍',
      badge: 'SPOT THE FAKE',
      prompt: 'Three are the same shape rotated. One is MIRRORED. Which one?',
      options: shapeOptions(),
      ...fig,
      answer: spec.answer,
      explain: `Rotate the tiles in your head: three line up, but ${spec.answer} is flipped left-to-right — a mirror image can never be rotated back onto the original.`,
    });
  }

  const lineCfg: Record<string, number[]> = {
    'lines-4': [4, 5, 7],
    'lines-5': [8, 9, 11],
  };
  for (const spec of LINE_SPECS) {
    const answer = segmentIntersections(spec.lines).length;
    const values = [...lineCfg[spec.id], answer].sort((a, b) => a - b);
    const { options, answerId } = numberOptions(values, answer);
    const fig = linesFigure(spec);
    posts.push({
      id: spec.id,
      hook: 'Your eyes will skip one, guaranteed 👁️',
      badge: 'COUNT THE CROSSINGS',
      prompt: 'How many intersection points do these lines make?',
      options,
      ...fig,
      answer: answerId,
      explain: `Every pair of lines crosses exactly once here — ${spec.lines.length} lines make ${answer} crossings.`,
    });
  }

  const cubeDistractors: Record<string, number[]> = {
    'cubes-8': [6, 7, 10],
    'cubes-9': [7, 8, 11],
    'cubes-10': [8, 9, 12],
    'cubes-11': [9, 10, 13],
  };
  for (const spec of CUBE_SPECS) {
    const answer = totalCubes(spec.heights);
    const values = [...cubeDistractors[spec.id], answer].sort((a, b) => a - b);
    const { options, answerId } = numberOptions(values, answer);
    const fig = cubesFigure(spec);
    posts.push({
      id: spec.id,
      hook: 'Don’t forget the cubes you can’t see 🧊',
      badge: 'HIDDEN CUBES INSIDE',
      prompt: 'The stack is solid — how many cubes in total, hidden ones included?',
      options,
      ...fig,
      answer: answerId,
      explain: `Add the columns: every stack needs cubes underneath, so the total is ${answer}.`,
    });
  }

  return posts;
}

export const SHAPE_POSTS: ShapePost[] = buildPool();

// ---------------------------------------------------------------------------
// Recolouring for the mural renderer
// ---------------------------------------------------------------------------

/**
 * Figures are authored white-on-transparent for the dark card panel. The
 * mural renderer paints them onto a photographed wall instead, where the
 * ink has to be the wall's paint colour (dark charcoal on cream plaster,
 * whitewash on brick, chalk on a blackboard).
 *
 * Every colour in a figure comes from one of four places — the two INK
 * constants, inline `rgba(255,255,255,α)` washes, GOLD (the "?" marker)
 * and the cube outline — so a token substitution over the finished SVG
 * string is exact, not a guess. Alpha is preserved: it carries the
 * figure's depth cues.
 */
export function recolorFigureSvg(
  svg: string,
  opts: { ink: string; accent: string; outline: string },
): string {
  const rgb = parseRgb(opts.ink);
  return svg
    // INK, INK_SOFT and every inline white wash share this one form.
    .replace(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/g, (_m, a: string) => `rgba(${rgb}, ${a})`)
    .replace(new RegExp(GOLD, 'gi'), opts.accent)
    .replace(/#0B0E14/gi, opts.outline);
}

/** "#RRGGBB" → "r, g, b". Falls back to white so a bad value can't blank a figure. */
function parseRgb(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '255, 255, 255';
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
