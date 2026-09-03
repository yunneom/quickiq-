/**
 * The generated-wall pool.
 *
 * Same shape as the clip library: entries live in our own public bucket
 * with a JSON manifest beside them, and the reel picks one
 * deterministically per (day, slot) so a retried build renders the
 * identical post. Generation is operator-triggered from /admin/media,
 * never automatic — each wall costs a Gemini call, and the operator
 * should eyeball the pool before it goes out.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { MURAL_STYLES, type MuralStyleId } from './mural';

const BUCKET = 'ig-media';
const DIR = 'footage/murals';
const MANIFEST_PATH = `${DIR}/manifest.json`;

export interface MuralEntry {
  id: string;
  style: MuralStyleId;
  /** Which image model actually produced it — useful when quality drifts. */
  model?: string;
  bytes?: number;
  storedAt: string;
}

export interface MuralManifest {
  murals: MuralEntry[];
}

export function muralPath(id: string): string {
  return `${DIR}/${id}.jpg`;
}

export async function readMuralManifest(): Promise<MuralManifest> {
  if (!isSupabaseConfigured()) return { murals: [] };
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(MANIFEST_PATH);
    if (error || !data) return { murals: [] };
    const parsed = JSON.parse(await data.text()) as MuralManifest;
    return { murals: parsed.murals ?? [] };
  } catch {
    return { murals: [] };
  }
}

/** Public URL of a stored wall (the bucket is public by design). */
export function muralPublicUrl(id: string): string | null {
  if (!isSupabaseConfigured()) return null;
  const admin = createSupabaseAdmin();
  return admin.storage.from(BUCKET).getPublicUrl(muralPath(id)).data.publicUrl;
}

export async function storeMural(
  entry: Omit<MuralEntry, 'storedAt' | 'bytes'>,
  image: Buffer,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'supabase_not_configured' };
  const admin = createSupabaseAdmin();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(muralPath(entry.id), image, { contentType: 'image/jpeg', upsert: true });
  if (error) return { ok: false, reason: error.message };

  // Read-modify-write on one shared JSON with no transaction: two
  // generate clicks overlapping would otherwise silently drop one
  // entry. Same verify-then-retry as the clip manifest.
  const record: MuralEntry = {
    ...entry,
    bytes: image.length,
    storedAt: new Date().toISOString(),
  };
  for (let attempt = 0; attempt < 5; attempt++) {
    const manifest = await readMuralManifest();
    const next = manifest.murals.filter((m) => m.id !== entry.id);
    next.push(record);
    next.sort((a, b) => a.id.localeCompare(b.id));
    await admin.storage
      .from(BUCKET)
      .upload(MANIFEST_PATH, Buffer.from(JSON.stringify({ murals: next }, null, 2)), {
        contentType: 'application/json',
        upsert: true,
      });
    const verify = await readMuralManifest();
    if (verify.murals.some((m) => m.id === entry.id)) return { ok: true };
    await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random() * 300)));
  }
  return { ok: false, reason: 'manifest_write_conflict' };
}

export async function deleteMural(id: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'supabase_not_configured' };
  const admin = createSupabaseAdmin();
  await admin.storage.from(BUCKET).remove([muralPath(id)]).catch(() => {});
  for (let attempt = 0; attempt < 5; attempt++) {
    const manifest = await readMuralManifest();
    const next = manifest.murals.filter((m) => m.id !== id);
    await admin.storage
      .from(BUCKET)
      .upload(MANIFEST_PATH, Buffer.from(JSON.stringify({ murals: next }, null, 2)), {
        contentType: 'application/json',
        upsert: true,
      });
    const verify = await readMuralManifest();
    if (!verify.murals.some((m) => m.id === id)) return { ok: true };
    await new Promise((r) => setTimeout(r, 200 + Math.floor(Math.random() * 300)));
  }
  return { ok: false, reason: 'manifest_write_conflict' };
}

export async function loadMural(id: string): Promise<Buffer | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(muralPath(id));
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Deterministic rotation over the whole pool: same (day, slot) → same
 * wall, consecutive posts walk the pool. Styles are interleaved by the
 * id sort, so a feed does not show the same wall twice in a row while
 * more than one is loaded.
 */
export function pickMuralForSlot(
  dayIndex: number,
  slot: number,
  murals: readonly MuralEntry[],
): MuralEntry | null {
  const pool = [...murals].sort((a, b) => a.id.localeCompare(b.id));
  if (pool.length === 0) return null;
  return pool[(dayIndex * 3 + slot) % pool.length];
}

/** How many walls each style currently holds — drives the admin summary. */
export function countByStyle(murals: readonly MuralEntry[]): Record<MuralStyleId, number> {
  const out = {} as Record<MuralStyleId, number>;
  for (const id of Object.keys(MURAL_STYLES) as MuralStyleId[]) out[id] = 0;
  for (const m of murals) if (m.style in out) out[m.style] += 1;
  return out;
}
