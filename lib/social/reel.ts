import sharp from 'sharp';
import { createH264MP4Encoder } from 'h264-mp4-encoder';
import { REEL, REEL_FRAME_COUNT, reelFrameSchedule } from './reel-spec';

/**
 * Builds the daily countdown reel as an in-memory MP4.
 *
 * Node-only (sharp + wasm encoder) — must never be imported from edge
 * routes. The pipeline is deliberately boring:
 *   1. fetch the still frames from our own public /api/ig/reel-frame
 *   2. decode PNG → raw RGBA (sharp)
 *   3. feed each frame to the wasm H.264 encoder, held for its schedule
 *      slot (duplicate frames compress to almost nothing, so a 8s video
 *      encodes in well under a minute)
 *
 * Output: H.264 baseline / yuv420p / 30fps MP4 — accepted by Instagram's
 * REELS ingestion (no audio track; IG treats it as original silent audio).
 */

export type ReelResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; reason: string };

export async function buildReelVideo(args: {
  dayIndex: number;
  baseUrl: string;
}): Promise<ReelResult> {
  try {
    const pngs = await Promise.all(
      Array.from({ length: REEL_FRAME_COUNT }, async (_, f) => {
        const res = await fetch(
          `${args.baseUrl}/api/ig/reel-frame?d=${args.dayIndex}&f=${f}`,
          // Bounded: a hung self-fetch must not eat the cron's time budget.
          { cache: 'no-store', signal: AbortSignal.timeout(20_000) },
        );
        if (!res.ok) throw new Error(`frame_${f}_http_${res.status}`);
        return Buffer.from(await res.arrayBuffer());
      }),
    );

    const rgbas = await Promise.all(
      pngs.map((png) =>
        sharp(png)
          .resize(REEL.width, REEL.height, { fit: 'cover' })
          .ensureAlpha()
          .raw()
          .toBuffer(),
      ),
    );

    const encoder = await createH264MP4Encoder();
    encoder.width = REEL.width;
    encoder.height = REEL.height;
    encoder.frameRate = REEL.fps;
    encoder.kbps = 6000;
    // Closed 1s GOPs — Instagram's spec asks for closed GOPs of 2–5s;
    // 1s keeps seek points dense and stays within tolerance.
    encoder.groupOfPictures = REEL.fps;
    encoder.speed = 5;
    encoder.initialize();

    try {
      for (const { frame, seconds } of reelFrameSchedule()) {
        const rgba = new Uint8Array(rgbas[frame]);
        for (let i = 0; i < seconds * REEL.fps; i++) {
          encoder.addFrameRgba(rgba);
        }
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
