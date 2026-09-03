import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import {
  MURAL_STYLES,
  MURAL_STYLE_IDS,
  generateMuralImage,
  normalizeMuralImage,
  paintMural,
  muralEligible,
  type MuralStyleId,
} from '@/lib/social/mural';
import {
  countByStyle,
  deleteMural,
  loadMural,
  muralPublicUrl,
  pickMuralForSlot,
  readMuralManifest,
  storeMural,
} from '@/lib/social/murals';
import { getGeminiKey } from '@/lib/social/settings';
import { plansForDay, utcDayIndex } from '@/lib/social/ig-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Each wall is a full image-model round trip; a batch of five needs room.
export const maxDuration = 300;

/**
 * The generated-wall pool behind the "question painted on a wall" posts.
 *
 * GET                                  → pool contents + per-style counts
 * POST { action: 'generate', styles?, perStyle? }
 *                                      → generate walls (default: one per style)
 * POST { action: 'delete', id }        → drop one wall
 *
 * Auth: ADMIN_TOKEN via `x-admin-token`, 404 on mismatch like the other
 * admin routes so the endpoint stays invisible.
 */

function unauthorized(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  return !expected || req.headers.get('x-admin-token') !== expected;
}

export const GET = withErrorHandling('admin/murals', async (req: Request) => {
  if (unauthorized(req)) return new NextResponse('Not Found', { status: 404 });

  const { murals } = await readMuralManifest();
  return NextResponse.json({
    ok: true,
    configured: Boolean(await getGeminiKey()),
    counts: countByStyle(murals),
    styles: MURAL_STYLE_IDS.map((id) => ({ id, label: MURAL_STYLES[id].label })),
    murals: murals.map((m) => ({ ...m, url: muralPublicUrl(m.id) })),
  });
});

export const POST = withErrorHandling('admin/murals', async (req: Request) => {
  if (unauthorized(req)) return new NextResponse('Not Found', { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    id?: string;
    styles?: string[];
    perStyle?: number;
  };

  if (body.action === 'delete') {
    if (!body.id) {
      return NextResponse.json({ error: 'id_required' }, { status: 400 });
    }
    const result = await deleteMural(body.id);
    return result.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: result.reason }, { status: 502 });
  }

  if (body.action !== 'generate') {
    return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
  }

  const apiKey = await getGeminiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'gemini_key_missing',
        hint: 'Paste a Google AI Studio key in /admin/media (or set GEMINI_API_KEY in Vercel).',
      },
      { status: 503 },
    );
  }

  const wanted = (body.styles ?? MURAL_STYLE_IDS).filter((s): s is MuralStyleId =>
    (MURAL_STYLE_IDS as string[]).includes(s),
  );
  if (wanted.length === 0) {
    return NextResponse.json({ error: 'no_valid_styles' }, { status: 400 });
  }
  // Bounded so one click can never run past the function's own budget.
  const perStyle = Math.min(3, Math.max(1, Math.trunc(body.perStyle ?? 1)));
  const deadlineAt = Date.now() + 270_000;

  const created: string[] = [];
  const notes: string[] = [];
  for (let n = 0; n < perStyle; n++) {
    for (const styleId of wanted) {
      if (Date.now() > deadlineAt - 30_000) {
        notes.push('stopped: out of time — click again to add more');
        break;
      }
      const style = MURAL_STYLES[styleId];
      const gen = await generateMuralImage({ style, apiKey, deadlineAt });
      if (!gen.ok) {
        notes.push(`${styleId}: ${gen.reason}`);
        continue;
      }
      try {
        const image = await normalizeMuralImage(gen.image);
        const id = `${styleId}-${Date.now().toString(36)}${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        const stored = await storeMural({ id, style: styleId, model: gen.model }, image);
        if (stored.ok) created.push(id);
        else notes.push(`${styleId}: ${stored.reason}`);
      } catch (err) {
        notes.push(`${styleId}: ${err instanceof Error ? err.message : 'store_failed'}`);
      }
    }
  }

  const { murals } = await readMuralManifest();
  return NextResponse.json({
    ok: true,
    created,
    notes,
    counts: countByStyle(murals),
    murals: murals.map((m) => ({ ...m, url: muralPublicUrl(m.id) })),
  });
});

/**
 * A finished mural for an upcoming post — the operator's "what will
 * actually go out" check, since the pool page otherwise only shows blank
 * walls. `?d=&s=` pick the post, defaulting to today's first slot.
 */
export const PUT = withErrorHandling('admin/murals', async (req: Request) => {
  if (unauthorized(req)) return new NextResponse('Not Found', { status: 404 });

  const { searchParams } = new URL(req.url);
  const dRaw = searchParams.get('d')?.trim();
  const day =
    dRaw && Number.isFinite(Number(dRaw)) ? Math.max(0, Math.trunc(Number(dRaw))) : utcDayIndex();
  const slot = Math.max(0, Math.trunc(Number(searchParams.get('s') ?? 0) || 0));

  const plan = plansForDay(day)[slot];
  if (!plan) return NextResponse.json({ error: 'no_plan' }, { status: 404 });
  if (!muralEligible(plan.card)) {
    return NextResponse.json(
      { error: 'not_mural_eligible', hint: 'This post keeps the card treatment.' },
      { status: 409 },
    );
  }

  const { murals } = await readMuralManifest();
  const entry = pickMuralForSlot(day, slot, murals);
  if (!entry) return NextResponse.json({ error: 'pool_empty' }, { status: 404 });
  const wall = await loadMural(entry.id);
  if (!wall) return NextResponse.json({ error: 'wall_missing' }, { status: 404 });

  const png = await paintMural({
    wall,
    style: MURAL_STYLES[entry.style],
    card: plan.card,
    handle: '@quickiq',
  });
  return new NextResponse(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  });
});
