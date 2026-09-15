/**
 * The cron run's time budget, in one leaf module so the arithmetic can be
 * tested. (Same reason lib/social/schedule.ts exists: the route itself
 * pulls in the Next server runtime, Supabase and Sentry, so nothing in it
 * is reachable from a unit test.)
 *
 * One invocation has `maxDuration` seconds of wall clock. Inside it the
 * run must: seed the media pools, build and publish the day's post, and
 * still write the ledger row and the status snapshot. Every deadline
 * below is carved out of that one window.
 */

/** Vercel Hobby (fluid) ceiling for the route. */
export const MAX_DURATION_S = 300;
/** 10s under maxDuration so the tail (ledger + snapshot) is never cut. */
export const TOTAL_BUDGET_MS = 290_000;
/**
 * Held back from each post so a reel that fails before publishing still
 * leaves room for the image fallback (container + short poll + publish
 * ≈ 25s) plus the ledger write.
 */
export const FALLBACK_RESERVE_MS = 50_000;
/** A reel publish needs container create plus at least a few polls. */
export const MIN_REEL_PUBLISH_MS = 45_000;
/**
 * Don't START another post unless a realistic reel path could finish:
 * build + upload + create + minimum poll + publish + fallback reserve.
 */
export const MIN_POST_MS = 145_000;
/**
 * The most one post may spend.
 *
 * This does NOT reserve room for a second slot: the loop starts slot 1
 * only while the run is still under `hardDeadline - MIN_POST_MS`, so a
 * first post running past MIN_POST_MS already rules out a second one
 * whatever this cap says (see `secondSlotCanStart`). What the cap
 * actually sets is how much of the window ONE slow post may take, and
 * through that how long the reel build gets.
 */
export const MAX_POST_WINDOW_MS = 260_000;

/**
 * Wall clock the reel encoder gets: the post's window minus the fallback
 * reserve minus the publish reservation. A heavy clip (download +
 * ffmpeg extraction + 1080x1920 encode) that overruns it makes
 * buildReelVideo give up and the post goes out as the still card.
 */
export function reelBuildWindowMs(postWindowMs = MAX_POST_WINDOW_MS): number {
  return postWindowMs - FALLBACK_RESERVE_MS - MIN_REEL_PUBLISH_MS;
}

/**
 * Whether the run would start a second post after `elapsedMs` of the
 * window has gone. Mirrors the loop's own guard.
 */
export function secondSlotCanStart(elapsedMs: number): boolean {
  return elapsedMs <= TOTAL_BUDGET_MS - MIN_POST_MS;
}
