import sharp from 'sharp';
import { createH264MP4Encoder } from 'h264-mp4-encoder';
import {
  REEL,
  REEL_FRAME_COUNT,
  REEL_DURATION_SECONDS,
  reelFrameSchedule,
} from './reel-spec';
import { bgFrameSvg } from './reel-bg';
import { planForSlot } from './ig-content';

/**
 * Builds the daily reel as an in-memory MP4 — now with a MOVING scene.
 *
 * Node-only (sharp + wasm encoder) — must never be imported from edge
 * routes. Pipeline per video:
 *   1. fetch the 3 transparent overlay PNGs (question / nudge / outro)
 *      from our own public /api/ig/reel-frame
 *   2. for every background frame: generate the scene SVG for that
 *      moment (approaching train, night road, chalk dust — all code,
 *      zero stock-footage licensing), rasterize with sharp, composite
 *      the active overlay on top
 *   3. feed RGBA frames to the wasm H.264 encoder
 *
 * Backgrounds animate at BG_FPS and each frame is emitted twice, so the
 * output is a spec-clean 30fps while halving rasterization work.
 *
 * Output: H.264 baseline / yuv420p / 30fps MP4 — accepted by Instagram's
 * REELS ingestion (no audio track; IG treats it as original silent audio).
 */

const BG_FPS = 15;

export type ReelResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; reason: string };

/** Which overlay is on screen during a given second of the reel. */
function overlayIndexAt(second: number): number {
  let acc = 0;
  const schedule = reelFrameSchedule();
  for (const { frame, seconds } of schedule) {
    acc += seconds;
    if (second < acc) return frame;
  }
  return schedule[schedule.length - 1].frame;
}

export async function buildReelVideo(args: {
  dayIndex: number;
  slot?: number;
  baseUrl: string;
  /** Abort between frames once this epoch-ms deadline passes. */
  deadlineAt?: number;
}): Promise<ReelResult> {
  try {
    const slot = args.slot ?? 0;
    const plan = planForSlot(args.dayIndex, slot);
    if (!plan) return { ok: false, reason: 'no_plan' };
    const scene = plan.card.bg;

    const overlays = await Promise.all(
      Array.from({ length: REEL_FRAME_COUNT }, async (_, f) => {
        const res = await fetch(
          `${args.baseUrl}/api/ig/reel-frame?d=${args.dayIndex}&s=${slot}&f=${f}`,
          // Bounded: a hung self-fetch must not eat the cron's time budget.
          { cache: 'no-store', signal: AbortSignal.timeout(20_000) },
        );
        if (!res.ok) throw new Error(`frame_${f}_http_${res.status}`);
        return Buffer.from(await res.arrayBuffer());
      }),
    );

    const encoder = await createH264MP4Encoder();
    encoder.width = REEL.width;
    encoder.height = REEL.height;
    encoder.frameRate = REEL.fps;
    encoder.kbps = 6500;
    // Closed 1s GOPs — dense seek points, within Instagram's tolerance.
    encoder.groupOfPictures = REEL.fps;
    encoder.speed = 7;
    encoder.initialize();

    try {
      const uniqueFrames = REEL_DURATION_SECONDS * BG_FPS;
      const dupe = Math.round(REEL.fps / BG_FPS);

      const renderFrame = (u: number) => {
        const t = u / (uniqueFrames - 1);
        const second = Math.floor(u / BG_FPS);
        const overlay = overlays[overlayIndexAt(second)];
        return sharp(Buffer.from(bgFrameSvg(scene, t)))
          .composite([{ input: overlay }])
          .ensureAlpha()
          .raw()
          .toBuffer();
      };

      // Pipeline: libvips rasterizes the NEXT frame off-thread while the
      // wasm encoder (main thread) chews on the current one — overlapping
      // the two roughly matches whichever side is slower instead of
      // paying for both in sequence.
      let pending = renderFrame(0);
      for (let u = 0; u < uniqueFrames; u++) {
        // A throttled vCPU can stretch the build well past the local
        // 30-40s measurement — bail between frames so the image fallback
        // always starts with its reserve intact.
        if (args.deadlineAt && u % 15 === 0 && Date.now() > args.deadlineAt) {
          return { ok: false, reason: 'build_deadline_exceeded' };
        }
        const raw = await pending;
        if (u + 1 < uniqueFrames) pending = renderFrame(u + 1);
        const rgba = new Uint8Array(raw);
        for (let k = 0; k < dupe; k++) encoder.addFrameRgba(rgba);
      }

      encoder.finalize();
      const out = encoder.FS.readFile(encoder.outputFilename);
      return { ok: true, buffer: Buffer.from(out) };
    } finally {
      encoder.delete();
    }
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'reel_build_failed',
    };
  }
}
