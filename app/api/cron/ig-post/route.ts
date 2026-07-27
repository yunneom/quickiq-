import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  isInstagramConfigured,
  publishImagePost,
  getPublishingQuota,
} from '@/lib/social/instagram';
import { planForDay, utcDayIndex } from '@/lib/social/ig-content';
import { getSiteUrl } from '@/lib/site-url';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
// Staging + polling + publish can exceed the default budget.
export const maxDuration = 120;

/**
 * Scheduled Instagram post (Vercel Cron → see vercel.json).
 *
 * Idempotent by design: the day index picks the post, and `ig_posts` has a
 * unique key on it, so a retried or duplicated cron firing records the
 * conflict and exits instead of double-posting.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without a
 * matching secret we refuse — this endpoint spends a publishing quota and
 * must not be triggerable by anyone who finds the URL.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!isInstagramConfigured()) {
    return NextResponse.json({ skipped: 'instagram_not_configured' });
  }

  const day = utcDayIndex();
  const plan = planForDay(day);
  if (!plan) return NextResponse.json({ skipped: 'no_plan' });

  const postKey = `${day}:${plan.key}`;

  // Claim the slot BEFORE publishing so a concurrent/retried run can't
  // post the same card twice (unique violation → skip).
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from('ig_posts')
      .insert({ post_key: postKey, status: 'publishing' });
    if (error) {
      if (String(error.code) === '23505') {
        return NextResponse.json({ skipped: 'already_posted', postKey });
      }
      Sentry.captureMessage('ig cron ledger insert failed', {
        level: 'warning',
        tags: { area: 'instagram', step: 'ledger' },
        extra: { postKey, message: error.message },
      });
    }
  }

  const quota = await getPublishingQuota();
  if (quota.ok && quota.data.used >= quota.data.limit) {
    return NextResponse.json({ skipped: 'quota_exhausted', ...quota.data });
  }

  const imageUrl = `${getSiteUrl()}/api/ig/card?d=${day}`;
  const published = await publishImagePost({
    imageUrl,
    caption: plan.caption,
  });

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdmin();
    await admin
      .from('ig_posts')
      .update({
        status: published.ok ? 'published' : 'failed',
        media_id: published.ok ? published.data.id : null,
        error: published.ok ? null : published.reason,
        image_url: imageUrl,
      })
      .eq('post_key', postKey);
  }

  if (!published.ok) {
    Sentry.captureMessage('ig cron publish failed', {
      level: 'error',
      tags: { area: 'instagram', step: 'publish' },
      extra: { postKey, reason: published.reason },
    });
    return NextResponse.json(
      { ok: false, reason: published.reason, postKey },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, mediaId: published.data.id, postKey });
}
