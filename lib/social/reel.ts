import sharp, { type OverlayOptions } from 'sharp';
import { createH264MP4Encoder } from 'h264-mp4-encoder';
import {
  REEL,
  REEL_FRAME_COUNT,
  REEL_DURATION_SECONDS,
  TIMER_SECONDS,
  reelFrameSchedule,
} from './reel-spec';
import { bgFrameSvg, BG_ACCENT } from './reel-bg';
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

// 10 unique bg frames/s (each emitted 3x for 30fps output): the scenes are
// slow-moving glow, so 10fps reads smooth while a 22s reel rasterizes only
// ~220 frames — about the same work as the old 13s at 15fps.
const BG_FPS = 10;

export type ReelResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; reason: string };

/**
 * The visible time-limit bar: a slim strip under the top pills that
 * drains over TIMER_SECONDS, then disappears for the outro. Drawn per
 * frame so it moves with the video (the overlay PNGs are stills).
 */
function timerBarSvg(scene: keyof typeof BG_ACCENT, elapsedS: number): string | null {
  const remaining = 1 - elapsedS / TIMER_SECONDS;
  if (remaining <= 0) return null;
  const trackW = REEL.width - 144;
  const w = Math.max(6, Math.round(trackW * remaining));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${REEL.width}" height="44">
  <rect x="72" y="14" width="${trackW}" height="16" rx="8" fill="rgba(255,255,255,0.16)"/>
  <rect x="72" y="14" width="${w}" height="16" rx="8" fill="${BG_ACCENT[scene]}"/>
</svg>`;
}

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
        const bar = timerBarSvg(scene, u / BG_FPS);
        const layers: OverlayOptions[] = [{ input: overlay }];
        if (bar) {
          layers.push({ input: Buffer.from(bar), top: 168, left: 0 });
        }
        return sharp(Buffer.from(bgFrameSvg(scene, t)))
          .composite(layers)
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
