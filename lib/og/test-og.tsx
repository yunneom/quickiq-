import { ImageResponse } from 'next/og';
import type { TestCatalogEntry } from '@/lib/tests/catalog';
import type { PersonalityProfile } from '@/lib/personality/types';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';
export const STORY_SIZE = { width: 1080, height: 1920 };

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

interface ProfileOgArgs {
  origin: string;
  entry: TestCatalogEntry;
  profile: PersonalityProfile;
  locale: 'ko' | 'en';
}

/**
 * Per-type share card (1200×630). The "custom result imagery per
 * archetype" lever every virality benchmark cites — a screenshot-clean
 * card with the type name baked in so shares carry the identity, not a
 * generic logo. Rendered by each types/[type]/opengraph-image route.
 */
export async function renderProfileOg({
  origin,
  entry,
  profile,
  locale,
}: ProfileOgArgs) {
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
          background: `linear-gradient(135deg, ${entry.gradient.from} 0%, ${entry.gradient.to} 100%)`,
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -220,
            top: -220,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />
        <div style={{ fontSize: 24, letterSpacing: 8, opacity: 0.9, display: 'flex' }}>
          {entry.eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              display: 'flex',
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 34,
              fontWeight: 500,
              opacity: 0.92,
              lineHeight: 1.3,
              maxWidth: 1000,
              display: 'flex',
            }}
          >
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            opacity: 0.85,
            letterSpacing: 4,
            display: 'flex',
          }}
        >
          {locale === 'ko' ? 'QUICKIQ · 무료 테스트' : 'QUICKIQ · Free test'}
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

interface ProfileStoryArgs {
  origin: string;
  entry: TestCatalogEntry;
  profile: PersonalityProfile;
  locale: 'ko' | 'en';
}

/**
 * Vertical 1080×1920 share card sized for Instagram / TikTok stories.
 * Designed for the long-press-save → upload-to-story flow: huge type
 * name, tagline, eyebrow brand, and a bottom CTA strip. The user takes
 * the test, taps share → save image, then uploads to their story —
 * carrying the archetype + the QuickIQ brand into their feed.
 */
export async function renderProfileStory({
  origin,
  entry,
  profile,
  locale,
}: ProfileStoryArgs) {
  const [regular, bold] = await Promise.all([
    fontData(origin, 400),
    fontData(origin, 700),
  ]);

  const youAreLabel = locale === 'ko' ? '나는' : 'I am';
  const ctaLabel =
    locale === 'ko' ? '너도 해볼래? · 무료' : 'Try it yourself · Free';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, ${entry.gradient.from} 0%, ${entry.gradient.to} 100%)`,
          color: 'white',
          fontFamily: 'NotoSansKR',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -260,
            top: -260,
            width: 900,
            height: 900,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -200,
            bottom: -200,
            width: 700,
            height: 700,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)',
            display: 'flex',
          }}
        />

        {/* top: brand eyebrow */}
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            opacity: 0.9,
            textTransform: 'uppercase',
            display: 'flex',
            marginTop: 40,
          }}
        >
          {entry.eyebrow}
        </div>

        {/* center: "I am [TYPE]" identity card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 500,
              opacity: 0.9,
              display: 'flex',
            }}
          >
            {youAreLabel}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 140,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -6,
              maxWidth: 920,
              display: 'flex',
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 36,
              fontWeight: 500,
              opacity: 0.92,
              lineHeight: 1.35,
              maxWidth: 920,
              display: 'flex',
            }}
          >
            {profile.tagline}
          </div>
        </div>

        {/* bottom: CTA pill + brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              background: '#ffffff',
              color: entry.gradient.to,
              borderRadius: 999,
              padding: '24px 44px',
              fontSize: 36,
              fontWeight: 800,
              alignSelf: 'flex-start',
              display: 'flex',
            }}
          >
            {ctaLabel}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              opacity: 0.85,
              letterSpacing: 6,
              display: 'flex',
            }}
          >
            QUICKIQ
          </div>
        </div>
      </div>
    ),
    {
      ...STORY_SIZE,
      fonts: [
        { name: 'NotoSansKR', data: regular, weight: 400, style: 'normal' },
        { name: 'NotoSansKR', data: bold, weight: 700, style: 'normal' },
      ],
    },
  );
}
