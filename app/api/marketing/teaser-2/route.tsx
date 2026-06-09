import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

async function fontData(
  origin: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  // Same-origin fetch — see teaser-1 for rationale.
  const res = await fetch(`${origin}/fonts/noto-sans-kr-korean-${weight}.woff`);
  return res.arrayBuffer();
}

/**
 * 1080×1080 Instagram-ready "Early Access" teaser. White base with
 * a bold 7 numeral to read at thumbnail size in a feed grid. Pairs
 * with teaser-1 (navy "Coming Soon") so the operator can post both
 * back-to-back without visual repetition.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const [regular, bold] = await Promise.all([
    fontData(origin, 400),
    fontData(origin, 700),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          color: '#0f172a',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* top-right yellow accent block */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 320,
            height: 320,
            background: '#fcd34d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#15308f',
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: 4,
          }}
        >
          FREE
        </div>

        {/* bottom-left navy accent strip */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: 200,
            height: 16,
            background: '#2554e6',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 80,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              color: '#64748b',
              textTransform: 'uppercase',
              fontWeight: 700,
              display: 'flex',
            }}
          >
            Early Access · 무료 응시
          </div>

          {/* center: huge 7 + tagline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: 40,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 24,
              }}
            >
              <span
                style={{
                  fontSize: 380,
                  fontWeight: 900,
                  lineHeight: 0.9,
                  color: '#2554e6',
                  letterSpacing: -16,
                  display: 'flex',
                }}
              >
                7
              </span>
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#0f172a',
                  display: 'flex',
                }}
              >
                분이면 충분
              </span>
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#0f172a',
                marginTop: 24,
                display: 'flex',
                letterSpacing: -1,
              }}
            >
              30문항 · 4영역 · 무료
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 500,
                color: '#475569',
                marginTop: 12,
                display: 'flex',
              }}
            >
              언어 · 수리 · 공간 · 논리 추론
            </div>
          </div>

          {/* footer: disclaimer + brand */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                background: '#fef3c7',
                border: '2px solid #fcd34d',
                color: '#92400e',
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 22,
                fontWeight: 600,
                alignSelf: 'flex-start',
                display: 'flex',
              }}
            >
              ⚠ 추정 점수 · 임상 진단 아님
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#15308f',
                letterSpacing: 6,
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              7iq · IQ TEST
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="quickiq-teaser-2.png"',
        'Cache-Control': 'public, max-age=3600',
      },
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
