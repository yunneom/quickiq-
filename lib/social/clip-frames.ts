/**
 * ffmpeg frame extraction for clip backgrounds.
 *
 * The wasm H.264 encoder consumes raw RGBA frames, so a video background
 * has to become stills first. ffmpeg loops the clip to cover the full
 * reel, samples it at the builder's background FPS and center-crops to
 * the output frame — one fast native pass instead of piping the decode
 * through JS.
 *
 * Everything returns null on failure: a corrupt clip or missing binary
 * must degrade to the photo/SVG background, never break the daily post.
 */

import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

/**
 * Sample `fps` frames per second over `durationSeconds`, looping the
 * clip when it is shorter. Returns JPEG buffers in playback order, or
 * null when extraction fails or produces too few frames to cover the
 * reel (the tail is padded by repeating the last frame for small
 * rounding gaps only).
 */
export async function extractClipFrames(args: {
  clip: Buffer;
  fps: number;
  durationSeconds: number;
  width: number;
  height: number;
  timeoutMs?: number;
}): Promise<Buffer[] | null> {
  if (!ffmpegPath) return null;
  const expected = args.fps * args.durationSeconds;

  let dir: string | null = null;
  try {
    dir = await mkdtemp(join(tmpdir(), 'reel-clip-'));
    const inPath = join(dir, 'clip.bin');
    await writeFile(inPath, args.clip);

    await execFileAsync(
      ffmpegPath,
      [
        '-y',
        // Loop indefinitely; -t bounds the output, so a 9s clip covers a
        // 30s reel and a 3min clip is cut at 30s.
        '-stream_loop', '-1',
        '-i', inPath,
        '-t', String(args.durationSeconds),
        '-vf',
        `fps=${args.fps},scale=${args.width}:${args.height}:force_original_aspect_ratio=increase,crop=${args.width}:${args.height}`,
        '-q:v', '3',
        join(dir, 'f_%04d.jpg'),
      ],
      { timeout: args.timeoutMs ?? 90_000, maxBuffer: 16 * 1024 * 1024 },
    );

    const names = (await readdir(dir))
      .filter((n) => n.startsWith('f_') && n.endsWith('.jpg'))
      .sort();
    // fps rounding can drop a frame or two at the tail; anything worse
    // means the decode broke partway.
    if (names.length < expected - 2) return null;

    const frames = await Promise.all(names.map((n) => readFile(join(dir!, n))));
    while (frames.length < expected) frames.push(frames[frames.length - 1]);
    return frames.slice(0, expected);
  } catch {
    return null;
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Cheap sanity pass used before storing a downloaded clip: can ffmpeg
 * decode it, and is it big enough to survive a 1080×1920 crop without
 * turning to mush? Returns the probed frame size, or null.
 */
export async function probeClip(
  clip: Buffer,
): Promise<{ width: number; height: number } | null> {
  if (!ffmpegPath) return null;
  let dir: string | null = null;
  try {
    dir = await mkdtemp(join(tmpdir(), 'clip-probe-'));
    const inPath = join(dir, 'clip.bin');
    const outPath = join(dir, 'probe.jpg');
    await writeFile(inPath, clip);
    await execFileAsync(
      ffmpegPath,
      ['-y', '-i', inPath, '-frames:v', '1', outPath],
      { timeout: 30_000, maxBuffer: 16 * 1024 * 1024 },
    );
    const sharp = (await import('sharp')).default;
    const meta = await sharp(await readFile(outPath)).metadata();
    if (!meta.width || !meta.height) return null;
    return { width: meta.width, height: meta.height };
  } catch {
    return null;
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Minimum source size we accept — below this the crop upscales visibly. */
export function clipResolutionOk(size: { width: number; height: number }): boolean {
  // 720p-class is ideal; 540p-class is the floor. The heavy scrim over
  // the footage hides most upscale softness, and real motion at 540p
  // still stops a thumb better than a drawn background. Below that the
  // background reads as a compression artifact.
  return Math.min(size.width, size.height) >= 540;
}
