import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  isInstagramConfigured,
  publishImagePost,
  publishReelPost,
  getPublishingQuota,
} from '@/lib/social/instagram';
import { planForDay, utcDayIndex } from '@/lib/social/ig-content';
import { buildReelVideo } from '@/lib/social/reel';
import { uploadPublicVideo } from '@/lib/social/storage';
import { getSiteUrl } from '@/lib/site-url';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
// Reel pipeline: render frames + wasm H.264 encode + upload + Instagram
// video ingestion polling. 300s is the Hobby (fluid) ceiling.
export const maxDuration = 300;

// Time budget inside maxDuration: the reel attempt must surrender early
// enough that the image fallback (container + poll + publish ≈ 60s) plus
// ledger writes always fit. Deadlines are absolute epoch-ms.
const TOTAL_BUDGET_MS = 290_000; // 10s under maxDuration for safety
const FALLBACK_RESERVE_MS = 90_000;
// A reel publish attempt needs container create + at least a few polls.
const MIN_REEL_PUBLISH_MS = 45_000;

// A 'publishing' row this old belongs to a run that was killed mid-flight
// (function timeout, crash) — it may be reclaimed.
const STALE_CLAIM_MINUTES = 20;

/**
 * Scheduled Instagram post (Vercel Cron → see vercel.json).
 *
 * Publishes the daily plan as a REEL (countdown video) and falls back to
 * the still-image feed post if the video pipeline fails BEFORE the
 * publish step — a failed `media_publish` is ambiguous (Instagram may
 * have committed it) so falling back there could double-post; we record
 * the failure instead and the ledger stays reclaimable.
 *
 * Idempotent by design: the day index picks the post, and `ig_posts` has
 * a unique key on it. A retried/duplicate firing either takes over a
 * dead claim (failed, or stale 'publishing') or exits.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Without a
 * matching secret we refuse — this endpoint spends a publishing quota and
 * must not be triggerable by anyone who finds the URL.
 *
 * Manual testing (with the same bearer token):
 *   ?d=<dayIndex>   render/publish a specific day's plan. A FUTURE day
 *                   additionally requires ?test= so it can't consume the
 *                   scheduled slot ahead of time.
 *   ?test=<label>   suffix the ledger key so a test post never blocks the
 *                   scheduled one (e.g. ?d=20663&test=1)
 */
