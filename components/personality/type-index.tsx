import Link from 'next/link';
import { getRegistryEntry } from '@/lib/personality/registry';

/**
 * Every type page of one test, as links, for the test's landing page.
 *
 * The programmatic type pages (/{locale}/{slug}/types/{id} — 108 URLs,
 * most of the sitemap) used to be reachable only from the post-quiz
 * result page (noindex), the share sheet, and each other. No indexable
 * page linked to them at all, so to a crawler they were an island that
 * only the sitemap admitted existed — which is exactly what Search
 * Console reported: "Discovered – currently not indexed" for the lot,
 * with a flat trend once the sitemap burst was processed.
 *
 * Rendering this on the landing turns the island into a linked cluster
 * (home → /tests → landing → every type), and gives each type page a
 * crawlable inbound link from an indexable page. It is a server
 * component: the list is static per (slug, locale) and pre-rendered.
 */

const COPY = {
  ko: { heading: (n: number) => `${n}가지 유형 미리 보기`, sub: '내 결과가 어디쯤일지 먼저 훑어보세요.' },
  en: { heading: (n: number) => `Browse all ${n} types`, sub: 'See where you might land before you start.' },
} as const;

export interface TypeIndexLink {
  href: string;
  label: string;
}

/**
 * Pure link set — kept separate from the markup so a test can assert the
 * contract that matters (every profile gets exactly one inbound link)
 * without rendering React.
 */
export function typeIndexLinks(slug: string, locale: 'ko' | 'en'): TypeIndexLink[] {
  const reg = getRegistryEntry(slug);
  if (!reg) return [];
  return reg.getAll(locale).map((p) => ({
    href: `/${locale}/${slug}/types/${p.id}`,
    label: p.name,
  }));
}

export function TypeIndex({ slug, locale }: { slug: string; locale: 'ko' | 'en' }) {
  const links = typeIndexLinks(slug, locale);
  if (links.length === 0) return null;
  const c = COPY[locale];
  return (
    <section className="mt-10" aria-labelledby={`type-index-${slug}`}>
      <h2 id={`type-index-${slug}`} className="text-sm font-semibold text-gray-900">
        {c.heading(links.length)}
      </h2>
      <p className="mt-1 text-xs text-gray-500">{c.sub}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-300"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
