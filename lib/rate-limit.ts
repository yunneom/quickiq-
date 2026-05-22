import crypto from 'node:crypto';

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Per PRD §3.3: "IP당 시간당 테스트 시작 10회". Production-grade rate limits
 * should move to Redis / Upstash; for the MVP single-region Vercel deploy
 * an in-memory map per process is acceptable (worst case a determined user
 * gets ~10× workers of throughput, still bounded).
 *
 * IP is never stored in plaintext — only a SHA-256 hash. We also accept
 * X-Forwarded-For from the request, which Vercel & most reverse proxies set.
 */

interface Bucket {
  timestamps: number[];
}

const g = globalThis as unknown as { __iqRateBuckets?: Map<string, Bucket> };
if (!g.__iqRateBuckets) g.__iqRateBuckets = new Map();
const buckets = g.__iqRateBuckets;

const IP_SALT = process.env.RATE_LIMIT_SALT ?? 'iq-test-default-salt';

export function clientIpHash(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  const ip = fwd?.split(',')[0]?.trim() ?? real ?? 'unknown';
  return crypto.createHash('sha256').update(`${IP_SALT}:${ip}`).digest('hex').slice(0, 32);
}

interface CheckOptions {
  /** Bucket name — different limits per route. */
  key: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(
  req: Request,
  options: CheckOptions,
): RateLimitResult {
  const now = Date.now();
  const ipHash = clientIpHash(req);
  const bucketKey = `${options.key}:${ipHash}`;
  const bucket = buckets.get(bucketKey) ?? { timestamps: [] };

  // Drop expired timestamps
  const cutoff = now - options.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0];
    return {
      ok: false,
      remaining: 0,
      resetMs: Math.max(0, oldest + options.windowMs - now),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(bucketKey, bucket);
  return {
    ok: true,
    remaining: options.limit - bucket.timestamps.length,
    resetMs: options.windowMs,
  };
}

/**
 * Convenience preset for the test-start endpoint.
 *
 * Originally 10/hour (per PRD §3.3) but raised after launch — real users
 * frequently re-enter the test (back/refresh, share-link previews, NAT'd
 * mobile carriers funneling many users behind one IP). 60/hour still
 * blocks scrapers comfortably while staying out of the way of legit use.
 *
 * Override via RATE_LIMIT_TEST_START_LIMIT env or disable entirely by
 * setting RATE_LIMIT_DISABLED=1 at the route level.
 */
const ENV_LIMIT = Number(process.env.RATE_LIMIT_TEST_START_LIMIT);
export const RATE_LIMIT_TEST_START: CheckOptions = {
  key: 'test-start',
  limit: Number.isFinite(ENV_LIMIT) && ENV_LIMIT > 0 ? ENV_LIMIT : 60,
  windowMs: 60 * 60 * 1000, // 1 hour
};

export function isRateLimitDisabled(): boolean {
  return process.env.RATE_LIMIT_DISABLED === '1';
}
