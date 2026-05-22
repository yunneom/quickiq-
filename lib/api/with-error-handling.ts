import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

type RouteHandler = (req: Request, ctx: unknown) => Promise<Response> | Response;

/**
 * Wraps an App Router route handler so every uncaught exception is reported
 * to Sentry (with the route name as a tag) and turned into a 500 JSON
 * response rather than leaking a stack trace. Designed for /api/* routes
 * that already return JSON on the happy path.
 */
export function withErrorHandling(name: string, handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      Sentry.captureException(err, { tags: { area: 'api', route: name } });
      console.error(`[api/${name}] uncaught error:`, err);
      return NextResponse.json(
        { error: 'internal_error', route: name },
        { status: 500 },
      );
    }
  };
}
