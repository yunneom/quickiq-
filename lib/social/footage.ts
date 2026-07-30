/**
 * Real photographic backgrounds for reels.
 *
 * The code-drawn scenes in `reel-bg.ts` are safe but flat, and flat
 * backgrounds do not stop a thumb. When a photo is available for a scene
 * we use it instead and animate it with a slow Ken Burns push-in, which
 * reads as real footage: an actual train front growing over 20 seconds,
 * an actual night highway, an actual classroom.
 *
 * Where the photos come from: an operator POSTs a license-cleared image
 * URL to /api/admin/footage. That route runs on Vercel (open internet),
 * normalizes the image and parks it in Supabase Storage. The reel builder
 * only ever reads from our own bucket, so publishing never depends on a
 * third-party host being up — and if a scene has no photo, the drawn SVG
 * scene is used instead. Nothing breaks, it just looks flatter.
 *
 * Licensing is the operator's call at upload time; the manifest records
 * what they declared so credits can be reproduced.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { BgScene } from './reel-bg';

const BUCKET = 'ig-media';
const DIR = 'footage';

/**
 * Stored larger than the 1080×1920 output so the Ken Burns crop has room
 * to push in without upscaling past native resolution.
 */
export const FOOTAGE_W = 1512;
export const FOOTAGE_H = 2688;

export interface FootageEntry {
  scene: BgScene;
  credit?: string;
  license?: string;
  sourceUrl?: string;
  storedAt: string;
}

export type FootageManifest = Partial<Record<BgScene, FootageEntry>>;

function pathFor(scene: BgScene): string {
  return `${DIR}/${scene}.jpg`;
}

const MANIFEST_PATH = `${DIR}/manifest.json`;

/** Download the stored photo for a scene, or null when none is loaded. */
export async function loadFootage(scene: BgScene): Promise<Buffer | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(pathFor(scene));
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

export async function readManifest(): Promise<FootageManifest> {
  if (!isSupabaseConfigured()) return {};
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(MANIFEST_PATH);
    if (error || !data) return {};
    return JSON.parse(await data.text()) as FootageManifest;
  } catch {
    return {};
  }
}

export async function writeManifest(next: FootageManifest): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const admin = createSupabaseAdmin();
  await admin.storage
    .from(BUCKET)
    .upload(MANIFEST_PATH, Buffer.from(JSON.stringify(next, null, 2)), {
      contentType: 'application/json',
      upsert: true,
    });
}

export async function storeFootage(
  scene: BgScene,
  jpeg: Buffer,
  meta: Omit<FootageEntry, 'scene' | 'storedAt'>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  const admin = createSupabaseAdmin();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(pathFor(scene), jpeg, { contentType: 'image/jpeg', upsert: true });
  if (error) return { ok: false, reason: error.message };

  const manifest = await readManifest();
  manifest[scene] = { scene, ...meta, storedAt: new Date().toISOString() };
  await writeManifest(manifest);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Ken Burns — pure geometry so it can be unit tested without sharp.
// ---------------------------------------------------------------------------

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** How each scene's camera moves. Push-in sells "it's coming at you". */
const MOVE: Record<BgScene, { zoom: number; panX: number; panY: number }> = {
  // The train grows: strongest push, dead centre.
  rails: { zoom: 0.16, panX: 0, panY: 0.02 },
  road: { zoom: 0.13, panX: 0.015, panY: 0.01 },
  // Boards get a lateral drift instead — nothing is approaching.
  chalk: { zoom: 0.06, panX: 0.05, panY: 0 },
  slate: { zoom: 0.06, panX: -0.05, panY: 0 },
};

/**
 * Crop rectangle for moment `t` (0..1) of the reel.
 *
 * Starts wide and ends tight (`zoom` = total fraction of the frame given
 * up by the end), drifting by `pan` fractions of the source. Always
 * returns a rect inside the source with the output's aspect ratio.
 */
export function kenBurnsCrop(
  scene: BgScene,
  t: number,
  src: { width: number; height: number },
  out: { width: number; height: number },
): CropRect {
  const clamped = Math.min(1, Math.max(0, t));
  const move = MOVE[scene] ?? MOVE.chalk;

  // Widest rect with the output aspect that fits inside the source.
  const outAspect = out.width / out.height;
  const srcAspect = src.width / src.height;
  const baseW = srcAspect > outAspect ? src.height * outAspect : src.width;
  const baseH = srcAspect > outAspect ? src.height : src.width / outAspect;

  const scale = 1 - move.zoom * clamped;
  const w = Math.max(2, Math.round(baseW * scale));
  const h = Math.max(2, Math.round(baseH * scale));

  // Pan is centred on the midpoint so the move reads as a drift, not a jump.
  const cx = src.width / 2 + src.width * move.panX * (clamped - 0.5);
  const cy = src.height / 2 + src.height * move.panY * (clamped - 0.5);

  const left = Math.min(Math.max(Math.round(cx - w / 2), 0), src.width - w);
  const top = Math.min(Math.max(Math.round(cy - h / 2), 0), src.height - h);

  return { left, top, width: w, height: h };
}

/**
 * Scrim drawn over the photo so the quiz panel stays readable no matter
 * what the photograph looks like. Darkens overall, heavier top and
 * bottom where our chrome sits.
 */
export function footageScrimSvg(width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#04060A" stop-opacity="0.86"/>
      <stop offset="0.22" stop-color="#04060A" stop-opacity="0.52"/>
      <stop offset="0.58" stop-color="#04060A" stop-opacity="0.50"/>
      <stop offset="1" stop-color="#04060A" stop-opacity="0.88"/>
    </linearGradient>
    <radialGradient id="v" cx="0.5" cy="0.45" r="0.78">
      <stop offset="0.5" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.5"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#s)"/>
  <rect width="${width}" height="${height}" fill="url(#v)"/>
</svg>`;
}
