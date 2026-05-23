import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';

export const runtime = 'edge';
export const alt = 'IQ Test result';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

interface Params {
  params: { locale: string; sessionId: string };
}

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

interface ApiResponse {
  result?: {
    estimatedIq?: number;
    topPercentile?: number;
  };
}

/**
 * Dynamic OG image for individual result pages.
 *
 * When a buyer shares `7iq.vercel.app/ko/result/{sessionId}` on KakaoTalk,
 * Instagram DM, X, etc., the preview shows THEIR own score — turning every
 * paid customer into a referral channel (PRD §2.4 viral hook).
 *
 * The score is fetched server-side from /api/test/result on each request.
 * If the session is unknown (e.g. shared after the in-memory store cleared),
 * we fall back to a neutral teaser image.
 */
export default async function Image({ params }: Params) {
  const locale = params.locale === 'en' ? 'en' : 'ko';
  const t =
    locale === 'ko'
      ? {
          you: '나는',
          topLabel: '상위',
          iqLabel: '추정 IQ',
          cta: '나도 테스트하기',
          neutral: '당신의 IQ는 상위 몇 %?',
        }
      : {
          you: 'I scored',
          topLabel: 'Top',
          iqLabel: 'Estimated IQ',
          cta: 'Take the test',
          neutral: 'What percentile is your IQ?',
        };

  let pct: number | null = null;
  let iq: number | null = null;

  try {
    const h = headers();
    const host = h.get('host') ?? '7iq.vercel.app';
    const proto = h.get('x-forwarded-proto') ?? 'https';
    const res = await fetch(
      `${proto}://${host}/api/test/result?sessionId=${params.sessionId}`,
      { cache: 'no-store' },
    );
    if (res.ok) {
      const data = (await res.json()) as ApiResponse;
      if (typeof data.result?.estimatedIq === 'number') iq = data.result.estimatedIq;
      if (typeof data.result?.topPercentile === 'number') pct = data.result.topPercentile;
    }
  } catch {
    // fall through to neutral image
  }

  const hasScore = pct != null && iq != null;

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
        {/* decorative ring */}
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
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            width: '100%',
            position: 'relative',
          }}
        >
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

          {hasScore ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 36, fontWeight: 500, opacity: 0.9, display: 'flex' }}>
                {t.you}
              </div>
              <div
                style={{
                  fontSize: 156,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: -5,
                  display: 'flex',
                  alignItems: 'baseline',
                  marginTop: 6,
                }}
              >
                {t.topLabel}{' '}
                <span style={{ color: '#fcd34d', marginLeft: 18 }}>{pct}%</span>
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  opacity: 0.9,
                  marginTop: 16,
                  display: 'flex',
                }}
              >
                {t.iqLabel}: {iq}
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 88,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: -2,
                maxWidth: 900,
                display: 'flex',
              }}
            >
              {t.neutral}
            </div>
          )}

          <div style={{ display: 'flex', gap: 14 }}>
            <div
              style={{
                background: '#fcd34d',
                color: '#15308f',
                borderRadius: 999,
                padding: '14px 26px',
                fontSize: 26,
                fontWeight: 800,
                display: 'flex',
              }}
            >
              {t.cta}
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 999,
                padding: '14px 26px',
                fontSize: 26,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              7iq.vercel.app
            </div>
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
