import { ImageResponse } from 'next/og';

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Number(null)/Number('')/Number(' ') are all 0 — "absent/blank" must
  // mean "today", not day 0, so check the trimmed raw param first.
  const dRaw = searchParams.get('d')?.trim() ?? null;

  // Imported lazily so the edge bundle only pulls the EN pool.
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

  const card = plan.card;
  const theme = CARD_THEMES[card.theme] ?? CARD_THEMES.blue;

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
