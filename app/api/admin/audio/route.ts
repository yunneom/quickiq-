import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { readAudioManifest, storeAudioTrack } from '@/lib/social/audio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Suno tracks run a few MB; anything bigger is probably not a song. */
const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Load a soundtrack into the reel audio library.
 *
 * POST body: { id, url, title?, credit? }
 *   id  — [a-z0-9-], stable name like "suno-upbeat-1"
 *   url — direct MP3 URL (Suno's share page exposes a cdn*.suno.ai link)
 *
 * Runs on Vercel (open internet). The reel builder rotates through every
 * loaded track deterministically; upload 3-5 tracks and each day's three
 * posts get different music.
 *
 * ⚠ Own/licensed music only (a paid Suno plan licenses your generations
 * for commercial use). Never load famous songs: API-published reels
 * cannot use Instagram's music licenses, so a recognized track means a
 * copyright match → mute/strike.
 *
 * Auth: ADMIN_TOKEN via `x-admin-token`, 404 on mismatch like the other
 * admin routes.
 */
export const POST = withErrorHandling('admin/audio', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    url?: string;
    title?: string;
    credit?: string;
  };

  const id = body.id?.toLowerCase().replace(/[^a-z0-9-]/g, '') ?? '';
  if (!id || id.length > 40) {
    return NextResponse.json(
      { error: 'invalid_id', hint: 'Use [a-z0-9-], max 40 chars.' },
      { status: 400 },
    );
  }
  if (!body.url || !/^https:\/\//i.test(body.url)) {
    return NextResponse.json(
      { error: 'invalid_url', hint: 'Pass an https MP3 URL.' },
      { status: 400 },
    );
  }

  const res = await fetch(body.url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: 'fetch_failed', status: res.status },
      { status: 502 },
    );
  }
  const type = res.headers.get('content-type') ?? '';
  if (!/audio\/|octet-stream/.test(type)) {
    return NextResponse.json(
      { error: 'not_audio', contentType: type },
      { status: 415 },
    );
  }

  const mp3 = Buffer.from(await res.arrayBuffer());
  if (mp3.length > MAX_BYTES) {
    return NextResponse.json(
      { error: 'too_large', bytes: mp3.length, max: MAX_BYTES },
      { status: 413 },
    );
  }

  const stored = await storeAudioTrack(id, mp3, {
    title: body.title,
    credit: body.credit,
    sourceUrl: body.url,
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.reason }, { status: 500 });
  }

  const manifest = await readAudioManifest();
  return NextResponse.json({
    ok: true,
    id,
    bytes: mp3.length,
    librarysize: manifest.tracks.length,
    note: 'Every reel from the next build on carries a soundtrack, rotating across loaded tracks.',
  });
});

/** Current soundtrack library. */
export const GET = withErrorHandling('admin/audio', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const manifest = await readAudioManifest();
  return NextResponse.json(manifest);
});
