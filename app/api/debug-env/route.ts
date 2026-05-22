/**
 * TEMPORARY diagnostic endpoint — REMOVE AFTER DEBUGGING.
 *
 * Reports whether Lemon Squeezy env vars are present and look well-formed.
 * Gated by the LS webhook secret header so only operators with that value
 * can probe. Never returns the actual API key — only safe metadata
 * (length, first/last characters, whitespace/newline presence).
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function meta(name: string): Record<string, unknown> {
  const v = process.env[name];
  if (v == null) return { present: false };
  return {
    present: true,
    length: v.length,
    first8: v.slice(0, 8),
    last4: v.slice(-4),
    hasNewline: /[\r\n]/.test(v),
    hasSpace: / /.test(v),
    trimmedLength: v.trim().length,
  };
}

export async function GET(req: Request) {
  const token = req.headers.get('x-debug-token');
  const expected = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!expected || token !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  return NextResponse.json({
    note: 'TEMPORARY diagnostic — remove after use',
    LEMON_SQUEEZY_API_KEY: meta('LEMON_SQUEEZY_API_KEY'),
    LEMON_SQUEEZY_STORE_ID: meta('LEMON_SQUEEZY_STORE_ID'),
    LEMON_SQUEEZY_PRODUCT_VARIANT_ID: meta('LEMON_SQUEEZY_PRODUCT_VARIANT_ID'),
    LEMON_SQUEEZY_WEBHOOK_SECRET: meta('LEMON_SQUEEZY_WEBHOOK_SECRET'),
    NEXT_PUBLIC_APP_URL: meta('NEXT_PUBLIC_APP_URL'),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
