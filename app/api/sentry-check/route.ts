/**
 * Temporary diagnostic endpoint — REMOVE after Sentry capture is verified.
 *
 * GET /api/sentry-check?token=<LEMON_SQUEEZY_WEBHOOK_SECRET> throws a
 * deliberate error after capturing it with Sentry. Both the capture
 * (via captureException) and the unhandled throw (via onRequestError
 * in instrumentation.ts) should land in the Sentry project. We then
 * remove this route immediately.
 */

import * as Sentry from '@sentry/nextjs';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (token !== process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return new Response('Not Found', { status: 404 });
  }
  Sentry.captureMessage('sentry-check: manual capture from /api/sentry-check', {
    level: 'info',
    tags: { test: 'install_verification' },
  });
  throw new Error('sentry-check: deliberate unhandled error from /api/sentry-check');
}
