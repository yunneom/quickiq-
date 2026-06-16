import { ImageResponse } from 'next/og';
import type { TestCatalogEntry } from '@/lib/tests/catalog';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

/**
 * Edge fetch for the bundled Korean font. Same-origin path so it works
 * in sandboxed previews — see app/api/marketing/teaser-1/route.tsx for
 * the reasoning. Caller supplies the request origin.
 */
async function fontData(
  origin: string,
  weight: 400 | 700,
): Promise<ArrayBuffer> {
  const res = await fetch(`${origin}/fonts/noto-sans-kr-korean-${weight}.woff`);
  return res.arrayBuffer();
}

interface RenderArgs {
  origin: string;
  entry: TestCatalogEntry;
  locale: 'ko' | 'en';
}

/**
 * Shared 1200×630 OG renderer used by every per-test opengraph-image
 * route. Pulls eyebrow / headline / question-count from the catalog so
 * copy edits propagate everywhere automatically. The hub OG uses a
 * different layout — see app/opengraph-image.tsx for that.
 */
export async function renderTestOg({ origin, entry, locale }: RenderArgs) {
  const [regular, bold] = await Promise.all([
    fontData(origin, 400),
    fontData(origin, 700),
  ]);

  const minLabel = locale === 'ko' ? `${entry.minutes}분` : `${entry.minutes} min`;
  const qLabel = locale === 'ko' ? `${entry.questions}문항` : `${entry.questions} questions`;
  const freeLabel = locale === 'ko' ? '무료' : 'Free';
  const chips = [qLabel, minLabel, freeLabel];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${entry.gradient.from} 0%, ${entry.gradient.to} 100%)`,
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* decorative rings — same vocabulary as the IQ OG */}
        <div
          style={{
            position: 'absolute',
            right: -240,
            top: -240,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%)',
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
          {/* eyebrow */}
          <div
            style={{
              fontSize: 22,
              letterSpacing: 10,
              opacity: 0.9,
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            {entry.eyebrow}
          </div>

          {/* huge headline */}
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
                maxWidth: 980,
                display: 'flex',
              }}
            >
              {entry.title[locale]}
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 36,
                fontWeight: 500,
                opacity: 0.92,
                lineHeight: 1.3,
                maxWidth: 980,
                display: 'flex',
              }}
            >
              {entry.tagline[locale]}
            </div>
          </div>

          {/* meta chips */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            {chips.map((chip) => (
              <div
                key={chip}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.28)',
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
      ...OG_SIZE,
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
