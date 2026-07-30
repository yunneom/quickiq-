import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { kenBurnsCrop, FOOTAGE_W, FOOTAGE_H } from '../../lib/social/footage';
import type { BgScene } from '../../lib/social/reel-bg';

const SRC = { width: FOOTAGE_W, height: FOOTAGE_H };
const OUT = { width: 1080, height: 1920 };
const SCENES: BgScene[] = ['rails', 'road', 'chalk', 'slate'];

describe('kenBurnsCrop', () => {
  it('always stays inside the source image', () => {
    for (const scene of SCENES) {
      for (let i = 0; i <= 20; i++) {
        const c = kenBurnsCrop(scene, i / 20, SRC, OUT);
        assert.ok(c.left >= 0, `${scene} left ${c.left}`);
        assert.ok(c.top >= 0, `${scene} top ${c.top}`);
        assert.ok(
          c.left + c.width <= SRC.width,
          `${scene} overflows right at t=${i / 20}`,
        );
        assert.ok(
          c.top + c.height <= SRC.height,
          `${scene} overflows bottom at t=${i / 20}`,
        );
      }
    }
  });

  it('keeps the output aspect ratio so nothing is squashed', () => {
    const target = OUT.width / OUT.height;
    for (const scene of SCENES) {
      for (const t of [0, 0.5, 1]) {
        const c = kenBurnsCrop(scene, t, SRC, OUT);
        const aspect = c.width / c.height;
        assert.ok(
          Math.abs(aspect - target) < 0.01,
          `${scene} t=${t} aspect ${aspect.toFixed(3)} != ${target.toFixed(3)}`,
        );
      }
    }
  });

  it('pushes in — the crop only ever gets tighter', () => {
    for (const scene of SCENES) {
      let prev = Infinity;
      for (let i = 0; i <= 10; i++) {
        const c = kenBurnsCrop(scene, i / 10, SRC, OUT);
        assert.ok(c.width <= prev, `${scene} zoomed back out at t=${i / 10}`);
        prev = c.width;
      }
    }
  });

  it('never upscales past the source resolution', () => {
    for (const scene of SCENES) {
      const c = kenBurnsCrop(scene, 1, SRC, OUT);
      assert.ok(
        c.width >= OUT.width,
        `${scene} final crop ${c.width}px is narrower than the 1080px output`,
      );
    }
  });

  it('clamps out-of-range t instead of escaping the frame', () => {
    for (const scene of SCENES) {
      const before = kenBurnsCrop(scene, -3, SRC, OUT);
      const after = kenBurnsCrop(scene, 9, SRC, OUT);
      assert.deepEqual(before, kenBurnsCrop(scene, 0, SRC, OUT));
      assert.deepEqual(after, kenBurnsCrop(scene, 1, SRC, OUT));
    }
  });

  it('handles a landscape source by cropping width, not stretching', () => {
    const wide = { width: 3840, height: 2160 };
    const c = kenBurnsCrop('rails', 0, wide, OUT);
    assert.equal(c.height, wide.height);
    assert.ok(c.width < wide.width);
    assert.ok(Math.abs(c.width / c.height - OUT.width / OUT.height) < 0.01);
  });
});
