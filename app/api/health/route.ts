import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/server';
import { isLemonSqueezyConfigured } from '@/lib/payments/lemon-squeezy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Lightweight liveness/readiness probe. Designed to be hit by:
 *  - Vercel platform monitors
 *  - external uptime tools (Pingdom, UptimeRobot, BetterStack, …)
 *  - Kubernetes-style readiness gates if we ever move off Vercel
 *
 * Returns the configured-vs-not status of each external integration so
 * a single GET shows what's wired up. We never echo secret material —
 * just a boolean per service.
 */
// Pin first import time per process so we can report cold-start age.
const PROCESS_BOOTED_AT = Date.now();

export async function GET() {
  // Memory usage is informational only — high RSS doesn't fail the
  // probe, but lets the operator catch a leak before the platform OOMs.
  let memMB: number | null = null;
  try {
    const m = process.memoryUsage();
    memMB = Math.round(m.rss / 1024 / 1024);
  } catch {
    // Edge runtime doesn't expose memoryUsage — silent skip.
  }
  return NextResponse.json(
    {
      status: 'ok',
      time: new Date().toISOString(),
      uptime_s: Math.round((Date.now() - PROCESS_BOOTED_AT) / 1000),
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      region: process.env.VERCEL_REGION ?? null,
      node: process.versions?.node ?? null,
      mem_rss_mb: memMB,
      integrations: {
        supabase: isSupabaseConfigured(),
        lemonSqueezy: isLemonSqueezyConfigured(),
        resend: Boolean(process.env.RESEND_API_KEY),
        sentry: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
        kakao: Boolean(process.env.NEXT_PUBLIC_KAKAO_APP_KEY),
        metaPixel: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
      },
    },
    {
      headers: {
        // Health check should never be cached.
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
