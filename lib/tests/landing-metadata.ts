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
    // fall back to the tagline for entries without FAQs (IQ).
    const description = entry.faqs?.[loc]?.[0]?.a ?? entry.tagline[loc];
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
