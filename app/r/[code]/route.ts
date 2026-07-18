import { NextResponse, type NextRequest } from 'next/server';
import { getSession, resolveShortCode } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Short-URL redirect. `/r/{code}` → `/{locale}/result/{sessionId}` where
 * `code` is the first 8 chars of the session UUID.
 *
 * Resolution order: in-memory (dev) → Supabase prefix lookup (prod). The
 * memory-only version shipped first and broke every shared link in
 * production — serverless instances have empty Maps, so friends landed
 * on the homepage with the "top X%" hook gone.
 *
 * Misses redirect to the IQ landing (not the bare homepage) so a failed
 * share still funnels into the conversion page.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Dev / same-instance fast path.
  const memId = resolveShortCode(code);
  if (memId) {
    const locale = getSession(memId)?.locale ?? 'ko';
    return NextResponse.redirect(
      new URL(`/${locale}/result/${memId}`, _req.url),
      307,
    );
  }

  // Production path: prefix-match the UUID in Supabase. limit(2) so an
  // (astronomically unlikely) ambiguous prefix falls through to the miss
  // path instead of sending someone to the wrong result.
  if (/^[0-9a-fA-F]{8}$/.test(code) && isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdmin();
      const { data } = await admin
        .from('test_sessions')
        .select('id, locale')
        .like('id', `${code.toLowerCase()}%`)
        .limit(2);
      if (data && data.length === 1) {
        const locale = data[0].locale === 'en' ? 'en' : 'ko';
        return NextResponse.redirect(
          new URL(`/${locale}/result/${data[0].id}`, _req.url),
          307,
        );
      }
    } catch (err) {
      console.error('[r/code] supabase lookup failed:', err);
    }
  }

  return NextResponse.redirect(
    new URL('/ko/iq?utm_source=share_miss', _req.url),
    307,
  );
}
