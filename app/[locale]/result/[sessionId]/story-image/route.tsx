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
 * Instagram Story / Reels-friendly result card (1080 × 1920).
 * Optimized for full-screen vertical display: huge percentile + scan
 * URL at the bottom so a viewer who screenshots can find the test.
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
            'linear-gradient(180deg, #2554e6 0%, #1d40b8 50%, #15308f 100%)',
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* top eyebrow */}
        <div
          style={{
            fontSize: 36,
            letterSpacing: 14,
            opacity: 0.85,
            textTransform: 'uppercase',
            display: 'flex',
            marginTop: 60,
          }}
        >
          7iq · IQ TEST
        </div>

        {/* center percentile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 500, opacity: 0.9, display: 'flex' }}>
            {t.you}
          </div>
          <div
            style={{
              fontSize: 260,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -8,
              marginTop: 16,
              display: 'flex',
              alignItems: 'baseline',
              color: '#fcd34d',
            }}
          >
            {pct != null ? `${pct}%` : '?%'}
          </div>
          <div style={{ fontSize: 52, fontWeight: 600, opacity: 0.85, display: 'flex' }}>
            {t.topLabel}
          </div>
          {iq != null && (
            <div
              style={{
                marginTop: 36,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 999,
                padding: '20px 40px',
                fontSize: 44,
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
            padding: '32px 60px',
            fontSize: 52,
            fontWeight: 800,
            display: 'flex',
            marginBottom: 60,
          }}
        >
          {t.cta}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="iq-story-${params.sessionId}.png"`,
        // Per-session URL — result is immutable once computed, so a
        // long cache is safe + dramatically improves IG-share repeat
        // hits when a user re-opens the same story link.
        'Cache-Control': 'public, max-age=86400, immutable',
      },
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
