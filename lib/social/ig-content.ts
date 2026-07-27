import { dummyEnQuestions } from '@/lib/questions/dummy-en';
import { extraEnQuestions } from '@/lib/questions/extra-en';
import type { Question } from '@/lib/questions/types';

/**
 * Content plan for the global (English) Instagram account.
 *
 * Post shape is deliberately language-light: a puzzle card whose visual is
 * mostly numbers/shapes so it travels past the English-speaking audience
 * into India / LATAM feeds, with an English caption doing the CTA work.
 *
 * Only text-based questions are eligible — spatial items reference figure
 * assets that the card renderer can't draw, so they're filtered out.
 */

export interface IgPostPlan {
  /** Stable id used for dedup in the ig_posts ledger. */
  key: string;
  question: Question;
  caption: string;
}

/** Questions that render correctly as a standalone card. */
export function eligibleQuestions(): Question[] {
  return [...dummyEnQuestions, ...extraEnQuestions].filter(
    (q) => !q.figure_id && !q.question_image_url && q.category !== 'spatial',
  );
}

const HOOKS = [
  'Only 1 in 10 gets this on the first try 👀',
  'Solve it in 5 seconds. Go.',
  '90% pick the wrong one here.',
  'If you got this instantly, your logic is above average.',
  'Comment your answer before you scroll 👇',
  'This one filters the top 10% fast.',
  'Easy… until you look twice.',
];

const HASHTAGS = [
  '#iqtest',
  '#brainteaser',
  '#riddle',
  '#puzzle',
  '#logicpuzzle',
  '#braintraining',
  '#quiz',
  '#mindgames',
  '#iq',
  '#testyourself',
  '#brainteasers',
  '#dailypuzzle',
  '#quizztime',
  '#criticalthinking',
  '#puzzlelover',
];

const CATEGORY_TAG: Record<string, string> = {
  verbal: '#verbalreasoning',
  numerical: '#mathpuzzle',
  logical: '#logicpuzzle',
  spatial: '#spatialreasoning',
};

/**
 * Deterministic rotation: the same day always yields the same post, so a
 * retried cron run republishes nothing new and the ledger stays clean.
 * `dayIndex` is days since epoch (UTC).
 */
export function planForDay(dayIndex: number): IgPostPlan | null {
  const pool = eligibleQuestions();
  if (pool.length === 0) return null;
  const q = pool[dayIndex % pool.length];
  const hook = HOOKS[dayIndex % HOOKS.length];

  const tags = [
    ...HASHTAGS,
    CATEGORY_TAG[q.category] ?? '#brainteaser',
    '#quickiq',
  ].join(' ');

  const caption = [
    hook,
    '',
    q.question_text,
    '',
    ...q.options.map((o) => `${o.id}. ${o.text}`),
    '',
    'Answer + full explanation in the 30-question test — link in bio 🔗',
    'Free · no sign-up · takes 7 minutes',
    '',
    tags,
  ].join('\n');

  return { key: `q-${q.id}`, question: q, caption };
}

/** Days since Unix epoch in UTC — the rotation cursor. */
export function utcDayIndex(now = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}
