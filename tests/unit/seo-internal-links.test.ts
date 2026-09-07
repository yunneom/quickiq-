import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { typeIndexLinks } from '../../components/personality/type-index';
import { PERSONALITY_REGISTRY, PERSONALITY_SLUGS } from '../../lib/personality/registry';
import { locales } from '../../i18n';

/**
 * Search Console showed the whole programmatic type-page set as
 * "Discovered – currently not indexed": the pages existed in the sitemap
 * but no indexable page linked to them. This pins the contract that
 * closes that gap — every type page gets an inbound link from its
 * test's landing, in every locale — so a new test or a new profile can
 * never quietly regress into an unlinked island again.
 */
describe('type pages are linked from their landing', () => {
  for (const slug of PERSONALITY_SLUGS) {
    for (const locale of locales) {
      it(`${slug} (${locale}): one link per profile, each to the right URL`, () => {
        const links = typeIndexLinks(slug, locale);
        const profiles = PERSONALITY_REGISTRY[slug].getAll(locale);

        assert.ok(profiles.length > 0, 'registry must expose profiles');
        assert.equal(links.length, profiles.length, 'one link per profile');

        const hrefs = new Set(links.map((l) => l.href));
        assert.equal(hrefs.size, links.length, 'no duplicate links');
        for (const p of profiles) {
          assert.ok(
            hrefs.has(`/${locale}/${slug}/types/${p.id}`),
            `${slug}/${p.id} (${locale}) has no inbound link from the landing`,
          );
        }
        for (const l of links) {
          assert.ok(l.label.trim().length > 0, `${l.href} has an empty anchor text`);
        }
      });
    }
  }

  it('returns nothing for a slug without type pages (iq) instead of throwing', () => {
    assert.deepEqual(typeIndexLinks('iq', 'ko'), []);
  });
});
