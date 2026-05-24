import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { recordFunnelEvent } from '@/lib/session-store';

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
export const POST = withErrorHandling('funnel/track', async (req: Request) => {
  let body: { event?: unknown } = {};
  try {
    body = (await req.json()) as { event?: unknown };
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  const event = typeof body.event === 'string' ? body.event : null;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: 'unknown_event' }, { status: 400 });
  }

  recordFunnelEvent(event);
  return NextResponse.json(
    { ok: true },
    { headers: { 'Cache-Control': 'no-store' } },
  );
});
