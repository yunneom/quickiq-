import type { Question } from './types';

/**
 * Optional extra question pool (English). See extra-ko.ts for the pooling
 * strategy. These are content-parallel to extra-ko.ts so a session that
 * lands on a shuffled subset gets consistent difficulty across locales.
 */
export const extraEnQuestions: Question[] = [
  // ───── Verbal (2) ─────
  {
    id: 'en-101',
    order_index: 101,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Painter : Painting = Composer : ?',
    options: [
      { id: 'A', text: 'Instrument' },
      { id: 'B', text: 'Music' },
      { id: 'C', text: 'Singer' },
      { id: 'D', text: 'Concert' },
    ],
    correct_id: 'B',
    explanation: 'Creator-to-creation: a painter produces a painting; a composer produces music.',
  },
  {
    id: 'en-102',
    order_index: 102,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which word has a meaning different from the others?',
    options: [
      { id: 'A', text: 'cautious' },
      { id: 'B', text: 'reckless' },
      { id: 'C', text: 'careful' },
      { id: 'D', text: 'thoughtful' },
    ],
    correct_id: 'B',
    explanation: '"Reckless" means careless or thoughtless; the others all describe being careful and considered.',
  },

  // ───── Numerical (2) ─────
  {
    id: 'en-103',
    order_index: 103,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  100, 50, 25, 12.5, ?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '6' },
      { id: 'C', text: '6.25' },
      { id: 'D', text: '10' },
    ],
    correct_id: 'C',
    explanation: 'Each term is half of the previous one (geometric ratio of 0.5). 12.5 ÷ 2 = 6.25.',
  },
  {
    id: 'en-104',
    order_index: 104,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'If 12 workers finish a job in 15 days, how many days do 18 workers need to finish the same job? (Same productivity each.)',
    options: [
      { id: 'A', text: '8' },
      { id: 'B', text: '10' },
      { id: 'C', text: '12' },
      { id: 'D', text: '20' },
    ],
    correct_id: 'B',
    explanation: 'Total work = 12 × 15 = 180 worker-days. With 18 workers: 180 ÷ 18 = 10 days.',
  },

  // ───── Spatial (1) ─────
  {
    id: 'en-105',
    order_index: 105,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    figure_id: 'arrow-right',
    question_text: 'If you rotate the arrow below by 180° clockwise, which direction does it point?',
    options: [
      { id: 'A', figure_id: 'arrow-left' },
      { id: 'B', figure_id: 'arrow-up' },
      { id: 'C', figure_id: 'arrow-down' },
      { id: 'D', figure_id: 'arrow-right' },
    ],
    correct_id: 'A',
    explanation: 'A right-pointing arrow rotated 180° points the opposite direction — left.',
  },

  // ───── Logical (2) ─────
  {
    id: 'en-106',
    order_index: 106,
    category: 'logical',
    difficulty: 3,
    locale: 'en',
    question_text:
      'Of three people A, B, C: one always tells the truth, one always lies, and one is random. B says "A tells the truth." C says "B is a liar." Who is the truth-teller?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'Cannot be determined' },
    ],
    correct_id: 'D',
    explanation: 'The given statements admit multiple consistent assignments of truth-teller / liar / random. The puzzle is under-constrained.',
  },
  {
    id: 'en-107',
    order_index: 107,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'On a table sit an apple, a pear, a persimmon, and a tangerine. The apple is to the right of the pear, the persimmon is to the left of the apple, and the tangerine is at the far right. Which fruit is at the far left?',
    options: [
      { id: 'A', text: 'apple' },
      { id: 'B', text: 'pear' },
      { id: 'C', text: 'persimmon' },
      { id: 'D', text: 'tangerine' },
    ],
    correct_id: 'C',
    explanation:
      'Tangerine is at the far right; apple is right of pear; persimmon is left of apple. The only consistent order is persimmon — pear — apple — tangerine, so the far-left fruit is the persimmon.',
  },
];
