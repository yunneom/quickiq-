/**
 * Real VIDEO clips as reel backgrounds.
 *
 * A photograph with a Ken Burns push-in reads as footage; actual footage
 * reads better. Clips live in our own Supabase bucket (multiple per
 * scene, rotated deterministically like the soundtrack library) and the
 * reel builder extracts frames from the chosen clip with ffmpeg, so a
 * published reel never depends on a third-party host.
 *
 * How clips get here:
 *   · the cron's auto-collector (lib/social/clip-sources.ts) searches
 *     license-safe libraries, filters to licenses we may use, validates
 *     the download with ffmpeg and stores it
 *   · or the operator pastes a direct video URL into /admin/media
 *
 * License policy (matches the audio library's caution): only sources
 * whose terms allow commercial reuse without a per-use fee. Attribution
 * -required licenses (CC BY) are allowed — the credit is stored here and
 * the cron appends it to the caption automatically. ShareAlike (-SA),
 * NonCommercial (-NC) and rights-managed news/documentary footage are
 * never accepted.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import type { BgScene } from './reel-bg';

const BUCKET = 'ig-media';
const DIR = 'footage/clips';
const MANIFEST_PATH = `${DIR}/manifest.json`;

/** Hard cap per stored clip — keeps 12+ clips well inside the free tier. */
export const MAX_CLIP_BYTES = 25 * 1024 * 1024;

export interface ClipEntry {
  id: string;
  scene: BgScene;
  /** Shown in the caption when attribution is required. */
  credit?: string;
  license?: string;
  /** True → the caption must carry the credit line. */
  requiresAttribution?: boolean;
  sourceUrl?: string;
  /** Human page (Commons file page, Pexels video page) for audits. */
  sourcePage?: string;
  bytes?: number;
  storedAt: string;
}

export interface ClipManifest {
  clips: ClipEntry[];
}

function pathFor(id: string): string {
  return `${DIR}/${id}.bin`;
}

export async function readClipManifest(): Promise<ClipManifest> {
  if (!isSupabaseConfigured()) return { clips: [] };
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(MANIFEST_PATH);
    if (error || !data) return { clips: [] };
    const parsed = JSON.parse(await data.text()) as ClipManifest;
    return { clips: parsed.clips ?? [] };
  } catch {
    return { clips: [] };
  }
}

export async function storeClip(
  entry: Omit<ClipEntry, 'storedAt' | 'bytes'>,
  video: Buffer,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  const admin = createSupabaseAdmin();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const { error } = await admin.storage
    .from(BUCKET)
    // Container varies (mp4/webm) — stored opaque, ffmpeg sniffs it.
    .upload(pathFor(entry.id), video, {
      contentType: 'application/octet-stream',
      upsert: true,
    });
  if (error) return { ok: false, reason: error.message };

  const manifest = await readClipManifest();
  const next = manifest.clips.filter((c) => c.id !== entry.id);
  next.push({ ...entry, bytes: video.length, storedAt: new Date().toISOString() });
  next.sort((a, b) => a.id.localeCompare(b.id));
  await admin.storage
    .from(BUCKET)
    .upload(MANIFEST_PATH, Buffer.from(JSON.stringify({ clips: next }, null, 2)), {
      contentType: 'application/json',
      upsert: true,
    });
  return { ok: true };
}

/** Download a stored clip, or null when missing. */
export async function loadClip(id: string): Promise<Buffer | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(pathFor(id));
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Deterministic clip rotation per scene: same (day, slot) → same clip,
 * so a retried build renders the identical reel, while consecutive posts
 * on a scene cycle through its pool.
 */
export function pickClipForSlot(
  scene: BgScene,
  dayIndex: number,
  slot: number,
  clips: readonly ClipEntry[],
): ClipEntry | null {
  const pool = clips
    .filter((c) => c.scene === scene)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return null;
  return pool[(dayIndex * 3 + slot) % pool.length];
}
