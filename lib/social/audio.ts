/**
 * Soundtrack library for reels.
 *
 * The account's reels were silent, and silent + API-published means no
 * audio track at all — Instagram's research and our own audit both point
 * at that as the biggest structural reach penalty. The API cannot attach
 * Instagram's licensed/trending music, and audio cannot be added after
 * publishing, so the ONLY automated path is audio embedded in the MP4.
 *
 * The library is operator-curated: generate tracks on Suno (a paid plan
 * grants commercial rights to your generations), copy each track's MP3
 * URL, and POST it to /api/admin/audio. Tracks live in our own bucket so
 * publishing never depends on a third-party CDN staying up.
 *
 * ⚠ Never load commercial/famous songs here. API-published video cannot
 * use Instagram's music licenses, so a famous song in the file is a
 * Rights Manager match → mute/removal/strikes. Trending audio is only
 * safe on posts made manually in the app.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { AUDIO_SEED } from './audio-seed';
import { isSunoShareUrl, resolveSunoShareUrl } from './suno';

const BUCKET = 'ig-media';
const DIR = 'audio';
const MANIFEST_PATH = `${DIR}/manifest.json`;

export interface AudioTrack {
  id: string;
  title?: string;
  credit?: string;
  sourceUrl?: string;
  storedAt: string;
}

export interface AudioManifest {
  tracks: AudioTrack[];
}

function pathFor(id: string): string {
  return `${DIR}/${id}.mp3`;
}

export async function readAudioManifest(): Promise<AudioManifest> {
  if (!isSupabaseConfigured()) return { tracks: [] };
  try {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin.storage.from(BUCKET).download(MANIFEST_PATH);
    if (error || !data) return { tracks: [] };
    const parsed = JSON.parse(await data.text()) as AudioManifest;
    return { tracks: parsed.tracks ?? [] };
  } catch {
    return { tracks: [] };
  }
}

export async function storeAudioTrack(
  id: string,
  mp3: Buffer,
  meta: Omit<AudioTrack, 'id' | 'storedAt'>,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  const admin = createSupabaseAdmin();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(pathFor(id), mp3, { contentType: 'audio/mpeg', upsert: true });
  if (error) return { ok: false, reason: error.message };

  const manifest = await readAudioManifest();
  const next = manifest.tracks.filter((t) => t.id !== id);
  next.push({ id, ...meta, storedAt: new Date().toISOString() });
  next.sort((a, b) => a.id.localeCompare(b.id));
  await admin.storage
    .from(BUCKET)
    .upload(MANIFEST_PATH, Buffer.from(JSON.stringify({ tracks: next }, null, 2)), {
      contentType: 'application/json',
      upsert: true,
    });
  return { ok: true };
}

/** Download a stored track, or null when missing. */
export async function loadAudioTrack(id: string): Promise<Buffer | null> {
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
 * Deterministic track rotation: the same (day, slot) always gets the
 * same track, so a retried build muxes the identical file, and
 * consecutive posts don't repeat a track back-to-back when several are
 * loaded.
 */
export function pickTrackId(
  dayIndex: number,
  slot: number,
  trackIds: readonly string[],
): string | null {
  if (trackIds.length === 0) return null;
  const sorted = [...trackIds].sort();
  return sorted[(dayIndex * 3 + slot) % sorted.length];
}

const SEED_MAX_BYTES = 20 * 1024 * 1024;

/**
 * Import operator-seeded tracks that are not in the library yet.
 *
 * Called by the cron before publishing: pulls at most `maxImports`
 * missing seeds per run (resolve share link → download → store), bounded
 * by `deadlineAt` so a slow CDN can never eat the posting budget. A seed
 * that fails is simply retried on a later run.
 */
export async function importSeedTracks(
  maxImports: number,
  deadlineAt: number,
): Promise<{ imported: string[]; pending: number; notes: string[] }> {
  const imported: string[] = [];
  const notes: string[] = [];
  if (!isSupabaseConfigured()) {
    return { imported, pending: 0, notes: ['supabase_not_configured'] };
  }

  const manifest = await readAudioManifest();
  const have = new Set(manifest.tracks.map((t) => t.id));
  const missing = AUDIO_SEED.filter((seed) => !have.has(seed.id));

  for (const seed of missing) {
    if (imported.length >= maxImports || Date.now() > deadlineAt) break;
    try {
      const audioUrl = isSunoShareUrl(seed.url)
        ? await resolveSunoShareUrl(seed.url)
        : seed.url;
      if (!audioUrl) {
        notes.push(`${seed.id}: resolve_failed`);
        continue;
      }

      const res = await fetch(audioUrl, {
        cache: 'no-store',
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        notes.push(`${seed.id}: http_${res.status}`);
        continue;
      }
      const type = res.headers.get('content-type') ?? '';
      if (!/audio\/|octet-stream/.test(type)) {
        notes.push(`${seed.id}: not_audio_${type.split(';')[0] || 'unknown'}`);
        continue;
      }

      const mp3 = Buffer.from(await res.arrayBuffer());
      if (mp3.length === 0 || mp3.length > SEED_MAX_BYTES) {
        notes.push(`${seed.id}: bad_size_${mp3.length}`);
        continue;
      }

      const stored = await storeAudioTrack(seed.id, mp3, {
        title: seed.title,
        credit: 'Suno',
        sourceUrl: audioUrl,
      });
      if (stored.ok) imported.push(seed.id);
      else notes.push(`${seed.id}: store_${stored.reason}`);
    } catch (err) {
      // Retried on the next run — but leave the reason in the snapshot.
      notes.push(
        `${seed.id}: error_${err instanceof Error ? err.name : 'unknown'}`,
      );
    }
  }

  return {
    imported,
    pending: missing.length - imported.length,
    notes,
  };
}
