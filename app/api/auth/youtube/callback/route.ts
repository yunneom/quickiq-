import { NextResponse } from 'next/server';
import { verifyState } from '@/lib/social/oauth-state';
import { exchangeYouTubeCode } from '@/lib/social/youtube';
import { saveYouTubeTokens } from '@/lib/social/settings';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Google redirects the operator's browser back here after consent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminMedia = `${getSiteUrl()}/admin/media`;

  const providerError = searchParams.get('error');
  if (providerError) {
    return NextResponse.redirect(
      `${adminMedia}?youtube=error&reason=${encodeURIComponent(providerError)}`,
    );
  }
  if (!verifyState(searchParams.get('state'))) {
    return NextResponse.redirect(`${adminMedia}?youtube=error&reason=invalid_or_expired_state`);
  }
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${adminMedia}?youtube=error&reason=no_code`);
  }

  const redirectUri = `${getSiteUrl()}/api/auth/youtube/callback`;
  const result = await exchangeYouTubeCode(code, redirectUri);
  if (!result.ok) {
    return NextResponse.redirect(
      `${adminMedia}?youtube=error&reason=${encodeURIComponent(result.reason)}`,
    );
  }
  await saveYouTubeTokens(result.data);
  return NextResponse.redirect(`${adminMedia}?youtube=connected`);
}
