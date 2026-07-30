import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

/**
 * Attach a music bed to the wasm-encoded (video-only) reel.
 *
 * The wasm encoder cannot write audio, so this is a post-step: copy the
 * H.264 stream untouched (fast, no quality loss) and encode the track to
 * AAC, trimmed to the video's length with a tail fade so the cut is not
 * abrupt. `-movflags +faststart` fronts the moov atom, which Instagram's
 * ingestion prefers.
 *
 * Returns null on ANY failure — the caller publishes the silent video
 * instead. A missing ffmpeg binary or a corrupt MP3 must never take the
 * daily post down.
 */
export async function muxAudioIntoVideo(
  video: Buffer,
  audio: Buffer,
  durationSeconds: number,
): Promise<Buffer | null> {
  if (!ffmpegPath) return null;

  let dir: string | null = null;
  try {
    dir = await mkdtemp(join(tmpdir(), 'reel-mux-'));
    const vPath = join(dir, 'v.mp4');
    const aPath = join(dir, 'a.mp3');
    const outPath = join(dir, 'out.mp4');
    await Promise.all([writeFile(vPath, video), writeFile(aPath, audio)]);

    const fadeStart = Math.max(0, durationSeconds - 1.5);
    await execFileAsync(
      ffmpegPath,
      [
        '-y',
        '-i', vPath,
        '-i', aPath,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        '-af', `volume=0.9,afade=t=out:st=${fadeStart}:d=1.5`,
        '-t', String(durationSeconds),
        '-movflags', '+faststart',
        outPath,
      ],
      { timeout: 60_000, maxBuffer: 16 * 1024 * 1024 },
    );

    return await readFile(outPath);
  } catch {
    return null;
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
