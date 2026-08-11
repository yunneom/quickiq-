import { NextResponse } from 'next/server';
import { issueState } from '@/lib/social/oauth-state';
import { buildYouTubeAuthorizeUrl, isYouTubeAppConfigured } from '@/lib/social/youtube';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Start the YouTube "Connect" flow — same shape as the TikTok one. */
export async function GET(req: Request) {
  const expected = process.env.ADMIN_TOKEN;
  const { searchParams } = new URL(req.url);
  if (!expected || searchParams.get('token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  if (!isYouTubeAppConfigured()) {
    return NextResponse.json(
      {
        error: 'youtube_app_not_configured',
        hint: 'Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in Vercel first (from console.cloud.google.com).',
      },
      { status: 503 },
    );
  }
  const redirectUri = `${getSiteUrl()}/api/auth/youtube/callback`;
  return NextResponse.redirect(buildYouTubeAuthorizeUrl(redirectUri, issueState()));
}
