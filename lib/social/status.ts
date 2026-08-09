/**
 * Cron run snapshot, parked at a PUBLIC storage URL.
 *
 * The pipeline's failure modes are all remote (Instagram, stock hosts,
 * Suno's CDN) and the cron's JSON response evaporates with the request —
 * so when something misbehaves, nobody can see WHERE it stopped without
 * digging through Vercel logs. This file is the flight recorder: every
 * run overwrites `status/last-run.json` with its outcomes, import notes
 * and pool counts, readable by anyone with the URL (it contains nothing
 * secret — post keys, public media URLs and error slugs only).
 *
 *   https://<project>.supabase.co/storage/v1/object/public/ig-media/status/last-run.json
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

const BUCKET = 'ig-media';
const PATH = 'status/last-run.json';
/** Same idea, for on-demand admin actions (e.g. the manual collect button) —
 *  those responses go straight to the operator's browser and vanish, so an
 *  operator-relayed error message is the only way to diagnose one. Parking
 *  it here too means it's inspectable without asking anyone to copy-paste. */
const MANUAL_PATH = 'status/last-manual-clip-import.json';

async function write(path: string, snapshot: object): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createSupabaseAdmin();
    await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});
    await admin.storage
      .from(BUCKET)
      .upload(path, Buffer.from(JSON.stringify(snapshot, null, 2)), {
        contentType: 'application/json',
        upsert: true,
      });
  } catch {
    // The recorder must never break the flight.
  }
}

export async function writeStatusSnapshot(snapshot: object): Promise<void> {
  await write(PATH, snapshot);
}

export async function writeManualClipImportSnapshot(snapshot: object): Promise<void> {
  await write(MANUAL_PATH, snapshot);
}
