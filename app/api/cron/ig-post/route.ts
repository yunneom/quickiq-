import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import {
  isInstagramConfigured,
  publishImagePost,
  publishReelPost,
  getPublishingQuota,
} from '@/lib/social/instagram';
import { plansForDay, utcDayIndex, type IgPostPlan } from '@/lib/social/ig-content';
import { buildReelVideo } from '@/lib/social/reel';
import { uploadPublicMedia, uploadPublicVideo } from '@/lib/social/storage';
import sharp from 'sharp';
import { getSiteUrl } from '@/lib/site-url';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
// Reel pipeline: render frames + wasm H.264 encode + upload + Instagram
// video ingestion polling. 300s is the Hobby (fluid) ceiling.
export const maxDuration = 300;

// Time budget inside maxDuration. Deadlines are absolute epoch-ms.
const TOTAL_BUDGET_MS = 290_000; // 10s under maxDuration for safety
// Reserved so a reel that fails still leaves room for the image fallback
// (container + short poll + publish ≈ 25s) plus the ledger write.
const FALLBACK_RESERVE_MS = 50_000;
// A reel publish attempt needs container create + at least a few polls.
const MIN_REEL_PUBLISH_MS = 45_000;
// Don't start another post unless a realistic reel path could finish:
// build ~55s + upload + create + minimum poll + publish + fallback reserve.
const MIN_POST_MS = 145_000;
// One post never gets more than this — keeps room for a second slot.
const MAX_POST_WINDOW_MS = 200_000;

// Posts per invocation. Vercel Hobby allows 2 cron schedules/day, so two
// runs × 2 posts covers the 3 daily slots with room for a retry.
const MAX_POSTS_PER_RUN = 2;

// A 'publishing' row this old belongs to a run that was killed mid-flight
// (function timeout, crash) — it may be reclaimed.
const STALE_CLAIM_MINUTES = 20;

type PostOutcome = {
  slot: number;
  postKey: string;
  status: 'published' | 'failed' | 'skipped';
  kind?: 'reel' | 'image';
  mediaId?: string;
  reason?: string;
};

