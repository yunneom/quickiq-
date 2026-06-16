/**
 * Single source of truth for the 6-test catalog used by the hub page,
 * per-test OG images, sitemap, and (future) cross-test recommendations.
 * Keep this in sync with the actual route folders under app/[locale]/.
 */

export interface TestCatalogEntry {
  /** URL slug, e.g. 'iq', 'mbti'. Matches the route folder name. */
  slug: 'iq' | 'mbti' | 'attachment' | 'love-lang' | 'enneagram' | 'teto-egen';
  /** Eyebrow / brand label shown in cards and OG images. */
  eyebrow: string;
  /** Display title in cards. */
  title: { ko: string; en: string };
  /** One-line hook for cards + OG. */
  tagline: { ko: string; en: string };
  /** Total question count. */
  questions: number;
  /** Approx. minutes to complete (string for "분"/"min" handling per locale). */
  minutes: number;
  /** Tailwind classes for the card accent + OG gradient. */
  accentBg: string;
  accentText: string;
  /** Gradient stops for OG image background, hex pairs. */
  gradient: { from: string; to: string };
  /** Emoji icon shown in cards. */
  emoji: string;
}

export const TEST_CATALOG: TestCatalogEntry[] = [
  {
    slug: 'mbti',
    eyebrow: '16 PERSONALITIES',
    title: { ko: '16 성격 유형', en: '16 Personalities' },
    tagline: {
      ko: '진짜 내 성격은 16유형 중 무엇?',
      en: 'Which of the 16 types are you?',
    },
    questions: 20,
    minutes: 3,
    accentBg: 'bg-violet-100',
    accentText: 'text-violet-700',
    gradient: { from: '#7c3aed', to: '#4338ca' },
    emoji: '💜',
  },
  {
    slug: 'teto-egen',
    eyebrow: 'TETO · EGEN',
    title: { ko: '테토 vs 에겐', en: 'Teto vs Egen' },
    tagline: {
      ko: '당신은 테토? 에겐? 호르몬 유형',
      en: 'Are you Teto or Egen? Hormone type',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-pink-100',
    accentText: 'text-pink-700',
    gradient: { from: '#ec4899', to: '#f97316' },
    emoji: '🔥',
  },
  {
    slug: 'attachment',
    eyebrow: 'ATTACHMENT STYLE',
    title: { ko: '애착 유형', en: 'Attachment Style' },
    tagline: {
      ko: '왜 나는 늘 비슷한 연애를 할까?',
      en: 'Why do I keep dating the same way?',
    },
    questions: 16,
    minutes: 3,
    accentBg: 'bg-rose-100',
    accentText: 'text-rose-700',
    gradient: { from: '#f43f5e', to: '#db2777' },
    emoji: '💗',
  },
  {
    slug: 'love-lang',
    eyebrow: '5 LOVE LANGUAGES',
    title: { ko: '사랑의 5가지 언어', en: '5 Love Languages' },
    tagline: {
      ko: '당신은 어떻게 사랑받고 싶나요?',
      en: 'How do you want to be loved?',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-red-100',
    accentText: 'text-red-600',
    gradient: { from: '#ef4444', to: '#e11d48' },
    emoji: '❤️',
  },
  {
    slug: 'enneagram',
    eyebrow: 'ENNEAGRAM',
    title: { ko: '에니어그램 9유형', en: 'Enneagram' },
    tagline: {
      ko: '당신의 본질은 9유형 중 무엇?',
      en: 'Which of the 9 types drives you?',
    },
    questions: 18,
    minutes: 3,
    accentBg: 'bg-teal-100',
    accentText: 'text-teal-700',
    gradient: { from: '#14b8a6', to: '#059669' },
    emoji: '🌿',
  },
  {
    slug: 'iq',
    eyebrow: 'IQ TEST',
    title: { ko: 'IQ 테스트', en: 'IQ Test' },
    tagline: {
      ko: '당신의 추정 IQ는 상위 몇 %?',
      en: 'What percentile is your estimated IQ?',
    },
    questions: 30,
    minutes: 7,
    accentBg: 'bg-brand-100',
    accentText: 'text-brand-700',
    gradient: { from: '#2554e6', to: '#15308f' },
    emoji: '🧠',
  },
];

export function getTestEntry(slug: TestCatalogEntry['slug']): TestCatalogEntry {
  const entry = TEST_CATALOG.find((t) => t.slug === slug);
  if (!entry) throw new Error(`Unknown test slug: ${slug}`);
  return entry;
}
