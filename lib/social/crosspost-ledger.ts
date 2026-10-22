import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * "Already sent here" markers for cross-posts.
 *
 * The ig_posts ledger is keyed on the INSTAGRAM outcome: a slot whose
 * Instagram publish failed is retried by the next cron run. Cross-posts
 * no longer wait for Instagram to succeed (an expired Instagram token
 * must not take Threads down with it), so without their own record every
 * retry of a failed Instagram slot would put the same reel on Threads
 * again. One tiny JSON object per (platform, key) in the public media
 * bucket is that record — post ids only, nothing secret, and no
 * migration for a best-effort side channel.
 */

const BUCKET = 'ig-media';

function markerPath(platform: string, key: string): string {
  return `crosspost/${platform}/${key.replace(/[^a-zA-Z0-9-]/g, '_')}.json`;
}

/** True only when a marker demonstrably exists; any read error → false. */
export async function alreadyCrossPosted(platform: string, key: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data, error } = await createSupabaseAdmin()
      .storage.from(BUCKET)
      .download(markerPath(platform, key));
    return !error && Boolean(data);
  } catch {
    return false;
  }
}

export async function markCrossPosted(platform: string, key: string, postId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await createSupabaseAdmin()
      .storage.from(BUCKET)
      .upload(
        markerPath(platform, key),
        Buffer.from(JSON.stringify({ postId, at: new Date().toISOString() })),
        { contentType: 'application/json', upsert: true },
      );
  } catch {
    // Best effort — worst case a retry re-posts once.
  }
}
