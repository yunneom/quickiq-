import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Public 1080×1080 puzzle card for Instagram feed posts.
 *
 * Must stay PUBLIC and unauthenticated: Instagram's ingestion fetcher GETs
 * this URL server-side when we stage a media container, so any auth check
 * here would break publishing.
 *
 * `?d=<dayIndex>` selects the question deterministically (same day → same
 * card), so a retried publish renders the identical image.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = Number(searchParams.get('d'));

  // Imported lazily so the edge bundle only pulls the EN pool.
  const { planForDay, utcDayIndex } = await import('@/lib/social/ig-content');
  const plan = planForDay(Number.isFinite(day) ? day : utcDayIndex());
  if (!plan) return new Response('no question', { status: 404 });

  const q = plan.question;
  const label =
    q.category === 'verbal'
      ? 'VERBAL REASONING'
      : q.category === 'numerical'
        ? 'NUMERICAL REASONING'
        : 'LOGICAL REASONING';

  // Long prompts need a smaller face to stay on one card.
  const promptSize = q.question_text.length > 90 ? 46 : q.question_text.length > 55 ? 56 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #2554e6 0%, #15308f 100%)',
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
            {label}
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
          <div
            style={{
              color: '#FFFFFF',
              fontSize: promptSize,
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: 56,
            }}
          >
            {q.question_text}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {q.options.map((o) => (
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
                    color: '#15308f',
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
            Answer in bio → 30-question IQ test
          </span>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
