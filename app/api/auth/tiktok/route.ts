import { NextResponse } from 'next/server';
import { issueState } from '@/lib/social/oauth-state';
import { buildTikTokAuthorizeUrl, isTikTokAppConfigured } from '@/lib/social/tiktok';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Start the TikTok "Connect" flow — the operator navigates here directly
 * (a link from /admin/media, token in the query string since a plain
 * navigation carries no custom headers) and is redirected to TikTok's
 * consent screen.
 *
 * Auth: ADMIN_TOKEN via `?token=`, 404 on mismatch like the other admin
 * surfaces so the endpoint stays invisible.
 */
export async function GET(req: Request) {
  const expected = process.env.ADMIN_TOKEN;
  const { searchParams } = new URL(req.url);
  if (!expected || searchParams.get('token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  if (!isTikTokAppConfigured()) {
    return NextResponse.json(
      {
        error: 'tiktok_app_not_configured',
        hint: 'Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Vercel first (from developers.tiktok.com).',
      },
      { status: 503 },
    );
  }
  const redirectUri = `${getSiteUrl()}/api/auth/tiktok/callback`;
  return NextResponse.redirect(buildTikTokAuthorizeUrl(redirectUri, issueState()));
}
