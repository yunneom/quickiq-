import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { getStockKeys, readSettings, writeSettings } from '@/lib/social/settings';
import { isTikTokAppConfigured } from '@/lib/social/tiktok';
import { isYouTubeAppConfigured } from '@/lib/social/youtube';
import { isThreadsAppConfigured } from '@/lib/social/threads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Operator settings (stock API keys) without touching Vercel env.
 *
 * POST { pexelsApiKey?, pixabayApiKey?, geminiApiKey?, disconnect?: 'tiktok'|'youtube'|'threads' }
 *   — set a key ('' clears it), or disconnect a cross-post platform.
 * GET → configured/not per key/platform; NEVER returns token/key material,
 *   only non-secret identifiers (TikTok open_id, YouTube channel title)
 *   so the operator can confirm the right account connected.
 *
 * Auth: ADMIN_TOKEN via `x-admin-token`, 404 on mismatch like the other
 * admin routes so the endpoint stays invisible.
 */
export const POST = withErrorHandling('admin/settings', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    pexelsApiKey?: unknown;
    pixabayApiKey?: unknown;
    geminiApiKey?: unknown;
    disconnect?: unknown;
  };

  if (body.disconnect === 'tiktok' || body.disconnect === 'youtube' || body.disconnect === 'threads') {
    const stored = await writeSettings({ [body.disconnect]: null });
    if (!stored.ok) return NextResponse.json({ error: stored.reason }, { status: 500 });
    return NextResponse.json({ ok: true, disconnected: body.disconnect });
  }

  const clean = (v: unknown): string | undefined => {
    if (typeof v !== 'string') return undefined;
    const t = v.trim();
    // Stock API keys are plain tokens; reject anything that looks like
    // markup or is absurdly long before persisting.
    if (t.length > 200 || /[<>"'\s]/.test(t)) return t === '' ? '' : undefined;
    return t;
  };

  const pexelsApiKey = clean(body.pexelsApiKey);
  const pixabayApiKey = clean(body.pixabayApiKey);
  const geminiApiKey = clean(body.geminiApiKey);
  if (
    pexelsApiKey === undefined &&
    pixabayApiKey === undefined &&
    geminiApiKey === undefined
  ) {
    return NextResponse.json(
      {
        error: 'no_valid_keys',
        hint: 'Pass pexelsApiKey, pixabayApiKey and/or geminiApiKey.',
      },
      { status: 400 },
    );
  }

  const stored = await writeSettings({ pexelsApiKey, pixabayApiKey, geminiApiKey });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.reason }, { status: 500 });
  }

  const keys = await getStockKeys();
  return NextResponse.json({
    ok: true,
    pexelsConfigured: Boolean(keys.pexels),
    pixabayConfigured: Boolean(keys.pixabay),
    note: 'Collector uses the key from the next import on (cron or the collect button).',
  });
});

export const GET = withErrorHandling('admin/settings', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const [keys, stored] = await Promise.all([getStockKeys(), readSettings()]);
  return NextResponse.json({
    pexelsConfigured: Boolean(keys.pexels),
    pixabayConfigured: Boolean(keys.pixabay),
    source: {
      pexels: process.env.PEXELS_API_KEY?.trim()
        ? 'env'
        : stored.pexelsApiKey
          ? 'stored'
          : null,
      pixabay: process.env.PIXABAY_API_KEY?.trim()
        ? 'env'
        : stored.pixabayApiKey
          ? 'stored'
          : null,
    },
    crosspost: {
      tiktok: {
        appConfigured: isTikTokAppConfigured(),
        connected: Boolean(stored.tiktok),
        openId: stored.tiktok?.openId,
      },
      youtube: {
        appConfigured: isYouTubeAppConfigured(),
        connected: Boolean(stored.youtube),
        channelTitle: stored.youtube?.channelTitle,
      },
      threads: {
        appConfigured: isThreadsAppConfigured(),
        connected: Boolean(stored.threads),
        username: stored.threads?.username,
      },
    },
  });
});