export async function GET(req: Request) {
  const startedAt = Date.now();
  const secret = process.env.CRON_SECRET?.trim();

  // Distinguish "server has no secret" from "caller sent the wrong one".
  // Neither response reveals the secret.
  if (!secret) {
    return NextResponse.json(
      {
        error: 'cron_secret_not_configured',
        hint: 'Set CRON_SECRET in Vercel (Production) and redeploy — env vars are injected at build time.',
      },
      { status: 503 },
    );
  }

  // Tolerate the whitespace people accidentally paste around the token.
  const auth = req.headers.get('authorization')?.trim();
  const provided = auth?.replace(/^Bearer\s+/i, '').trim();
  if (provided !== secret) {
    return NextResponse.json(
      { error: 'unauthorized', hint: 'CRON_SECRET mismatch.' },
      { status: 401 },
    );
  }

  if (!isInstagramConfigured()) {
    return NextResponse.json({ skipped: 'instagram_not_configured' });
  }

  const { searchParams } = new URL(req.url);
  // NB: Number(null), Number('') and Number(' ') are ALL 0, so "param
  // absent/blank" must be checked explicitly — otherwise the scheduled
  // run (no ?d=) would pin itself to day 0 forever.
  const dRaw = searchParams.get('d')?.trim() ?? null;

  const testRaw = searchParams.get('test');
  const testLabel = testRaw?.replace(/[^a-zA-Z0-9-]/g, '') ?? null;
  if (testRaw !== null && !testLabel) {
    // A label that sanitizes to nothing would silently claim the REAL
    // scheduled slot — refuse instead.
    return NextResponse.json(
      { error: 'invalid_test_label', hint: 'Use [a-zA-Z0-9-] characters.' },
      { status: 400 },
    );
  }

  const today = utcDayIndex();
  const day =
    dRaw !== null && dRaw !== '' && Number.isFinite(Number(dRaw))
      ? Math.max(0, Math.trunc(Number(dRaw)))
      : today;

  // Publishing a FUTURE day without a test label would pre-claim that
  // day's postKey and kill its scheduled run.
  if (day > today && !testLabel) {
    return NextResponse.json(
      {
        error: 'future_day_requires_test',
        hint: `?d=${day} is in the future — add &test=<label> so the scheduled post is not consumed.`,
      },
      { status: 400 },
    );
  }

  const plan = planForDay(day);
  if (!plan) return NextResponse.json({ skipped: 'no_plan' });

  const postKey = `${day}:${plan.key}${testLabel ? `:test-${testLabel}` : ''}`;

  // Quota BEFORE the ledger claim: a quota-exhausted exit must not burn
  // the day's unique key.
  const quota = await getPublishingQuota();
  if (quota.ok && quota.data.used >= quota.data.limit) {
    return NextResponse.json({ skipped: 'quota_exhausted', ...quota.data });
  }

  // Claim the slot BEFORE publishing so a concurrent/retried run can't
  // post the same card twice (unique violation → skip/take-over).
  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from('ig_posts')
      .insert({ post_key: postKey, status: 'publishing' });
    if (error) {
      if (String(error.code) === '23505') {
        // The key exists. Published → done. Failed, or a 'publishing'
        // claim old enough to belong to a killed run → take it over so
        // a manual retry can rescue the day. Anything else → a live
        // concurrent run owns it.
        const staleCutoff = new Date(
          Date.now() - STALE_CLAIM_MINUTES * 60_000,
        ).toISOString();
        // created_at is refreshed on take-over so it acts as "claim
        // time": a second concurrent reclaimer re-evaluates its WHERE
        // against the committed row (READ COMMITTED), sees a fresh
        // timestamp, matches nothing, and skips — no double publish.
        const { data: reclaimed } = await admin
          .from('ig_posts')
          .update({
            status: 'publishing',
            error: null,
            created_at: new Date().toISOString(),
          })
          .eq('post_key', postKey)
          .or(`status.eq.failed,and(status.eq.publishing,created_at.lt.${staleCutoff})`)
          .select('id');
        if (!reclaimed || reclaimed.length === 0) {
          return NextResponse.json({ skipped: 'already_posted', postKey });
        }
      } else {
        Sentry.captureMessage('ig cron ledger insert failed', {
          level: 'warning',
          tags: { area: 'instagram', step: 'ledger' },
          extra: { postKey, message: error.message },
        });
      }
    }
  }

  const siteUrl = getSiteUrl();
  const imageUrl = `${siteUrl}/api/ig/card?d=${day}`;
  const hardDeadline = startedAt + TOTAL_BUDGET_MS;
  const reelDeadline = hardDeadline - FALLBACK_RESERVE_MS;

  // --- Reel first ---------------------------------------------------------
  let kind: 'reel' | 'image' = 'reel';
  let mediaUrl = '';
  let published: Awaited<ReturnType<typeof publishReelPost>>;

  const reel = await buildReelVideo({ dayIndex: day, baseUrl: siteUrl });
  if (!reel.ok) {
    published = { ok: false, reason: `build:${reel.reason}` };
  } else if (Date.now() > reelDeadline - MIN_REEL_PUBLISH_MS) {
    // Encoding ate the budget — don't start an IG upload we can't finish.
    published = { ok: false, reason: 'budget:no_time_for_reel_publish' };
  } else {
    const upload = await uploadPublicVideo(
      `reels/${postKey.replace(/:/g, '-')}.mp4`,
      reel.buffer,
    );
    if (!upload.ok) {
      published = { ok: false, reason: `upload:${upload.reason}` };
    } else {
      mediaUrl = upload.url;
      published = await publishReelPost({
        videoUrl: upload.url,
        caption: plan.caption,
        deadlineAt: reelDeadline,
      });
    }
  }

  // --- Image fallback -----------------------------------------------------
  // Safe only when the reel demonstrably did NOT go out: a `publish:`
  // failure is ambiguous (response lost after IG committed) — falling
  // back there could put both the reel and the image on the grid.
  if (!published.ok && !published.reason.startsWith('publish:')) {
    Sentry.captureMessage('ig cron reel failed — falling back to image', {
      level: 'warning',
      tags: { area: 'instagram', step: 'reel' },
      extra: { postKey, reason: published.reason },
    });
    kind = 'image';
    mediaUrl = imageUrl;
    published = await publishImagePost({ imageUrl, caption: plan.caption });
  }

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdmin();
    await admin
      .from('ig_posts')
      .update({
        status: published.ok ? 'published' : 'failed',
        media_id: published.ok ? published.data.id : null,
        error: published.ok ? null : published.reason,
        image_url: mediaUrl,
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

  return NextResponse.json({
    ok: true,
    kind,
    mediaId: published.data.id,
    postKey,
    elapsedMs: Date.now() - startedAt,
  });
}
