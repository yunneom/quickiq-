import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * Public media storage for Instagram publishing.
 *
 * Instagram's ingestion fetcher downloads media from a URL we hand it, so
 * generated videos need a public, stable home. Supabase Storage free tier
 * (1GB) is plenty: a daily ~1–2MB reel is years of headroom.
 *
 * The bucket is created lazily with `public: true` so there is no manual
 * setup step — first cron run provisions it.
 */

const BUCKET = 'ig-media';

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

export async function uploadPublicVideo(
  path: string,
  buffer: Buffer,
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'supabase_not_configured' };
  }
  try {
    const admin = createSupabaseAdmin();

    // Idempotent provisioning: "already exists" is success, anything else
    // surfaces on upload below anyway.
    await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: 'video/mp4', upsert: true });
    if (error) return { ok: false, reason: error.message };

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : 'upload_failed',
    };
  }
}
