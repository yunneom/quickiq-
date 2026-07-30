import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  FOOTAGE_H,
  FOOTAGE_W,
  readManifest,
  storeFootage,
} from '@/lib/social/footage';
import type { BgScene } from '@/lib/social/reel-bg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SCENES: BgScene[] = ['rails', 'road', 'chalk', 'slate'];

/**
 * Load a real photograph as a reel background.
 *
 * POST body: { scene, url, credit?, license? }
 *
 * Runs on Vercel, which has open internet, so it can pull straight from
 * a stock library URL the operator picked. The image is normalized to
 * our oversized portrait frame and parked in Supabase Storage; the reel
 * builder reads only from there.
 *
 * The operator is asserting the license — we store what they declare so
 * credits are reproducible, we do not (and cannot) verify it here.
 *
 * Auth: ADMIN_TOKEN via `x-admin-token`, 404 on mismatch like the other
 * admin routes so the endpoint stays invisible.
 */
export const POST = withErrorHandling('admin/footage', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    scene?: string;
    url?: string;
    credit?: string;
    license?: string;
  };

  const scene = SCENES.find((s) => s === body.scene);
  if (!scene) {
    return NextResponse.json(
      { error: 'invalid_scene', allowed: SCENES },
      { status: 400 },
    );
  }
  if (!body.url || !/^https:\/\//i.test(body.url)) {
    return NextResponse.json(
      { error: 'invalid_url', hint: 'Pass an https image URL.' },
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
  if (!type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'not_an_image', contentType: type },
      { status: 415 },
    );
  }

  const source = Buffer.from(await res.arrayBuffer());
  // Cover-crop to the oversized portrait frame the Ken Burns move needs.
  const jpeg = await sharp(source)
    .rotate()
    .resize(FOOTAGE_W, FOOTAGE_H, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  const stored = await storeFootage(scene, jpeg, {
    credit: body.credit,
    license: body.license,
    sourceUrl: body.url,
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.reason }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    scene,
    bytes: jpeg.length,
    dimensions: `${FOOTAGE_W}x${FOOTAGE_H}`,
    note: 'Next reel for this scene will use the photo. Preview: /api/ig/reel-frame is the overlay only — build a reel to see it composited.',
  });
});

/** Which scenes currently have a photo, and what was declared for each. */
export const GET = withErrorHandling('admin/footage', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const manifest = await readManifest();
  return NextResponse.json({
    scenes: SCENES.map((scene) => ({
      scene,
      loaded: Boolean(manifest[scene]),
      ...manifest[scene],
    })),
  });
});
