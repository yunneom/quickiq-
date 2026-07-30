import sharp, { type OverlayOptions } from 'sharp';
import { createH264MP4Encoder } from 'h264-mp4-encoder';
import {
  REEL,
  REEL_FRAME_COUNT,
  REEL_DURATION_SECONDS,
  TIMER_SECONDS,
  reelFrameSchedule,
} from './reel-spec';
import { bgFrameSvg, BG_ACCENT, type BgScene } from './reel-bg';
import {
  FOOTAGE_H,
  FOOTAGE_W,
  footageScrimSvg,
  kenBurnsCrop,
  loadFootage,
} from './footage';
import { planForSlot } from './ig-content';
import { loadAudioTrack, pickTrackId, readAudioManifest } from './audio';
import { muxAudioIntoVideo } from './mux';
import { loadClip, pickClipForSlot, readClipManifest } from './clips';
import { extractClipFrames } from './clip-frames';

/**
 * Builds the daily reel as an in-memory MP4 — now with a MOVING scene.
 *
 * Node-only (sharp + wasm encoder) — must never be imported from edge
 * routes. Pipeline per video:
 *   1. fetch the 3 transparent overlay PNGs (question / ad / outro)
 *      from our own public /api/ig/reel-frame
 *   2. for every background frame, build the base layer:
 *        · a real photograph for this scene if one has been loaded
 *          (/api/admin/footage), animated with a slow Ken Burns push-in
 *          so a still reads as footage — a train front really does grow
 *          over the 20s question
 *        · otherwise the code-drawn scene SVG (approaching train, night
 *          road, chalk dust) — always available, never a licensing risk
 *      then composite the active overlay on top
 *   3. feed RGBA frames to the wasm H.264 encoder
 *
 * Backgrounds animate at BG_FPS and each frame is emitted 30/BG_FPS
 * times, so the output is a spec-clean 30fps for a fraction of the
 * rasterization work. The draining timer bar is drawn here too, since
 * the overlay PNGs are stills.
 *
 * Output: H.264 baseline / yuv420p / 30fps MP4. When the operator has
 * loaded soundtracks (/api/admin/audio), the matching track is muxed in
 * as AAC afterwards — silent reels are structurally down-ranked, so the
 * music bed matters. No tracks loaded → publishes silent, never blocks.
 */

/**
 * Unique background frames per second (each emitted 30/BG_FPS times so the
 * output stays a spec-clean 30fps). Must divide 30 exactly.
 *
 * Rasterizing one 1080×1920 scene SVG costs ~150ms, so this number sets
 * the build time: at 6fps a 30s reel rasterizes 180 frames (~32s) and
 * still reads smooth, because the scenes move slowly by design — the
 * train needs the whole reel to arrive, so nothing travels far between
 * frames.
 */
const BG_FPS = 6;

