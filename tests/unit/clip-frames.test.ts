import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import {
  clipResolutionOk,
  extractClipFrames,
  probeClip,
} from '../../lib/social/clip-frames';

const execFileAsync = promisify(execFile);

/**
 * Real end-to-end pass through the same ffmpeg binary production uses:
 * synthesize a tiny test clip, then loop-extract frames from it exactly
 * the way the reel builder does. Catches binary/flag regressions that
 * pure-function tests cannot.
 */

let clip: Buffer;

before(async () => {
  assert.ok(ffmpegPath, 'ffmpeg-static binary missing');
  const dir = await mkdtemp(join(tmpdir(), 'clip-fixture-'));
  try {
    const out = join(dir, 'fixture.mp4');
    // 2s of moving test pattern at 1280x720 — small enough to be fast,
    // big enough to pass the resolution gate.
    await execFileAsync(
      ffmpegPath!,
      [
        '-y',
        '-f', 'lavfi',
        '-i', 'testsrc=size=1280x720:rate=30:duration=2',
        '-pix_fmt', 'yuv420p',
        out,
      ],
      { timeout: 60_000 },
    );
    clip = await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

describe('extractClipFrames', () => {
  it('loops a short clip to cover the full duration and crops to size', async () => {
    // 6s at 2fps from a 2s source → the loop must engage.
    const frames = await extractClipFrames({
      clip,
      fps: 2,
      durationSeconds: 6,
      width: 270,
      height: 480,
    });
    assert.ok(frames, 'extraction returned null');
    assert.equal(frames!.length, 12);

    const sharp = (await import('sharp')).default;
    const meta = await sharp(frames![0]).metadata();
    assert.equal(meta.width, 270);
    assert.equal(meta.height, 480);
  });

  it('returns null on garbage input instead of throwing', async () => {
    const frames = await extractClipFrames({
      clip: Buffer.from('this is not a video'),
      fps: 2,
      durationSeconds: 4,
      width: 270,
      height: 480,
    });
    assert.equal(frames, null);
  });
});

describe('probeClip / clipResolutionOk', () => {
  it('probes the real dimensions of a valid clip', async () => {
    const size = await probeClip(clip);
    assert.ok(size);
    assert.equal(size!.width, 1280);
    assert.equal(size!.height, 720);
    assert.equal(clipResolutionOk(size!), true);
  });

  it('rejects garbage and low-res sources', async () => {
    assert.equal(await probeClip(Buffer.from('nope')), null);
    assert.equal(clipResolutionOk({ width: 640, height: 360 }), false);
    assert.equal(clipResolutionOk({ width: 720, height: 1280 }), true);
  });
});
