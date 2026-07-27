import { ImageResponse } from 'next/og';
import type { CardTheme } from '@/lib/social/ig-content';

export const runtime = 'edge';

/**
 * Public 1080×1080 puzzle card for Instagram feed posts.
 *
 * Must stay PUBLIC and unauthenticated: Instagram's ingestion fetcher GETs
 * this URL server-side when we stage a media container, so any auth check
 * here would break publishing.
 *
 * `?d=<dayIndex>` selects the post deterministically (same day → same
 * card), so a retried publish renders the identical image.
 */

// Per-theme gradient + the dark hex used for the option-letter squares.
const THEMES: Record<CardTheme, { bg: string; accent: string }> = {
  blue: { bg: 'linear-gradient(135deg, #2554e6 0%, #15308f 100%)', accent: '#15308f' },
  orange: { bg: 'linear-gradient(135deg, #ff7a18 0%, #d1204b 100%)', accent: '#b81c42' },
  green: { bg: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)', accent: '#065f46' },
  purple: { bg: 'linear-gradient(135deg, #7c3aed 0%, #3b1d8f 100%)', accent: '#3b1d8f' },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = Number(searchParams.get('d'));

  // Imported lazily so the edge bundle only pulls the EN pool.
  const { planForDay, utcDayIndex } = await import('@/lib/social/ig-content');
  const plan = planForDay(Number.isFinite(day) ? day : utcDayIndex());
  if (!plan) return new Response('no question', { status: 404 });

  const card = plan.card;
  const theme = THEMES[card.theme] ?? THEMES.blue;

  // Long prompts need a smaller face to stay on one card.
  const promptSize =
    card.prompt.length > 140
      ? 40
      : card.prompt.length > 90
        ? 46
        : card.prompt.length > 55
          ? 56
          : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          background: theme.bg,
          padding: 72,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.10)',
          }}
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
              color: 'rgba(255,255,255,0.85)',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            {card.label}
          </span>
          <span style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 800 }}>
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
          {card.badge ? (
            <div style={{ display: 'flex', marginBottom: 28 }}>
              <span
                style={{
                  background: 'rgba(0,0,0,0.30)',
                  color: '#FFE14D',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: 2,
                  borderRadius: 999,
                  padding: '12px 26px',
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
              lineHeight: 1.25,
              marginBottom: 48,
            }}
          >
            {card.prompt}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {card.options.map((o) => (
              <div
                key={o.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 22,
                  background: 'rgba(255,255,255,0.13)',
                  borderRadius: 22,
                  padding: '22px 30px',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#FFFFFF',
                    color: theme.accent,
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {o.id}
                </span>
                <span style={{ color: '#FFFFFF', fontSize: 38, fontWeight: 600 }}>
                  {o.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.22)',
            borderRadius: 999,
            padding: '20px 34px',
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 700 }}>
            {card.footer}
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
