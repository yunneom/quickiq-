import { NextResponse } from 'next/server';
import { verifyState } from '@/lib/social/oauth-state';
import { exchangeThreadsCode } from '@/lib/social/threads';
import { saveThreadsTokens } from '@/lib/social/settings';
import { getSiteUrl } from '@/lib/site-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Threads redirects the operator's browser back here after consent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminMedia = `${getSiteUrl()}/admin/media`;

  const providerError = searchParams.get('error');
  if (providerError) {
    return NextResponse.redirect(
      `${adminMedia}?threads=error&reason=${encodeURIComponent(providerError)}`,
    );
  }
  if (!verifyState(searchParams.get('state'))) {
    return NextResponse.redirect(`${adminMedia}?threads=error&reason=invalid_or_expired_state`);
  }
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${adminMedia}?threads=error&reason=no_code`);
  }

  const redirectUri = `${getSiteUrl()}/api/auth/threads/callback`;
  const result = await exchangeThreadsCode(code, redirectUri);
  if (!result.ok) {
    return NextResponse.redirect(
      `${adminMedia}?threads=error&reason=${encodeURIComponent(result.reason)}`,
    );
  }
  await saveThreadsTokens(result.data);
  return NextResponse.redirect(`${adminMedia}?threads=connected`);
}
