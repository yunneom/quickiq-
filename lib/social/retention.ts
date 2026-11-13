import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * Storage retention for published media.
 *
 * Instagram and Threads copy a reel when they ingest it — after publish
 * our copy is never read again (the answer reveal comments on the media
 * id, the status snapshot only reads the URL string). Keeping every reel
 * forever is what filled the Supabase free tier (1 GB) and got the whole
 * project restricted with HTTP 402, taking the test funnel down with it.
 *
 * Each cron run deletes reels/cards older than RETENTION_DAYS, oldest
 * first, a bounded batch at a time. A failed IG slot is retried within
 * the same day, so a few days of slack never deletes media still needed.
 */

const BUCKET = 'ig-media';
export const RETENTION_DAYS = 3;
const PREFIXES = ['reels', 'cards'] as const;
/** Objects removed per run — the backlog drains over a few days. */
const MAX_DELETES_PER_RUN = 300;

export interface RetentionSummary {
  deleted: number;
  notes: string[];
}

interface StoredObject {
  name: string;
  created_at?: string | null;
}

/** Pure: which objects are past retention, oldest first. */
export function expiredObjects(
  objects: ReadonlyArray<StoredObject>,
  now: Date,
  days = RETENTION_DAYS,
): string[] {
  const cutoff = now.getTime() - days * 86_400_000;
  return objects
    .filter((o) => o.name && !o.name.startsWith('.'))
    .filter((o) => {
      const t = o.created_at ? Date.parse(o.created_at) : NaN;
      return Number.isFinite(t) && t < cutoff;
    })
    .sort((a, b) => Date.parse(a.created_at ?? '') - Date.parse(b.created_at ?? ''))
    .map((o) => o.name);
}

export async function pruneOldMedia(deadlineAt: number): Promise<RetentionSummary> {
  const notes: string[] = [];
  let deleted = 0;
  if (!isSupabaseConfigured()) return { deleted, notes: ['supabase_not_configured'] };
  const storage = createSupabaseAdmin().storage.from(BUCKET);

  for (const prefix of PREFIXES) {
    if (deleted >= MAX_DELETES_PER_RUN || Date.now() > deadlineAt) break;
    const { data, error } = await storage.list(prefix, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'asc' },
    });
    if (error) {
      notes.push(`${prefix}: list: ${error.message}`);
      continue;
    }
    const names = expiredObjects(data ?? [], new Date()).slice(0, MAX_DELETES_PER_RUN - deleted);
    for (let i = 0; i < names.length && Date.now() < deadlineAt; i += 100) {
      const batch = names.slice(i, i + 100).map((n) => `${prefix}/${n}`);
      const { error: rmError } = await storage.remove(batch);
      if (rmError) {
        notes.push(`${prefix}: remove: ${rmError.message}`);
        break;
      }
      deleted += batch.length;
    }
  }
  return { deleted, notes };
}
