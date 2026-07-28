/**
 * Cinematic animated backgrounds for reels — generated as SVG per frame,
 * rasterized by sharp in the video builder. No stock footage: everything
 * is authored here (zero licensing risk) and parameterized, so every
 * question gets a matching scene and the motion is deterministic.
 *
 * Scenes (mapped from the post's concept):
 *   rails — night POV standing between tracks, a locomotive (3-lamp
 *           cluster + dark body) closing in over the reel — the urgency
 *           device that replaced the countdown timer
 *   road  — night highway POV, lane dashes rushing past, a car's twin
 *           headlights approaching
 *   chalk — classroom chalkboard, eraser smudges, drifting chalk dust
 *   slate — spelling-bee variant of chalk (blue-slate board)
 *
 * All motion is a pure function of `t` (0..1 across the reel) plus a
 * seeded PRNG, so the same day+slot always renders the identical video.
 */

export type BgScene = 'rails' | 'road' | 'chalk' | 'slate';

export const BG_ACCENT: Record<BgScene, string> = {
  rails: '#FFB020',
  road: '#FFC53D',
  chalk: '#EFDF8A',
  slate: '#9FC1E8',
};

export interface BgDim {
  W: number;
  H: number;
  /** Horizon line for the perspective scenes. */
  HZ: number;
}

export const REEL_BG_DIM: BgDim = { W: 1080, H: 1920, HZ: 760 };
export const SQUARE_BG_DIM: BgDim = { W: 1080, H: 1080, HZ: 400 };

/** Deterministic PRNG (mulberry32) — motion must be reproducible. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** p=0 at the horizon, p=1 at the bottom edge → screen y + width scale. */
function persp(p: number, d: BgDim): { y: number; s: number } {
  const e = Math.pow(p, 1.75);
  return { y: d.HZ + (d.H - d.HZ) * e, s: 0.04 + 0.96 * e };
}

// ---------------------------------------------------------------------------

