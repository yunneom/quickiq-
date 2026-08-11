import { NextResponse } from 'next/server';
import { verifyState } from '@/lib/social/oauth-state';
import { exchangeTikTokCode } from '@/lib/social/tiktok';
import { saveTikTokTokens } from '@/lib/social/settings';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** TikTok redirects the operator's browser back here after consent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminMedia = `${getSiteUrl()}/admin/media`;

  const providerError = searchParams.get('error');
  if (providerError) {
    return NextResponse.redirect(
      `${adminMedia}?tiktok=error&reason=${encodeURIComponent(providerError)}`,
    );
  }
  if (!verifyState(searchParams.get('state'))) {
    return NextResponse.redirect(`${adminMedia}?tiktok=error&reason=invalid_or_expired_state`);
  }
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${adminMedia}?tiktok=error&reason=no_code`);
  }

  const redirectUri = `${getSiteUrl()}/api/auth/tiktok/callback`;
  const result = await exchangeTikTokCode(code, redirectUri);
  if (!result.ok) {
    return NextResponse.redirect(
      `${adminMedia}?tiktok=error&reason=${encodeURIComponent(result.reason)}`,
    );
  }
  await saveTikTokTokens(result.data);
  return NextResponse.redirect(`${adminMedia}?tiktok=connected`);
}
