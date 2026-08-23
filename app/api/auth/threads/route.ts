import { NextResponse } from 'next/server';
import { issueState } from '@/lib/social/oauth-state';
import { buildThreadsAuthorizeUrl, isThreadsAppConfigured } from '@/lib/social/threads';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Start the Threads "Connect" flow — same shape as the TikTok/YouTube ones. */
export async function GET(req: Request) {
  const expected = process.env.ADMIN_TOKEN;
  const { searchParams } = new URL(req.url);
  if (!expected || searchParams.get('token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  if (!isThreadsAppConfigured()) {
    return NextResponse.json(
      {
        error: 'threads_app_not_configured',
        hint: 'Set THREADS_APP_ID and THREADS_APP_SECRET in Vercel first (from developers.facebook.com → Threads API product).',
      },
      { status: 503 },
    );
  }
  const redirectUri = `${getSiteUrl()}/api/auth/threads/callback`;
  return NextResponse.redirect(buildThreadsAuthorizeUrl(redirectUri, issueState()));
}