function railsSvg(t: number, d: BgDim): string {
  const { W, H, HZ } = d;
  // The locomotive closes in over the whole reel — that's the timer now.
  const close = Math.pow(clamp01(t), 1.55);
  const lampR = 18 + 130 * close;
  const glowA = 0.3 + 0.55 * close;
  const cx = W / 2;
  const cy = HZ - 10 - 40 * close;

  // Loco body: a dark slab that grows behind the lamp cluster.
  const bodyW = 150 + 620 * close;
  const bodyH = 190 + 560 * close;
  const bodyY = cy - bodyH + lampR * 1.4;
  const bodyA = 0.25 + 0.65 * close;

  // 3-lamp cluster (top center + two ditch lights) — unmistakably a train.
  const spread = lampR * 1.55;
  const topLamp = { x: cx, y: cy - spread * 0.95, r: lampR * 0.72 };

  // Sleepers scroll toward the viewer.
  const ties: string[] = [];
  const SPEED = 3.2;
  for (let i = 0; i < 14; i++) {
    const p = (i / 14 + t * SPEED) % 1;
    const { y, s } = persp(p, d);
    const wHalf = 350 * s + 24;
    const th = Math.max(5, 40 * s);
    ties.push(
      `<rect x="${(cx - wHalf).toFixed(1)}" y="${y.toFixed(1)}" width="${(wHalf * 2).toFixed(1)}" height="${th.toFixed(1)}" rx="${(th / 3).toFixed(1)}" fill="#232A33" opacity="${(0.5 + 0.45 * s).toFixed(2)}"/>`,
    );
  }

  // Gravel ballast flecks between ties.
  const grit = rng(7);
  const gravel: string[] = [];
  for (let i = 0; i < 40; i++) {
    const p = (grit() + t * SPEED * 0.9) % 1;
    const { y, s } = persp(p, d);
    const gx = cx + (grit() - 0.5) * 760 * (0.3 + s);
    gravel.push(
      `<circle cx="${gx.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + 3.4 * s).toFixed(1)}" fill="#3A4250" opacity="${(0.25 + 0.35 * s).toFixed(2)}"/>`,
    );
  }

  const railTopHalf = 12;
  const railBotHalf = 270;
  const rail = (dir: -1 | 1, color: string, w1: number, w2: number) =>
    `<path d="M ${cx + dir * railTopHalf} ${HZ} L ${cx + dir * railBotHalf} ${H}
       L ${cx + dir * (railBotHalf + w2)} ${H} L ${cx + dir * (railTopHalf + w1)} ${HZ} Z" fill="${color}"/>`;
  const spec = 0.4 + 0.5 * close;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05070C"/><stop offset="1" stop-color="#0B1019"/>
    </linearGradient>
    <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#141922"/><stop offset="1" stop-color="#07090D"/>
    </linearGradient>
    <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFF7E6" stop-opacity="1"/>
      <stop offset="0.3" stop-color="#FFE9B8" stop-opacity="0.9"/>
      <stop offset="0.65" stop-color="#FFB020" stop-opacity="${(glowA * 0.6).toFixed(2)}"/>
      <stop offset="1" stop-color="#FFB020" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${HZ}" fill="url(#sky)"/>
  <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#gnd)"/>
  ${gravel.join('\n  ')}
  ${ties.join('\n  ')}
  ${rail(-1, '#454E5B', 20, 40)}
  ${rail(1, '#454E5B', 20, 40)}
  ${rail(-1, `rgba(255,214,140,${spec.toFixed(2)})`, 6, 11)}
  ${rail(1, `rgba(255,214,140,${spec.toFixed(2)})`, 6, 11)}
  <rect x="${(cx - bodyW / 2).toFixed(1)}" y="${bodyY.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${bodyH.toFixed(1)}" rx="${(bodyW * 0.12).toFixed(1)}" fill="#0A0C10" opacity="${bodyA.toFixed(2)}"/>
  <circle cx="${cx}" cy="${cy.toFixed(1)}" r="${(lampR * 6.2).toFixed(1)}" fill="url(#lamp)"/>
  <circle cx="${topLamp.x}" cy="${topLamp.y.toFixed(1)}" r="${(topLamp.r * 3.4).toFixed(1)}" fill="url(#lamp)"/>
  <circle cx="${(cx - spread).toFixed(1)}" cy="${cy.toFixed(1)}" r="${lampR.toFixed(1)}" fill="#FFF9EC"/>
  <circle cx="${(cx + spread).toFixed(1)}" cy="${cy.toFixed(1)}" r="${lampR.toFixed(1)}" fill="#FFF9EC"/>
  <circle cx="${topLamp.x}" cy="${topLamp.y.toFixed(1)}" r="${topLamp.r.toFixed(1)}" fill="#FFF9EC"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

function roadSvg(t: number, d: BgDim): string {
  const { W, H, HZ } = d;
  const close = Math.pow(clamp01(t), 1.5);
  const cx = W / 2;
  const sway = Math.sin(t * Math.PI * 6) * 14 * (0.3 + close);
  const lampY = HZ - 6 - 26 * close;
  const gap = 55 + 170 * close;
  const lampR = 14 + 105 * close;

  // Car body silhouette between/above the lamps.
  const carW = gap * 2 + lampR * 2.6;
  const carH = carW * 0.62;
  const carA = 0.2 + 0.6 * close;

  const dashes: string[] = [];
  const SPEED = 3.6;
  for (let i = 0; i < 10; i++) {
    const p = (i / 10 + t * SPEED) % 1;
    const { y, s } = persp(p, d);
    const wDash = Math.max(6, 32 * s);
    const hDash = Math.max(14, 135 * s);
    dashes.push(
      `<rect x="${(cx - wDash / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${wDash.toFixed(1)}" height="${hDash.toFixed(1)}" rx="${(wDash / 2).toFixed(1)}" fill="#C9CFD8" opacity="${(0.3 + 0.5 * s).toFixed(2)}"/>`,
    );
  }

  const edge = (dir: -1 | 1) =>
    `<path d="M ${cx + dir * 34} ${HZ} L ${cx + dir * 480} ${H} L ${cx + dir * 512} ${H} L ${cx + dir * 41} ${HZ} Z" fill="#414A56" opacity="0.95"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#070A10"/><stop offset="1" stop-color="#0F151F"/>
    </linearGradient>
    <linearGradient id="tar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#161B23"/><stop offset="1" stop-color="#090B0F"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFF6DE"/>
      <stop offset="0.4" stop-color="#FFD87A" stop-opacity="0.8"/>
      <stop offset="1" stop-color="#FFC53D" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.78">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${HZ}" fill="url(#sky)"/>
  <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#tar)"/>
  ${edge(-1)}
  ${edge(1)}
  ${dashes.join('\n  ')}
  <rect x="${(cx - carW / 2 + sway).toFixed(1)}" y="${(lampY - carH).toFixed(1)}" width="${carW.toFixed(1)}" height="${carH.toFixed(1)}" rx="${(carW * 0.18).toFixed(1)}" fill="#0A0C10" opacity="${carA.toFixed(2)}"/>
  <circle cx="${(cx - gap + sway).toFixed(1)}" cy="${lampY.toFixed(1)}" r="${(lampR * 4.4).toFixed(1)}" fill="url(#hl)"/>
  <circle cx="${(cx + gap + sway).toFixed(1)}" cy="${lampY.toFixed(1)}" r="${(lampR * 4.4).toFixed(1)}" fill="url(#hl)"/>
  <circle cx="${(cx - gap + sway).toFixed(1)}" cy="${lampY.toFixed(1)}" r="${lampR.toFixed(1)}" fill="#FFF9EC"/>
  <circle cx="${(cx + gap + sway).toFixed(1)}" cy="${lampY.toFixed(1)}" r="${lampR.toFixed(1)}" fill="#FFF9EC"/>
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

function boardSvg(t: number, d: BgDim, scene: 'chalk' | 'slate'): string {
  const { W, H } = d;
  const [c1, c2, frame] =
    scene === 'chalk'
      ? ['#1A3423', '#101F16', '#4A3627']
      : ['#1D2C3D', '#131E2B', '#262C36'];

  // Old eraser smudges — the "this board has been used" texture.
  const smudge = rng(scene === 'chalk' ? 11 : 23);
  const smudges: string[] = [];
  for (let i = 0; i < 7; i++) {
    const sx = 90 + smudge() * (W - 180);
    const sy = 120 + smudge() * (H - 240);
    const rx = 90 + smudge() * 190;
    const ry = 26 + smudge() * 60;
    const rot = -25 + smudge() * 50;
    smudges.push(
      `<ellipse cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" transform="rotate(${rot.toFixed(0)} ${sx.toFixed(0)} ${sy.toFixed(0)})" fill="#F5EEDC" opacity="0.045"/>`,
    );
  }

  // Drifting chalk dust — seeded, slow.
  const rand = rng(scene === 'chalk' ? 41 : 97);
  const motes: string[] = [];
  for (let i = 0; i < 26; i++) {
    const bx = rand() * W;
    const by = rand() * H;
    const r = 1.4 + rand() * 2.8;
    const spd = 30 + rand() * 70;
    const y = (by + t * spd) % H;
    const x = bx + Math.sin((t * 2 + i) * Math.PI) * 12;
    motes.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#F5EEDC" opacity="${(0.07 + rand() * 0.13).toFixed(2)}"/>`,
    );
  }
  const swayX = 0.5 + Math.sin(t * Math.PI * 2) * 0.04;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bd" cx="${swayX.toFixed(3)}" cy="0.3" r="1.1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.85">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.4"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bd)"/>
  ${smudges.join('\n  ')}
  <rect x="0" y="0" width="${W}" height="20" fill="${frame}"/>
  <rect x="0" y="${H - 20}" width="${W}" height="20" fill="${frame}"/>
  <rect x="0" y="0" width="20" height="${H}" fill="${frame}"/>
  <rect x="${W - 20}" y="0" width="20" height="${H}" fill="${frame}"/>
  ${motes.join('\n  ')}
  <rect width="${W}" height="${H}" fill="url(#vig)"/>
</svg>`;
}

/** SVG for one background frame. `t` runs 0..1 across the whole reel. */
export function bgFrameSvg(scene: BgScene, t: number, dim: BgDim = REEL_BG_DIM): string {
  switch (scene) {
    case 'rails':
      return railsSvg(t, dim);
    case 'road':
      return roadSvg(t, dim);
    case 'chalk':
      return boardSvg(t, dim, 'chalk');
    case 'slate':
      return boardSvg(t, dim, 'slate');
  }
}
