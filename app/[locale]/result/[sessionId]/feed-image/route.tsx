import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';

export const runtime = 'edge';

interface Params {
  params: { locale: string; sessionId: string };
}

async function fontData(weight: 400 | 700 | 900): Promise<ArrayBuffer> {
  // fontsource only ships 400/700; reuse 700 for 900 (bold-ish display weight).
  const w = weight === 900 ? 700 : weight;
  const file = `noto-sans-kr-korean-${w}-normal.woff`;
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.2.8/files/${file}`,
  );
  return res.arrayBuffer();
}

interface ApiResponse {
  result?: { estimatedIq?: number; topPercentile?: number };
}

/**
 * Square (1080 × 1080) result card optimized for an Instagram feed post,
 * Facebook square crop, or Threads. Sits between the 1200×630 OG image
 * (chat previews, Twitter cards) and the 1080×1920 story image: the
 * three sizes together cover every share surface our audience uses.
 *
 * Visual goals:
 *   - giant central percentile so the score reads from the grid
 *   - estimated-IQ chip beneath so the user can humble-brag both numbers
 *   - small CTA pill at the bottom so a screenshot still leads back to
 *     the test domain
 */
export async function GET(_req: Request, { params }: Params) {
  const locale = params.locale === 'en' ? 'en' : 'ko';
  const t =
    locale === 'ko'
      ? { you: '나는', topLabel: '상위', iqLabel: '추정 IQ', cta: '7iq.vercel.app' }
      : { you: 'I scored', topLabel: 'Top', iqLabel: 'Estimated IQ', cta: '7iq.vercel.app' };

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
      const d = (await res.json()) as ApiResponse;
      if (typeof d.result?.estimatedIq === 'number') iq = d.result.estimatedIq;
      if (typeof d.result?.topPercentile === 'number') pct = d.result.topPercentile;
    }
  } catch {
    // empty teaser if session not found
  }

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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 64,
          position: 'relative',
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            opacity: 0.85,
            textTransform: 'uppercase',
            display: 'flex',
            marginTop: 24,
          }}
        >
          7iq · IQ TEST
        </div>

        {/* center percentile + iq */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 500, opacity: 0.9, display: 'flex' }}>
            {t.you}
          </div>
          <div
            style={{
              fontSize: 220,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -6,
              marginTop: 8,
              display: 'flex',
              color: '#fcd34d',
            }}
          >
            {pct != null ? `${pct}%` : '?%'}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.85, display: 'flex' }}>
            {t.topLabel}
          </div>
          {iq != null && (
            <div
              style={{
                marginTop: 28,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 999,
                padding: '14px 30px',
                fontSize: 34,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              {t.iqLabel} {iq}
            </div>
          )}
        </div>

        {/* bottom CTA */}
        <div
          style={{
            background: '#fcd34d',
            color: '#15308f',
            borderRadius: 999,
            padding: '22px 44px',
            fontSize: 38,
            fontWeight: 800,
            display: 'flex',
            marginBottom: 16,
          }}
        >
          {t.cta}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="iq-feed-${params.sessionId}.png"`,
        // See story-image route — per-session UUID URL, immutable result.
        'Cache-Control': 'public, max-age=86400, immutable',
      },
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
