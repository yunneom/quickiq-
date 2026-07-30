import type { Metadata } from 'next';
import { getTestEntry, type TestCatalogEntry } from '@/lib/tests/catalog';

/**
 * Per-test landing page metadata factory.
 *
 * Without this, none of the 10 test landings exported metadata, so they
 * all inherited the locale layout's — meaning every landing (MBTI,
 * 신조어, 도파민, …) carried the IQ test's <title> and, worse, a
 * rel=canonical pointing at the HOMEPAGE. Google treated all of them as
 * duplicates of `/`, making the landings effectively unindexable for
 * their own keywords ("테토 에겐 테스트", "신조어 테스트", …).
 *
 * Title/description derive from the catalog (single source of truth),
 * so a new test gets correct metadata by adding one line to its page:
 *   export const generateMetadata = makeTestLandingMetadata('slug');
 */
/** Trim to a whole word within `max`, adding an ellipsis when cut. */
function clampDescription(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function makeTestLandingMetadata(slug: TestCatalogEntry['slug']) {
  return async function generateMetadata({
    params: { locale },
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const loc = (locale === 'en' ? 'en' : 'ko') as 'ko' | 'en';
    const entry = getTestEntry(slug);
    const title = `${entry.title[loc]} — ${entry.tagline[loc]} | QuickIQ`;
    // First FAQ answer doubles as a real, differentiated description;
    // fall back to the tagline for entries without FAQs. Trimmed to what
    // a SERP snippet actually shows (Korean truncates far earlier than
    // English) so descriptions stop being cut mid-sentence.
    const description = clampDescription(
      entry.faqs?.[loc]?.[0]?.a ?? entry.tagline[loc],
      loc === 'ko' ? 80 : 155,
    );
    const path = `/${loc}/${slug}`;
    return {
      title,
      description,
      alternates: {
        canonical: path,
        languages: {
          ko: `/ko/${slug}`,
          en: `/en/${slug}`,
          'x-default': `/ko/${slug}`,
        },
      },
      openGraph: {
        title,
        description,
        url: path,
        type: 'website',
        locale: loc === 'en' ? 'en_US' : 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  };
}
