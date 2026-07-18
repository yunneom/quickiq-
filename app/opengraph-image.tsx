import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';
import { TEST_CATALOG } from '@/lib/tests/catalog';

export const runtime = 'edge';
export const alt = 'QuickIQ — 무료 심리테스트 10종';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function fontData(
  origin: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  const res = await fetch(`${origin}/fonts/noto-sans-kr-korean-${weight}.woff`);
  return res.arrayBuffer();
}

/**
 * Bare-root OG image — same hub layout as /[locale]/opengraph-image.tsx
 * but rendered without a locale param (the bare domain "/" gets redirected
 * to /ko or /en by middleware, but crawlers that snapshot the original
 * URL still ask for this image). Defaults to Korean copy since the bulk
 * of traffic is KR.
 */
export default async function HubOgImageRoot() {
  const h = headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;

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
          background: 'linear-gradient(135deg, #1e1b4b 0%, #15308f 60%, #2554e6 100%)',
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -200,
            top: -200,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            width: 700,
            position: 'relative',
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 12, opacity: 0.9, display: 'flex' }}>
            QUICKIQ
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -2,
                whiteSpace: 'pre-line',
                display: 'flex',
              }}
            >
              {'당신을 알아가는\n10가지 테스트'}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 28,
                fontWeight: 500,
                opacity: 0.88,
                display: 'flex',
              }}
            >
              무료 · 익명 · 즉시 결과
            </div>
          </div>

          <div
            style={{
              background: '#fcd34d',
              color: '#15308f',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: 2,
              alignSelf: 'flex-start',
              display: 'flex',
            }}
          >
            START FREE →
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: 72,
            paddingLeft: 0,
            width: 500,
            justifyContent: 'center',
          }}
        >
          {TEST_CATALOG.map((t) => (
            <div
              key={t.slug}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                background: `linear-gradient(135deg, ${t.gradient.from}, ${t.gradient.to})`,
                borderRadius: 18,
                padding: '16px 22px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  display: 'flex',
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.22)',
                  borderRadius: 12,
                }}
              >
                {t.emoji}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: 2, display: 'flex' }}>
                  {t.eyebrow}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, display: 'flex' }}>
                  {t.title.ko}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
