import type { PersonalityProfile } from './types';
import {
  MBTI_TEST_TYPE,
  getMbtiProfile,
  getAllMbtiProfiles,
} from './mbti';
import {
  ATTACHMENT_TEST_TYPE,
  getAttachmentProfile,
  getAllAttachmentProfiles,
} from './attachment';
import {
  LOVE_LANG_TEST_TYPE,
  getLoveLangProfile,
  getAllLoveLangProfiles,
} from './love-lang';
import {
  ENNEAGRAM_TEST_TYPE,
  getEnneagramProfile,
  getAllEnneagramProfiles,
} from './enneagram';
import {
  TETO_EGEN_TEST_TYPE,
  getTetoEgenProfile,
  getAllTetoEgenProfiles,
} from './teto-egen';

/**
 * Slug → personality-test accessors. Lets the programmatic type pages
 * (app/[locale]/<slug>/types/[type]) and any cross-test feature resolve
 * profiles generically without a switch per test. Keyed by the same slug
 * used in lib/tests/catalog.ts (minus 'iq', which isn't profile-based).
 */
export interface PersonalityRegistryEntry {
  testType: string;
  getProfile: (id: string, locale: string) => PersonalityProfile | undefined;
  getAll: (locale: string) => PersonalityProfile[];
}

export const PERSONALITY_REGISTRY: Record<string, PersonalityRegistryEntry> = {
  mbti: {
    testType: MBTI_TEST_TYPE,
    getProfile: getMbtiProfile,
    getAll: getAllMbtiProfiles,
  },
  attachment: {
    testType: ATTACHMENT_TEST_TYPE,
    getProfile: getAttachmentProfile,
    getAll: getAllAttachmentProfiles,
  },
  'love-lang': {
    testType: LOVE_LANG_TEST_TYPE,
    getProfile: getLoveLangProfile,
    getAll: getAllLoveLangProfiles,
  },
  enneagram: {
    testType: ENNEAGRAM_TEST_TYPE,
    getProfile: getEnneagramProfile,
    getAll: getAllEnneagramProfiles,
  },
  'teto-egen': {
    testType: TETO_EGEN_TEST_TYPE,
    getProfile: getTetoEgenProfile,
    getAll: getAllTetoEgenProfiles,
  },
};

/** Slugs that have programmatic type pages (everything except IQ). */
export const PERSONALITY_SLUGS = Object.keys(PERSONALITY_REGISTRY);

export function getRegistryEntry(
  slug: string,
): PersonalityRegistryEntry | undefined {
  return PERSONALITY_REGISTRY[slug];
}
