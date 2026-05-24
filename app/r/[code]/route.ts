import { NextResponse, type NextRequest } from 'next/server';
import { getSession, resolveShortCode } from '@/lib/session-store';

/**
 * Short-URL redirect. `/r/{code}` → `/{locale}/result/{sessionId}` where
 * `code` is the first 8 chars of the session UUID. We resolve the
 * locale from the matching session (defaulting to KO) so shared links
 * land in the right language regardless of where the link was minted.
 *
 * Misses (unknown code) redirect to the landing page rather than 404 —
 * a failed share should still funnel into the test.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const sessionId = resolveShortCode(code);
  if (!sessionId) {
    return NextResponse.redirect(new URL('/', _req.url), 307);
  }
  const session = getSession(sessionId);
  const locale = session?.locale ?? 'ko';
  return NextResponse.redirect(
    new URL(`/${locale}/result/${sessionId}`, _req.url),
    307,
  );
}
