import { ImageResponse } from 'next/og';

export const runtime = 'edge';

async function fontData(weight: 400 | 700 | 900): Promise<ArrayBuffer> {
  // fontsource ships 400/700 — reuse 700 for 900 display weight.
  const w = weight === 900 ? 700 : weight;
  const file = `noto-sans-kr-korean-${w}-normal.woff`;
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.8/files/${file}`,
  );
  return res.arrayBuffer();
}

/**
 * 1080×1080 Instagram-ready "Coming Soon" teaser. Mirrors the brand
 * gradient + concentric-ring decoration from app/opengraph-image.tsx
 * so all share surfaces feel like one product. The URL is meant to
 * be opened on a phone, long-pressed → "save image" → uploaded to
 * Instagram by the operator. No interactive UI, no analytics.
 */
export async function GET() {
  const [regular, bold] = await Promise.all([fontData(400), fontData(700)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #2554e6 0%, #1d40b8 55%, #15308f 100%)',
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* decorative rings — same vocabulary as opengraph-image.tsx */}
        <div
          style={{
            position: 'absolute',
            right: -240,
            top: -240,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -160,
            bottom: -160,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
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
              fontSize: 26,
              letterSpacing: 12,
              opacity: 0.85,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            7iq · IQ TEST
          </div>

          {/* headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                display: 'flex',
              }}
            >
              당신의 IQ는
            </div>
            <div
              style={{
                fontSize: 130,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: -4,
                marginTop: 16,
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              상위 몇{' '}
              <span style={{ color: '#fcd34d', marginLeft: 18 }}>%</span>?
            </div>
          </div>

          {/* bottom row: COMING SOON pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div
              style={{
                background: '#fcd34d',
                color: '#15308f',
                borderRadius: 999,
                padding: '18px 32px',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 4,
                display: 'flex',
              }}
            >
              COMING SOON
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                opacity: 0.8,
                display: 'flex',
              }}
            >
              프로필 링크에서 미리 응시
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
        'Content-Disposition': 'inline; filename="quickiq-teaser-1.png"',
        // Marketing assets are stable per-deploy; let CDN cache them.
        'Cache-Control': 'public, max-age=3600',
      },
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