export type ReelResult =
  | {
      ok: true;
      buffer: Buffer;
      /** Set when the background clip's license requires a caption credit. */
      credit?: string;
    }
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

    // Decode each overlay PNG ONCE into raw RGBA: composite() would
    // otherwise re-decode the same PNG on every one of the ~180 frames.
    const overlays = await Promise.all(
      Array.from({ length: REEL_FRAME_COUNT }, async (_, f) => {
        const res = await fetch(
          `${args.baseUrl}/api/ig/reel-frame?d=${args.dayIndex}&s=${slot}&f=${f}`,
          // Bounded: a hung self-fetch must not eat the cron's time budget.
          { cache: 'no-store', signal: AbortSignal.timeout(20_000) },
        );
        if (!res.ok) throw new Error(`frame_${f}_http_${res.status}`);
        const decoded = await sharp(Buffer.from(await res.arrayBuffer()))
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        return {
          input: decoded.data,
          raw: {
            width: decoded.info.width,
            height: decoded.info.height,
            channels: 4 as const,
          },
        } satisfies OverlayOptions;
      }),
    );

    const uniqueFrames = REEL_DURATION_SECONDS * BG_FPS;

    // Background priority: real clip → real photo (Ken Burns) → drawn
    // SVG scene. Each step degrades silently — a bad clip must never
    // take the daily post down.
    const clip = await loadClipLayer(scene, args.dayIndex, slot, args.deadlineAt);
    const photo = clip ? null : await loadPhotoLayer(scene);

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
      const dupe = Math.round(REEL.fps / BG_FPS);

      const renderFrame = (u: number) => {
        const t = u / (uniqueFrames - 1);
        const second = Math.floor(u / BG_FPS);
        const overlay = overlays[overlayIndexAt(second)];
        const bar = timerBarSvg(scene, u / BG_FPS);

        const layers: OverlayOptions[] = [];
        // Scrim first: it sits between the footage and our chrome.
        if (clip) layers.push(clip.scrim);
        else if (photo) layers.push(photo.scrim);
        layers.push(overlay);
        if (bar) {
          layers.push({ input: Buffer.from(bar), top: 168, left: 0 });
        }

        const base = clip
          ? // Already cropped to the output frame by ffmpeg.
            sharp(clip.frames[Math.min(u, clip.frames.length - 1)])
          : photo
            ? sharp(photo.raw, {
                raw: { width: FOOTAGE_W, height: FOOTAGE_H, channels: 4 },
              }).extract(
                kenBurnsCrop(
                  scene,
                  t,
                  { width: FOOTAGE_W, height: FOOTAGE_H },
                  { width: REEL.width, height: REEL.height },
                ),
              )
            : sharp(Buffer.from(bgFrameSvg(scene, t)));

        return base
          .resize(REEL.width, REEL.height)
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
      const silent = Buffer.from(out);
      const credit = clip?.captionCredit;

      // Soundtrack: deterministic rotation over the operator's library.
      // Any failure publishes the silent cut instead of failing the post.
      try {
        const manifest = await readAudioManifest();
        const trackId = pickTrackId(
          args.dayIndex,
          slot,
          manifest.tracks.map((t) => t.id),
        );
        if (trackId) {
          const audio = await loadAudioTrack(trackId);
          if (audio) {
            const withAudio = await muxAudioIntoVideo(
              silent,
              audio,
              REEL_DURATION_SECONDS,
            );
            if (withAudio) return { ok: true, buffer: withAudio, credit };
          }
        }
      } catch {
        // fall through to the silent cut
      }
      return { ok: true, buffer: silent, credit };
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

/**
 * Real footage layer: pick this slot's clip from the pool, download it
 * from our bucket and pre-extract every background frame with ffmpeg
 * (looped and center-cropped to the reel frame). Null when no clip is
 * loaded for the scene, extraction fails, or the deadline is too close
 * to afford the extraction pass — callers then fall back to photo/SVG.
 */
async function loadClipLayer(
  scene: BgScene,
  dayIndex: number,
  slot: number,
  deadlineAt?: number,
): Promise<{
  frames: Buffer[];
  scrim: OverlayOptions;
  captionCredit?: string;
} | null> {
  try {
    const manifest = await readClipManifest();
    const entry = pickClipForSlot(scene, dayIndex, slot, manifest.clips);
    if (!entry) return null;

    // Extraction is a bounded native pass (~5-15s). If less than 45s of
    // budget remains it would eat the encode's time — skip to fallbacks.
    const remaining = deadlineAt ? deadlineAt - Date.now() : Infinity;
    if (remaining < 45_000) return null;

    const clip = await loadClip(entry.id);
    if (!clip) return null;

    const frames = await extractClipFrames({
      clip,
      fps: BG_FPS,
      durationSeconds: REEL_DURATION_SECONDS,
      width: REEL.width,
      height: REEL.height,
      timeoutMs: Math.min(60_000, Math.max(15_000, remaining - 30_000)),
    });
    if (!frames || frames.length === 0) return null;

    const scrim = await sharp(
      Buffer.from(footageScrimSvg(REEL.width, REEL.height)),
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return {
      frames,
      scrim: {
        input: scrim.data,
        raw: {
          width: scrim.info.width,
          height: scrim.info.height,
          channels: 4 as const,
        },
      },
      captionCredit: entry.requiresAttribution && entry.credit
        ? `${entry.credit}${entry.license ? ` (${entry.license})` : ''}`
        : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Decode the scene photo (if any) plus its scrim into raw RGBA once, so
 * the per-frame path never re-decodes a JPEG or rasterizes the gradient.
 */
async function loadPhotoLayer(scene: BgScene): Promise<{
  raw: Buffer;
  scrim: OverlayOptions;
} | null> {
  const jpeg = await loadFootage(scene);
  if (!jpeg) return null;
  try {
    const raw = await sharp(jpeg)
      .resize(FOOTAGE_W, FOOTAGE_H, { fit: 'cover' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const scrim = await sharp(
      Buffer.from(footageScrimSvg(REEL.width, REEL.height)),
    )
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      raw,
      scrim: {
        input: scrim.data,
        raw: {
          width: scrim.info.width,
          height: scrim.info.height,
          channels: 4 as const,
        },
      },
    };
  } catch {
    // A corrupt upload must not take the daily post down.
    return null;
  }
}
