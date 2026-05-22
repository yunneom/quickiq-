import { dummyKoQuestions } from './dummy-ko';
import { dummyEnQuestions } from './dummy-en';
import { extraKoQuestions } from './extra-ko';
import { extraEnQuestions } from './extra-en';
import type { Question, Category } from './types';

export type { Question, Category, OptionId, Option } from './types';

export const TOTAL_QUESTIONS = 30;

/**
 * Set NEXT_PUBLIC_QUESTION_POOL=shuffle in production to draw 30 random
 * questions per session from the combined (base + extra) pool, with a fixed
 * 8/8/7/7 category split. Otherwise the deterministic base 30 are served
 * in order — preserving e2e reproducibility and matching what the PRD
 * specifies for the initial launch.
 */
const POOL_MODE = process.env.NEXT_PUBLIC_QUESTION_POOL;

const CATEGORY_COUNTS: Record<Category, number> = {
  verbal: 8,
  numerical: 8,
  spatial: 7,
  logical: 7,
};

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickPool(locale: 'ko' | 'en'): Question[] {
  return locale === 'en'
    ? [...dummyEnQuestions, ...extraEnQuestions]
    : [...dummyKoQuestions, ...extraKoQuestions];
}

function deterministic(locale: 'ko' | 'en'): Question[] {
  // Base set is already ordered 1..30 and matches the PRD distribution.
  return locale === 'en' ? dummyEnQuestions : dummyKoQuestions;
}

export function getQuestions(locale: string): Question[] {
  const loc: 'ko' | 'en' = locale === 'en' ? 'en' : 'ko';

  if (POOL_MODE !== 'shuffle') {
    return deterministic(loc);
  }

  // Pool mode: draw from the combined set, keeping category quotas.
  const pool = pickPool(loc);
  const picked: Question[] = [];
  for (const [cat, n] of Object.entries(CATEGORY_COUNTS) as [Category, number][]) {
    const inCat = pool.filter((q) => q.category === cat);
    const shuffled = shuffle(inCat).slice(0, n);
    picked.push(...shuffled);
  }
  // Renumber order_index 1..N for consistent UI behavior (progress bar,
  // submit ordering, etc.).
  return picked.map((q, idx) => ({ ...q, order_index: idx + 1 }));
}

export function getQuestionById(id: string): Question | undefined {
  return [
    ...dummyKoQuestions,
    ...dummyEnQuestions,
    ...extraKoQuestions,
    ...extraEnQuestions,
  ].find((q) => q.id === id);
}
