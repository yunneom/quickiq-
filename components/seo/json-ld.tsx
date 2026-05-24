/**
 * JSON-LD structured data for SEO. Rendered server-side as a <script>
 * tag with type="application/ld+json" — Google/Bing parse this to
 * enrich search results (knowledge panel, rich snippets, breadcrumbs).
 */

interface OrganizationLDProps {
  name: string;
  url: string;
  locale: 'ko' | 'en';
}

export function OrganizationLD({ name, url, locale }: OrganizationLDProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    inLanguage: locale,
    logo: `${url}/icon`,
    sameAs: [],
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductLDProps {
  name: string;
  description: string;
  url: string;
  priceKRW: number;
  locale: 'ko' | 'en';
}

export function ProductLD({ name, description, url, priceKRW, locale }: ProductLDProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    inLanguage: locale,
    brand: { '@type': 'Brand', name: 'IQ Test' },
    offers: {
      '@type': 'Offer',
      url: `${url}/${locale}/checkout`,
      priceCurrency: 'KRW',
      price: String(priceKRW),
      availability: 'https://schema.org/InStock',
    },
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface WebsiteLDProps {
  url: string;
  name: string;
  locale: 'ko' | 'en';
}

export function WebsiteLD({ url, name, locale }: WebsiteLDProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    inLanguage: locale,
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface FaqLDProps {
  faqs: Array<{ q: string; a: string }>;
}

/**
 * FAQPage schema. Eligible for Google "FAQ rich result" treatment
 * (collapsible questions inline in SERP) when the page also visually
 * renders these same questions and answers — which our landing /faq
 * section already does, so we're safe.
 */
export function FaqLD({ faqs }: FaqLDProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