/**
 * Scheduled Instagram posting (Vercel Cron → see vercel.json).
 *
 * Each day has SLOTS_PER_DAY planned posts; a run publishes the ones that
 * are still unclaimed, up to MAX_POSTS_PER_RUN and only while the time
 * budget allows. Whatever doesn't fit is picked up by the next run —
 * that is the retry mechanism, not an error path.
 *
 * Each post publishes as a REEL (countdown-free quiz video) and falls
 * back to the still image if the video pipeline fails BEFORE the publish
 * step — a failed `media_publish` is ambiguous (Instagram may have
 * committed it) so falling back there could double-post.
 *
 * Idempotent by design: `ig_posts.post_key` is unique per (day, slot,
 * plan). A retried/duplicate firing either takes over a dead claim
 * (failed, or stale 'publishing') or skips.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
 *
 * Manual testing (with the same bearer token):
 *   ?d=<dayIndex>   publish a specific day's plans. A FUTURE day
 *                   additionally requires ?test= so it can't consume the
 *                   scheduled slot ahead of time.
 *   ?slot=<n>       publish only that slot.
 *   ?test=<label>   suffix the ledger key so a test post never blocks the
 *                   scheduled one (e.g. ?d=20663&slot=0&test=1)
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
  const slotRaw = searchParams.get('slot')?.trim() ?? null;

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
  // day's postKeys and kill its scheduled run.
  if (day > today && !testLabel) {
    return NextResponse.json(
      {
        error: 'future_day_requires_test',
        hint: `?d=${day} is in the future — add &test=<label> so the scheduled posts are not consumed.`,
      },
      { status: 400 },
    );
  }

  const allPlans = plansForDay(day);
  if (allPlans.length === 0) return NextResponse.json({ skipped: 'no_plan' });

  const onlySlot =
    slotRaw !== null && slotRaw !== '' && Number.isFinite(Number(slotRaw))
      ? Math.trunc(Number(slotRaw))
      : null;
  const slots = allPlans
    .map((plan, slot) => ({ plan, slot }))
    .filter(({ slot }) => onlySlot === null || slot === onlySlot);
  if (slots.length === 0) {
    return NextResponse.json({ skipped: 'slot_out_of_range' });
  }

  const quota = await getPublishingQuota();
  // Quota is checked BEFORE any ledger claim so an exhausted quota never
  // burns the day's unique keys. When the check itself fails we proceed —
  // Instagram enforces the real limit anyway.
  const quotaRemaining = quota.ok
    ? Math.max(0, quota.data.limit - quota.data.used)
    : MAX_POSTS_PER_RUN;
  if (quota.ok && quotaRemaining === 0) {
    return NextResponse.json({ skipped: 'quota_exhausted', ...quota.data });
  }

  const siteUrl = getSiteUrl();
  const hardDeadline = startedAt + TOTAL_BUDGET_MS;
  const budget = Math.min(MAX_POSTS_PER_RUN, quotaRemaining);

  const outcomes: PostOutcome[] = [];
  let publishedCount = 0;

  for (const { plan, slot } of slots) {
    if (publishedCount >= budget) break;
    if (Date.now() > hardDeadline - MIN_POST_MS) {
      outcomes.push({
        slot,
        postKey: buildPostKey(day, slot, plan, testLabel),
        status: 'skipped',
        reason: 'budget_exhausted_next_run_will_take_it',
      });
      break;
    }

    const outcome = await publishSlot({
      day,
      slot,
      plan,
      testLabel,
      siteUrl,
      // Front-load: give the current post a full window (capped) rather
      // than splitting evenly — one solid reel beats two rushed ones, and
      // whatever doesn't fit this run is the next run's first job.
      deadlineAt: Math.min(hardDeadline, Date.now() + MAX_POST_WINDOW_MS),
    });
    outcomes.push(outcome);
    if (outcome.status === 'published') publishedCount += 1;
  }

  const anyFailure = outcomes.some((o) => o.status === 'failed');
  return NextResponse.json(
    {
      ok: !anyFailure,
      day,
      published: publishedCount,
      elapsedMs: Date.now() - startedAt,
      outcomes,
    },
    { status: anyFailure && publishedCount === 0 ? 502 : 200 },
  );
}

function buildPostKey(
  day: number,
  slot: number,
  plan: IgPostPlan,
  testLabel: string | null,
): string {
  return `${day}:${slot}:${plan.key}${testLabel ? `:test-${testLabel}` : ''}`;
}

/** Claim → build → publish → record, for a single slot. */
async function publishSlot(args: {
  day: number;
  slot: number;
  plan: IgPostPlan;
  testLabel: string | null;
  siteUrl: string;
  deadlineAt: number;
}): Promise<PostOutcome> {
  const { day, slot, plan, testLabel, siteUrl, deadlineAt } = args;
  const postKey = buildPostKey(day, slot, plan, testLabel);

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
        // the next run can rescue the slot. Anything else → a live
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
          .or(
            `status.eq.failed,and(status.eq.publishing,created_at.lt.${staleCutoff})`,
          )
          .select('id');
        if (!reclaimed || reclaimed.length === 0) {
          return { slot, postKey, status: 'skipped', reason: 'already_posted' };
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

  const imageUrl = `${siteUrl}/api/ig/card?d=${day}&s=${slot}`;
  const reelDeadline = deadlineAt - FALLBACK_RESERVE_MS;

  let kind: 'reel' | 'image' = 'reel';
  let mediaUrl = '';
  let published: Awaited<ReturnType<typeof publishReelPost>>;

  const reel = await buildReelVideo({
    dayIndex: day,
    slot,
    baseUrl: siteUrl,
    deadlineAt: reelDeadline - MIN_REEL_PUBLISH_MS,
  });
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

  // Image fallback is safe only when the reel demonstrably did NOT go
  // out: a `publish:` failure is ambiguous (response lost after IG
  // committed) — falling back there could put both on the grid.
  if (!published.ok && !published.reason.startsWith('publish:')) {
    Sentry.captureMessage('ig cron reel failed — falling back to image', {
      level: 'warning',
      tags: { area: 'instagram', step: 'reel' },
      extra: { postKey, reason: published.reason },
    });
    kind = 'image';
    // Instagram's documented image format is JPEG; the card route emits
    // PNG (ImageResponse has no JPEG mode). Re-encode into storage and
    // hand IG the stable JPEG URL instead of the PNG route.
    const jpegUrl = await cardAsJpeg(imageUrl, postKey);
    mediaUrl = jpegUrl ?? imageUrl;
    published = await publishImagePost({
      imageUrl: mediaUrl,
      caption: plan.caption,
      deadlineAt,
    });
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
    return { slot, postKey, status: 'failed', reason: published.reason };
  }

  return {
    slot,
    postKey,
    status: 'published',
    kind,
    mediaId: published.data.id,
  };
}

/**
 * Fetch the card PNG and park a JPEG copy in public storage. Returns null
 * on any failure — the caller then falls back to the raw PNG URL, which
 * Instagram has accepted in practice even though JPEG is the documented
 * format.
 */
async function cardAsJpeg(
  imageUrl: string,
  postKey: string,
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .flatten({ background: '#0B0E14' })
      .jpeg({ quality: 90 })
      .toBuffer();
    const upload = await uploadPublicMedia(
      `cards/${postKey.replace(/:/g, '-')}.jpg`,
      jpeg,
      'image/jpeg',
    );
    return upload.ok ? upload.url : null;
  } catch {
    return null;
  }
}
