import { ImageResponse } from 'next/og';
import { REEL } from '@/lib/social/reel-spec';
import type { CardTheme } from '@/lib/social/ig-content';

export const runtime = 'edge';

/**
 * Public 1080×1920 (9:16) reel frame. The cron's video builder fetches
 * frames 0..N and stitches them into the daily countdown reel, so this
 * must stay PUBLIC like /api/ig/card.
 *
 * `?d=<dayIndex>` picks the post; `?f=<frame>` picks the moment:
 *   f = 0..countdownFrom-1 → countdown card showing "5" … "1"
 *   f = countdownFrom      → outro card ("time's up" + IQ-test CTA)
 */

// Simple Material-style icon paths — the renderer has no emoji font, so
// these are the "pictures" that keep frames from being text-only.
const THEME_ICON: Record<CardTheme, string> = {
  // car (trick logic)
  orange:
    'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 118 14.5 1.5 1.5 0 016.5 16zm11 0a1.5 1.5 0 111.5-1.5 1.5 1.5 0 01-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  // pencil (spelling)
  green:
    'M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  // lightning bolt (math)
  purple: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  // star (real test question)
  blue: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Number(null)/Number('')/Number(' ') are all 0 — "absent/blank" must
  // mean "today", not day 0, so check the trimmed raw param first.
  const dRaw = searchParams.get('d')?.trim() ?? null;
  const frame = Number(searchParams.get('f'));

  const { planForDay, utcDayIndex, CARD_THEMES } = await import(
    '@/lib/social/ig-content'
  );
  // Public route: clamp to a non-negative integer so hostile values
  // (?d=-1, ?d=1.5) can't index outside the pools and 500.
  const day =
    dRaw !== null && dRaw !== '' && Number.isFinite(Number(dRaw))
      ? Math.max(0, Math.trunc(Number(dRaw)))
      : utcDayIndex();
  const plan = planForDay(day);
  if (!plan) return new Response('no question', { status: 404 });

  const f = Number.isFinite(frame)
    ? Math.min(Math.max(frame, 0), REEL.countdownFrom)
    : 0;
  const isOutro = f === REEL.countdownFrom;
  const secondsLeft = REEL.countdownFrom - f;

  const card = plan.card;
  const theme = CARD_THEMES[card.theme] ?? CARD_THEMES.blue;
  const icon = THEME_ICON[card.theme] ?? THEME_ICON.blue;

  const promptSize =
    card.prompt.length > 140
      ? 52
      : card.prompt.length > 90
        ? 58
        : card.prompt.length > 55
          ? 66
          : 74;

  const header = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <svg width="52" height="52" viewBox="0 0 24 24">
          <path d={icon} fill="rgba(255,255,255,0.9)" />
        </svg>
        <span
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          {card.label}
        </span>
      </div>
      <span style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 800 }}>
        QuickIQ
      </span>
    </div>
  );

  const decor = (
    <>
      <div
        style={{
          position: 'absolute',
          top: -220,
          right: -220,
          width: 620,
          height: 620,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.10)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -260,
          left: -260,
          width: 640,
          height: 640,
          borderRadius: 999,
          background: 'rgba(0,0,0,0.12)',
        }}
      />
    </>
  );

  if (isOutro) {
    return new ImageResponse(
      (
        <div
          style={{
            width: REEL.width,
            height: REEL.height,
            display: 'flex',
            flexDirection: 'column',
            background: theme.bg,
            padding: 80,
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {decor}
          {header}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: 128,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              TIME&apos;S UP!
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: 52,
                fontWeight: 700,
                marginTop: 40,
              }}
            >
              Got your answer?
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 44,
                marginTop: 16,
              }}
            >
              Drop it in the comments — no cheating
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderRadius: 40,
              padding: '52px 56px',
              alignItems: 'center',
            }}
          >
            <span
              style={{ color: theme.accent, fontSize: 56, fontWeight: 800 }}
            >
              Now test your REAL IQ
            </span>
            <span
              style={{
                color: '#4b5563',
                fontSize: 36,
                marginTop: 18,
              }}
            >
              Free 30-question test · 7 minutes · instant score
            </span>
            <div
              style={{
                display: 'flex',
                background: theme.accent,
                borderRadius: 999,
                padding: '22px 58px',
                marginTop: 34,
              }}
            >
              <span style={{ color: '#FFFFFF', fontSize: 42, fontWeight: 800 }}>
                LINK IN BIO
              </span>
            </div>
          </div>
        </div>
      ),
      { width: REEL.width, height: REEL.height },
    );
  }

  const remainingFraction = secondsLeft / REEL.countdownFrom;

  return new ImageResponse(
    (
      <div
        style={{
          width: REEL.width,
          height: REEL.height,
          display: 'flex',
          flexDirection: 'column',
          background: theme.bg,
          padding: 80,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {decor}
        {header}

        {card.badge ? (
          <div style={{ display: 'flex', marginTop: 48 }}>
            <span
              style={{
                background: 'rgba(0,0,0,0.30)',
                color: '#FFE14D',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 2,
                borderRadius: 999,
                padding: '14px 30px',
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
            marginTop: 44,
          }}
        >
          {card.prompt}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            marginTop: 48,
          }}
        >
          {card.options.map((o) => (
            <div
              key={o.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: 'rgba(255,255,255,0.13)',
                borderRadius: 24,
                padding: '24px 32px',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: '#FFFFFF',
                  color: theme.accent,
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                {o.id}
              </span>
              <span style={{ color: '#FFFFFF', fontSize: 42, fontWeight: 600 }}>
                {o.text}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 230,
              height: 230,
              borderRadius: 999,
              border: '14px solid rgba(255,255,255,0.35)',
              background: 'rgba(0,0,0,0.18)',
            }}
          >
            <span style={{ color: '#FFFFFF', fontSize: 120, fontWeight: 900 }}>
              {secondsLeft}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              width: 760,
              height: 22,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.22)',
              marginTop: 44,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: Math.round(760 * remainingFraction),
                height: 22,
                borderRadius: 999,
                background: '#FFE14D',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.22)',
            borderRadius: 999,
            padding: '24px 36px',
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: 34, fontWeight: 700 }}>
            Comment your answer before time runs out
          </span>
        </div>
      </div>
    ),
    { width: REEL.width, height: REEL.height },
  );
}
