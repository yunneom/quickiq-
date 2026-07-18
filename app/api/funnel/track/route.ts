import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { recordFunnelEvent } from '@/lib/session-store';
import { isSupabaseConfigured, createSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
// `Cache-Control: no-store` is enforced via response headers below;
// `dynamic = 'force-dynamic'` keeps Next from trying to statically
// pre-render this POST-only endpoint at build time.
export const dynamic = 'force-dynamic';

const ALLOWED_EVENTS = new Set([
  'IQ_TestStart',
  'IQ_Q1Answered',
  'IQ_Q15Answered',
  'IQ_Q25Answered',
  'IQ_TestSubmitted',
  'IQ_ResultViewed',
  'IQ_CheckoutViewed',
  'IQ_PaymentSuccess',
  'IQ_ExitIntent',
  'IQ_Shared',
  'PT_TestStart',
  'PT_TestSubmitted',
  'PT_ResultViewed',
  'PT_Shared',
]);

/**
 * In-memory funnel beacon. The client mirrors every funnel event into
 * this endpoint so we can compute drop-off curves in /api/admin/stats
 * even before Meta Pixel is approved.
 *
 * Allow-list of event names is deliberately strict — anything else
 * gets a 400 so a misbehaving extension or scraper can't fill the
 * counter map with garbage.
 *
 * Response is intentionally tiny (`{ ok: true }`) so the beacon stays
 * cheap; the keepalive POST from the browser is fire-and-forget.
 */
interface TrackBody {
  event?: unknown;
  testType?: unknown;
  locale?: unknown;
  sessionId?: unknown;
  utm?: unknown;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST = withErrorHandling('funnel/track', async (req: Request) => {
  let body: TrackBody = {};
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event : null;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: 'unknown_event' }, { status: 400 });
  }

  recordFunnelEvent(event);

  // Persist with dimensions — the in-memory counter evaporates per
  // serverless instance, so Supabase is the real ledger the admin
  // dashboard aggregates. Dims are sanitized (length-capped strings,
  // UUID-validated sessionId) since this is a public endpoint.
  if (isSupabaseConfigured()) {
    const str = (v: unknown, max = 40) =>
      typeof v === 'string' && v.length > 0 ? v.slice(0, max) : null;
    try {
      const admin = createSupabaseAdmin();
      const { error } = await admin.from('funnel_events').insert({
        event,
        test_type: str(body.testType),
        locale: str(body.locale, 5),
        session_id:
          typeof body.sessionId === 'string' && UUID_RE.test(body.sessionId)
            ? body.sessionId
            : null,
        utm:
          body.utm && typeof body.utm === 'object' && !Array.isArray(body.utm)
            ? body.utm
            : null,
      });
      if (error) console.error('[funnel/track] insert failed:', error.message);
    } catch (err) {
      console.error('[funnel/track] insert threw:', err);
    }
  }
  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
});
