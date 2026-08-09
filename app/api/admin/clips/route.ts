import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { MAX_CLIP_BYTES, readClipManifest, storeClip } from '@/lib/social/clips';
import { clipResolutionOk, probeClip } from '@/lib/social/clip-frames';
import {
  CLIPS_PER_SCENE_TARGET,
  importClips,
} from '@/lib/social/clip-sources';
import type { BgScene } from '@/lib/social/reel-bg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// The auto-collect action downloads and ffmpeg-validates several clips.
export const maxDuration = 300;

const SCENES: BgScene[] = ['rails', 'road', 'chalk', 'slate'];

/**
 * Video clip management for reel backgrounds.
 *
 * POST { action: 'import', max? }        → run the auto-collector now
 *      (same code path as the cron, just with the whole window).
 * POST { scene, url, credit?, license?, requiresAttribution? }
 *      → register one clip from a direct video URL the operator pasted
 *        (Pexels/Pixabay/Mixkit download links etc.). The operator is
 *        asserting the license; we validate only that it decodes and is
 *        big enough to look good.
 *
 * Auth: ADMIN_TOKEN via `x-admin-token`, 404 on mismatch like the other
 * admin routes so the endpoint stays invisible.
 */
export const POST = withErrorHandling('admin/clips', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Direct file upload (multipart): works even when the stock host
  // refuses server-side fetches — the browser already has the bytes.
  if (req.headers.get('content-type')?.includes('multipart/form-data')) {
    const fd = await req.formData().catch(() => null);
    const file = fd?.get('file');
    const scene = SCENES.find((s) => s === String(fd?.get('scene') ?? ''));
    if (!fd || !(file instanceof File) || file.size === 0 || !scene) {
      return NextResponse.json(
        { error: 'bad_upload', hint: 'Send `file` (video) and `scene` form fields.' },
        { status: 400 },
      );
    }
    if (file.size > MAX_CLIP_BYTES) {
      return NextResponse.json(
        { error: 'too_large', bytes: file.size, maxBytes: MAX_CLIP_BYTES },
        { status: 413 },
      );
    }
    const video = Buffer.from(await file.arrayBuffer());
    const probe = await probeClip(video);
    if (!probe.ok) {
      return NextResponse.json({ error: 'not_decodable', reason: probe.reason }, { status: 415 });
    }
    if (!clipResolutionOk(probe)) {
      return NextResponse.json(
        { error: 'resolution_too_low', width: probe.width, height: probe.height, hint: 'Short side must be ≥ 540px.' },
        { status: 415 },
      );
    }
    const id = `manual-${scene}-${hash(file.name + file.size)}`;
    const stored = await storeClip(
      {
        id,
        scene,
        credit: String(fd.get('credit') ?? '') || undefined,
        license: String(fd.get('license') ?? '') || undefined,
        requiresAttribution: false,
      },
      video,
    );
    if (!stored.ok) {
      return NextResponse.json({ error: stored.reason }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      id,
      scene,
      bytes: video.length,
      width: probe.width,
      height: probe.height,
    });
  }

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    scene?: string;
    url?: string;
    credit?: string;
    license?: string;
    requiresAttribution?: boolean;
    max?: number;
  };

  if (body.action === 'import') {
    const max = Math.min(8, Math.max(1, Math.trunc(body.max ?? 6)));
    const result = await importClips(max, Date.now() + 270_000);
    return NextResponse.json({ ok: true, ...result });
  }

  const scene = SCENES.find((s) => s === body.scene);
  if (!scene) {
    return NextResponse.json(
      { error: 'invalid_scene', allowed: SCENES },
      { status: 400 },
    );
  }
  if (!body.url || !/^https:\/\//i.test(body.url)) {
    return NextResponse.json(
      { error: 'invalid_url', hint: 'Pass an https video URL.' },
      { status: 400 },
    );
  }

  const res = await fetch(body.url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: 'fetch_failed', status: res.status },
      { status: 502 },
    );
  }
  const type = res.headers.get('content-type') ?? '';
  if (!/video\/|octet-stream/.test(type)) {
    return NextResponse.json(
      { error: 'not_a_video', contentType: type },
      { status: 415 },
    );
  }
  const video = Buffer.from(await res.arrayBuffer());
  if (video.length === 0 || video.length > MAX_CLIP_BYTES) {
    return NextResponse.json(
      {
        error: 'too_large',
        bytes: video.length,
        maxBytes: MAX_CLIP_BYTES,
        hint: 'Pick a smaller rendition (720p is plenty — the frame is 1080×1920 after crop).',
      },
      { status: 413 },
    );
  }

  const probe = await probeClip(video);
  if (!probe.ok) {
    return NextResponse.json({ error: 'not_decodable', reason: probe.reason }, { status: 415 });
  }
  if (!clipResolutionOk(probe)) {
    return NextResponse.json(
      { error: 'resolution_too_low', width: probe.width, height: probe.height, hint: 'Short side must be ≥ 540px.' },
      { status: 415 },
    );
  }

  const id = `manual-${scene}-${hash(body.url)}`;
  const stored = await storeClip(
    {
      id,
      scene,
      credit: body.credit,
      license: body.license,
      requiresAttribution: Boolean(body.requiresAttribution),
      sourceUrl: body.url,
    },
    video,
  );
  if (!stored.ok) {
    return NextResponse.json({ error: stored.reason }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    id,
    scene,
    bytes: video.length,
    width: probe.width,
    height: probe.height,
    note: 'Next reel for this scene rotates through its clip pool.',
  });
});

/** Clip pool status per scene. */
export const GET = withErrorHandling('admin/clips', async (req: Request) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || req.headers.get('x-admin-token') !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }
  const manifest = await readClipManifest();
  return NextResponse.json({
    target: CLIPS_PER_SCENE_TARGET,
    scenes: SCENES.map((scene) => ({
      scene,
      clips: manifest.clips
        .filter((c) => c.scene === scene)
        .map(({ id, credit, license, requiresAttribution, bytes, storedAt, sourcePage }) => ({
          id,
          credit,
          license,
          requiresAttribution,
          bytes,
          storedAt,
          sourcePage,
        })),
    })),
  });
});

/** Tiny stable id from a URL — no crypto needed, just dedupe. */
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
