import { ImageResponse } from 'next/og';
import { REEL, reelFrameKey, REEL_FRAME_COUNT } from '@/lib/social/reel-spec';
import { renderScene } from '@/lib/social/quiz-scene';
import { BG_ACCENT, type BgScene } from '@/lib/social/reel-bg';

export const runtime = 'edge';

/**
 * Public 1080×1920 (9:16) reel OVERLAY frame — rendered with a
 * TRANSPARENT background. The video builder composites it over the
 * animated cinematic background (approaching train / night road /
 * chalkboard), so this file only draws the popup layer:
 *
 *   top bar (category + wordmark) → quiz popup panel → CTA strip
 *
 * `?d=<dayIndex>&s=<slot>` picks the post; `?f=<frame>` picks the moment:
 *   f=0 question · f=1 urgency nudge · f=2 outro CTA
 *
 * Must stay PUBLIC like /api/ig/card (fetched by the builder over HTTP).
 */

/** Dark ink used on top of each scene's light accent color. */
const ACCENT_INK: Record<BgScene, string> = {
  rails: '#201200',
  road: '#201400',
  chalk: '#1D1A05',
  slate: '#0B1622',
};

const ICONS = {
  train:
    'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zM11 10H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 118 14.5 1.5 1.5 0 016.5 16zm11 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  pencil:
    'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  warn: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
} as const;

const BG_ICON: Record<BgScene, string> = {
  rails: ICONS.train,
  road: ICONS.car,
  chalk: ICONS.pencil,
  slate: ICONS.pencil,
};

