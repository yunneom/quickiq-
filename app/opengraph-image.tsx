import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'IQ Test — 7분 만에 추정 IQ 확인';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Embed Noto Sans KR so KakaoTalk / X / iMessage crawlers render the
// Korean copy with proper glyphs (the Edge runtime image-response system
// has no Korean fonts by default — characters render as tofu).
async function fontData(weight: 400 | 700): Promise<ArrayBuffer> {
  const file =
    weight === 700
      ? 'noto-sans-kr-korean-700-normal.woff'
      : 'noto-sans-kr-korean-400-normal.woff';
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.8/files/${file}`,
  );
  return res.arrayBuffer();
}

/**
 * Click-optimized OG image — appears when the URL is shared on
 * Instagram, KakaoTalk, X, Facebook, iMessage, Slack, etc.
 * Designed for fast scanning at thumbnail size:
 *  - Strong vertical hierarchy (eyebrow → headline → CTA chip)
 *  - High-contrast brand color over a subtle ring/grid background
 *  - One bold visual anchor (the "%" sign) instead of stock graphics
 */
export default async function Image() {
  const [regular, bold] = await Promise.all([fontData(400), fontData(700)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2554e6 0%, #1d40b8 60%, #15308f 100%)',
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* decorative concentric rings (subtle) */}
        <div
          style={{
            position: 'absolute',
            right: -260,
            top: -260,
            width: 880,
            height: 880,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -160,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />

        {/* main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            width: '100%',
            position: 'relative',
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              fontSize: 22,
              letterSpacing: 10,
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
                fontSize: 84,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                maxWidth: 900,
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
                marginTop: 8,
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              상위 몇{' '}
              <span style={{ color: '#fcd34d', marginLeft: 16 }}>%</span>?
            </div>
          </div>

          {/* CTA chips */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            {['30문항', '7분', '무료 응시', '4영역 분석'].map((chip) => (
              <div
                key={chip}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 999,
                  padding: '12px 22px',
                  fontSize: 26,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {chip}
              </div>
            ))}
          </div>
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
