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

describe('pickTrackId (soundtrack rotation)', () => {
  it('is deterministic and rotates across slots', async () => {
    const { pickTrackId } = await import('../../lib/social/audio');
    const ids = ['suno-b', 'suno-a', 'suno-c'];
    assert.equal(pickTrackId(100, 0, ids), pickTrackId(100, 0, ids));
    // three slots on one day use three different tracks when 3 are loaded
    const day = new Set([
      pickTrackId(100, 0, ids),
      pickTrackId(100, 1, ids),
      pickTrackId(100, 2, ids),
    ]);
    assert.equal(day.size, 3);
    // order of the input list must not matter
    assert.equal(pickTrackId(7, 1, ids), pickTrackId(7, 1, [...ids].reverse()));
    assert.equal(pickTrackId(5, 0, []), null);
  });
});

describe('Suno share-link resolution', () => {
  it('recognizes share and song URLs, rejects others', async () => {
    const { isSunoShareUrl } = await import('../../lib/social/suno');
    assert.ok(isSunoShareUrl('https://suno.com/s/sHfm9WzQdTiHVpqk'));
    assert.ok(isSunoShareUrl('https://www.suno.com/song/12345678-1234-1234-1234-123456789abc'));
    assert.ok(!isSunoShareUrl('https://cdn1.suno.ai/abc.mp3'));
    assert.ok(!isSunoShareUrl('https://evil.com/suno.com/s/x'));
  });

  it('accepts only UUID track files: og:audio, redirected /song URL, embedded', async () => {
    const { extractSunoMp3 } = await import('../../lib/social/suno');
    const UUID_MP3 = 'https://cdn1.suno.ai/12345678-1234-1234-1234-123456789abc.mp3';
    const og = `<meta property="og:audio" content="${UUID_MP3}"/>`;
    assert.equal(extractSunoMp3(og, 'https://suno.com/s/x'), UUID_MP3);
    const embedded = `<script>{"audio_url":"${UUID_MP3}"}</script>`;
    assert.equal(extractSunoMp3(embedded, 'https://suno.com/s/x'), UUID_MP3);
    assert.equal(
      extractSunoMp3(
        '<html></html>',
        'https://suno.com/song/12345678-1234-1234-1234-123456789abc',
      ),
      UUID_MP3,
    );
    assert.equal(extractSunoMp3('<html></html>', 'https://suno.com/s/x'), null);
  });

  it('never mistakes the silence placeholder for a track (3-day silent-reel bug)', async () => {
    const { extractSunoMp3, isRealSunoTrackUrl } = await import('../../lib/social/suno');
    // The share page's JS shell embeds sil-100.mp3 — must NOT match.
    const shell = '<script>preload("https://cdn1.suno.ai/sil-100.mp3")</script>';
    assert.equal(extractSunoMp3(shell, 'https://suno.com/s/x'), null);
    // …but a redirect to the canonical song URL still resolves.
    assert.equal(
      extractSunoMp3(shell, 'https://suno.com/song/12345678-1234-1234-1234-123456789abc'),
      'https://cdn1.suno.ai/12345678-1234-1234-1234-123456789abc.mp3',
    );
    assert.equal(isRealSunoTrackUrl('https://cdn1.suno.ai/sil-100.mp3'), false);
    assert.equal(
      isRealSunoTrackUrl('https://cdn1.suno.ai/12345678-1234-1234-1234-123456789abc.mp3'),
      true,
    );
    // Non-Suno hosts are the operator's own assertion — left alone.
    assert.equal(isRealSunoTrackUrl('https://example.com/mytrack.mp3'), true);
  });
});

describe('audio seed list', () => {
  it('has unique ids and recognizable Suno URLs', async () => {
    const { AUDIO_SEED } = await import('../../lib/social/audio-seed');
    const { isSunoShareUrl } = await import('../../lib/social/suno');
    const ids = AUDIO_SEED.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate seed ids');
    assert.ok(AUDIO_SEED.length >= 8);
    for (const seed of AUDIO_SEED) {
      assert.match(seed.id, /^[a-z0-9-]{1,40}$/, `${seed.id} bad id`);
      assert.ok(isSunoShareUrl(seed.url), `${seed.id} url not a Suno link: ${seed.url}`);
    }
  });
});