/** Urgency copy replaces the timer — the scene itself applies pressure. */
const NUDGE_COPY: Record<BgScene, string> = {
  rails: 'LOCK IN YOUR ANSWER',
  road: 'LOCK IN YOUR ANSWER',
  chalk: 'READ IT AGAIN — NO RUSH',
  slate: 'READ IT AGAIN — NO RUSH',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Number(null)/Number('')/Number(' ') are all 0 — "absent/blank" must
  // mean "today", not day 0, so check the trimmed raw param first.
  const dRaw = searchParams.get('d')?.trim() ?? null;
  const frame = Number(searchParams.get('f'));
  const slot = Number(searchParams.get('s'));

  const { planForSlot, utcDayIndex } = await import('@/lib/social/ig-content');
  // Public route: clamp to a non-negative integer so hostile values
  // (?d=-1, ?d=1.5) can't index outside the pools and 500.
  const day =
    dRaw !== null && dRaw !== '' && Number.isFinite(Number(dRaw))
      ? Math.max(0, Math.trunc(Number(dRaw)))
      : utcDayIndex();
  const plan = planForSlot(day, Number.isFinite(slot) ? slot : 0);
  if (!plan) return new Response('no question', { status: 404 });

  const f = Number.isFinite(frame)
    ? Math.min(Math.max(Math.trunc(frame), 0), REEL_FRAME_COUNT - 1)
    : 0;
  const role = reelFrameKey(f);

  const card = plan.card;
  const bg = card.bg;
  const accent = BG_ACCENT[bg];
  const ink = ACCENT_INK[bg];
  const isBoard = bg === 'chalk' || bg === 'slate';
  const isNudge = role === 'nudge';

  const promptSize =
    card.prompt.length > 140
      ? 46
      : card.prompt.length > 90
        ? 52
        : card.prompt.length > 55
          ? 60
          : 68;

  const topBar = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(4,6,10,0.55)',
          borderRadius: 999,
          padding: '12px 24px',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24">
          <path d={BG_ICON[bg]} fill={accent} />
        </svg>
        <span
          style={{
            color: 'rgba(255,255,255,0.92)',
            fontSize: 27,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          {card.label}
        </span>
      </div>
      <span
        style={{
          color: '#FFFFFF',
          fontSize: 34,
          fontWeight: 800,
          background: 'rgba(4,6,10,0.55)',
          borderRadius: 999,
          padding: '12px 24px',
        }}
      >
        QuickIQ
      </span>
    </div>
  );

  if (role === 'outro') {
    return new ImageResponse(
      (
        <div
          style={{
            width: REEL.width,
            height: REEL.height,
            display: 'flex',
            flexDirection: 'column',
            padding: 72,
            fontFamily: 'sans-serif',
            // Scrim: by outro time the scene's light source is huge —
            // dim it hard so the CTA owns the frame and the lamp cores
            // read as a warm rim, not grey discs behind the text.
            background: 'rgba(3,5,9,0.78)',
          }}
        >
          {topBar}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              // Everything (including the CTA card below) stays clear of
              // Instagram's bottom ~420px caption/audio zone.
              paddingBottom: 40,
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 132,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              GOT IT?
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.94)',
                fontSize: 44,
                fontWeight: 700,
                marginTop: 22,
              }}
            >
              Comment your answer below
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: 34,
                marginTop: 10,
              }}
            >
              Answer revealed tomorrow
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(5,8,13,0.92)',
                border: `2px solid ${accent}66`,
                borderRadius: 32,
                padding: '44px 52px',
                alignItems: 'center',
                marginTop: 64,
              }}
            >
              <span style={{ color: '#FFFFFF', fontSize: 52, fontWeight: 800 }}>
                Now test your REAL IQ
              </span>
              <span
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 33,
                  marginTop: 14,
                }}
              >
                Free 30-question test · 7 minutes · instant score
              </span>
              <div
                style={{
                  display: 'flex',
                  background: accent,
                  borderRadius: 999,
                  padding: '22px 56px',
                  marginTop: 28,
                }}
              >
                <span style={{ color: ink, fontSize: 40, fontWeight: 800 }}>
                  LINK IN BIO
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', height: 380 }} />
        </div>
      ),
      { width: REEL.width, height: REEL.height },
    );
  }

  // Question / nudge — the quiz popup panel over the moving scene.
  // Road-kind mini illustrations are gone: the background IS the road now.
  const scene =
    card.scene && card.scene.kind !== 'road'
      ? renderScene(card.scene, { width: REEL.width - 144 - 96 })
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: REEL.width,
          height: REEL.height,
          display: 'flex',
          flexDirection: 'column',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {topBar}

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
              background: isBoard ? 'rgba(0,0,0,0.22)' : 'rgba(5,8,13,0.92)',
              border: isBoard
                ? '4px dashed rgba(245,238,220,0.55)'
                : `2px solid ${accent}59`,
              borderRadius: isBoard ? 20 : 30,
              padding: '44px 48px',
            }}
          >
            <div style={{ display: 'flex', marginBottom: 30 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: isNudge ? accent : `${accent}29`,
                  borderRadius: 999,
                  padding: '12px 26px',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <path d={ICONS.warn} fill={isNudge ? ink : accent} />
                </svg>
                <span
                  style={{
                    color: isNudge ? ink : accent,
                    fontSize: 27,
                    fontWeight: 800,
                    letterSpacing: 2,
                  }}
                >
                  {isNudge
                    ? NUDGE_COPY[bg]
                    : (card.badge ?? 'CAN YOU SOLVE IT?')}
                </span>
              </div>
            </div>

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
              <div style={{ display: 'flex', marginTop: 38 }}>{scene}</div>
            ) : null}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginTop: 40,
              }}
            >
              {card.options.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: 18,
                    padding: '20px 26px',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 54,
                      height: 54,
                      borderRadius: 14,
                      background: accent,
                      color: ink,
                      fontSize: 30,
                      fontWeight: 800,
                    }}
                  >
                    {o.id}
                  </span>
                  <span
                    style={{ color: '#FFFFFF', fontSize: 38, fontWeight: 600 }}
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
                padding: '18px 30px',
                marginTop: 34,
              }}
            >
              <span style={{ color: ink, fontSize: 30, fontWeight: 800 }}>
                {card.footer}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: REEL.width, height: REEL.height },
  );
}
