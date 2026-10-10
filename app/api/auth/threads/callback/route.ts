import { NextResponse } from 'next/server';
import { verifyState } from '@/lib/social/oauth-state';
import { exchangeThreadsCode } from '@/lib/social/threads';
import { saveThreadsTokens } from '@/lib/social/settings';
import { getSiteUrl } from '@/lib/site-url';
import { connectRedirectUrl, recordConnectAttempt } from '@/lib/social/connect-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Threads redirects the operator's browser back here after consent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminMedia = `${getSiteUrl()}/admin/media`;

  // Every exit records the outcome before redirecting: the redirect URL
  // is the only other place the reason exists, and the admin page can
  // lose it (see lib/social/connect-log.ts).
  const finish = async (outcome: 'connected' | 'error', reason?: string) => {
    await recordConnectAttempt('threads', { outcome, reason });
    return NextResponse.redirect(connectRedirectUrl(adminMedia, 'threads', { outcome, reason }));
  };

  const providerError = searchParams.get('error');
  if (providerError) {
    const detail = searchParams.get('error_description') ?? searchParams.get('error_message');
    return finish('error', detail ? `${providerError}: ${detail}` : providerError);
  }
  if (!verifyState(searchParams.get('state'))) {
    return finish('error', 'invalid_or_expired_state');
  }
  const code = searchParams.get('code');
  if (!code) return finish('error', 'no_code');

  const redirectUri = `${getSiteUrl()}/api/auth/threads/callback`;
  const result = await exchangeThreadsCode(code, redirectUri);
  if (!result.ok) return finish('error', result.reason);

  // A token we could not store is not a connection — saying "connected"
  // here would send the operator back to a page that reads "연결 안 됨".
  const saved = await saveThreadsTokens(result.data);
  if (!saved.ok) return finish('error', `save_failed: ${saved.reason}`);
  return finish('connected');
}
