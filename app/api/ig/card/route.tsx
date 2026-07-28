import { ImageResponse } from 'next/og';
import { renderScene } from '@/lib/social/quiz-scene';
import {
  bgFrameSvg,
  SQUARE_BG_DIM,
  BG_ACCENT,
  type BgScene,
} from '@/lib/social/reel-bg';

export const runtime = 'edge';

/**
 * Public 1080×1080 puzzle card — the still-image fallback for feed posts.
 * Same visual language as the reel: a frozen frame of the cinematic
 * scene (train / road / chalkboard) with the quiz popup on top.
 *
 * Must stay PUBLIC and unauthenticated: Instagram's ingestion fetcher GETs
 * this URL server-side when we stage a media container, so any auth check
 * here would break publishing.
 *
 * `?d=<dayIndex>&s=<slot>` selects the post deterministically (same day +
 * slot → same card), so a retried publish renders the identical image.
 */

const ACCENT_INK: Record<BgScene, string> = {
  rails: '#201200',
  road: '#201400',
  chalk: '#1D1A05',
  slate: '#0B1622',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Number(null)/Number('')/Number(' ') are all 0 — "absent/blank" must
  // mean "today", not day 0, so check the trimmed raw param first.
  const dRaw = searchParams.get('d')?.trim() ?? null;
  const slot = Number(searchParams.get('s'));

  // Imported lazily so the edge bundle only pulls the EN pool.
  const { planForSlot, utcDayIndex } = await import('@/lib/social/ig-content');
  // Public route: clamp to a non-negative integer so hostile values
  // (?d=-1, ?d=1.5) can't index outside the pools and 500.
  const day =
    dRaw !== null && dRaw !== '' && Number.isFinite(Number(dRaw))
      ? Math.max(0, Math.trunc(Number(dRaw)))
      : utcDayIndex();
  const plan = planForSlot(day, Number.isFinite(slot) ? slot : 0);
  if (!plan) return new Response('no question', { status: 404 });

  const card = plan.card;
  const bg = card.bg;
  const accent = BG_ACCENT[bg];
  const ink = ACCENT_INK[bg];
  const isBoard = bg === 'chalk' || bg === 'slate';

  // Frozen mid-reel moment as the backdrop (headlight approaching but
  // not yet blinding). Encoded inline — edge runtime, no fs access.
  const bgSvg = bgFrameSvg(bg, 0.45, SQUARE_BG_DIM);
  const bgUri = `data:image/svg+xml;base64,${btoa(bgSvg)}`;

  const scene =
    card.scene && card.scene.kind !== 'road'
      ? renderScene(card.scene, { width: 1080 - 128 - 80, compact: true })
      : null;

  const promptSize =
    card.prompt.length > 140
      ? 38
      : card.prompt.length > 90
        ? 44
        : card.prompt.length > 55
          ? 52
          : 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori */}
        <img
          src={bgUri}
          width={1080}
          height={1080}
          style={{ position: 'absolute', top: 0, left: 0 }}
          alt=""
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 4,
              background: 'rgba(4,6,10,0.55)',
              borderRadius: 999,
              padding: '10px 20px',
            }}
          >
            {card.label}
          </span>
          <span
            style={{
              color: '#FFFFFF',
              fontSize: 28,
              fontWeight: 800,
              background: 'rgba(4,6,10,0.55)',
              borderRadius: 999,
              padding: '10px 20px',
            }}
          >
            QuickIQ
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: isBoard ? 'rgba(0,0,0,0.22)' : 'rgba(5,8,13,0.80)',
              border: isBoard
                ? '3px dashed rgba(245,238,220,0.55)'
                : `2px solid ${accent}59`,
              borderRadius: isBoard ? 18 : 26,
              padding: '32px 36px',
            }}
          >
            {card.badge ? (
              <div style={{ display: 'flex', marginBottom: 20 }}>
                <span
                  style={{
                    background: `${accent}29`,
                    color: accent,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: 2,
                    borderRadius: 999,
                    padding: '10px 22px',
                  }}
                >
                  {card.badge}
                </span>
              </div>
            ) : null}

            <div
              style={{
                color: '#FFFFFF',
                fontSize: promptSize,
                fontWeight: 800,
                lineHeight: 1.22,
              }}
            >
              {card.prompt}
            </div>

            {scene ? (
              <div style={{ display: 'flex', marginTop: 26 }}>{scene}</div>
            ) : null}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 28,
              }}
            >
              {card.options.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: 14,
                    padding: '14px 20px',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 11,
                      background: accent,
                      color: ink,
                      fontSize: 24,
                      fontWeight: 800,
                    }}
                  >
                    {o.id}
                  </span>
                  <span
                    style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 600 }}
                  >
                    {o.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: accent,
                borderRadius: 999,
                padding: '14px 24px',
                marginTop: 24,
              }}
            >
              <span style={{ color: ink, fontSize: 26, fontWeight: 800 }}>
                {card.footer}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
