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
      'Answer: C (persimmon). Tangerine is far right; apple is right of pear; persimmon is left of apple. The only consistent order is persimmon — pear — apple — tangerine.',
  },
  // ───── Additional pool questions ─────
  {
    id: 'en-108',
    order_index: 108,
    category: 'verbal',
    difficulty: 2,
    locale: 'en',
    question_text: 'Which pair has a relationship different from the others?',
    options: [
      { id: 'A', text: 'pencil — writing' },
      { id: 'B', text: 'hammer — nail' },
      { id: 'C', text: 'needle — thread' },
      { id: 'D', text: 'book — library' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (book — library). A, B, C are tool-and-target pairs; D is object-and-location, a different kind of relationship.',
  },
  {
    id: 'en-109',
    order_index: 109,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  7, 14, 28, 56, ?',
    options: [
      { id: 'A', text: '84' },
      { id: 'B', text: '98' },
      { id: 'C', text: '112' },
      { id: 'D', text: '128' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (112). Geometric progression of ×2. 56 × 2 = 112. A (+28) is the trap of mistaking it for arithmetic.',
  },
  {
    id: 'en-110',
    order_index: 110,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    figure_id: 'f-upright',
    question_text: 'Which figure shows the letter below rotated 180°?',
    options: [
      { id: 'A', figure_id: 'f-rot90' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot270' },
      { id: 'D', figure_id: 'f-mirror' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. A 180° rotation flips the letter upside-down. A is 90°, C is 270°, D is a horizontal mirror.',
  },
  {
    id: 'en-111',
    order_index: 111,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'Four runners (A, B, C, D) ran a race. A was slower than B but faster than C. D was slower than everyone. Who finished first?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. Combining the constraints gives the order (fastest → slowest): B > A > C > D. B finishes first.',
  },

  // ───── Additional pool round 2 (+3 per category) ─────

  // Verbal +3
  {
    id: 'en-112',
    order_index: 112,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Which adverb best fills the blank?  "She ___ wished for her child\'s happiness."',
    options: [
      { id: 'A', text: 'dearly' },
      { id: 'B', text: 'rarely' },
      { id: 'C', text: 'accidentally' },
      { id: 'D', text: 'recklessly' },
    ],
    correct_id: 'A',
    explanation:
      "Answer: A (dearly). It conveys the intensity of a parent's wish. The others don't match the positive, heartfelt context.",
  },
  {
    id: 'en-113',
    order_index: 113,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Conscience : Guilt = Body : ?',
    options: [
      { id: 'A', text: 'exercise' },
      { id: 'B', text: 'pain' },
      { id: 'C', text: 'brain' },
      { id: 'D', text: 'heart' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (pain). Guilt is how the conscience signals something is wrong; pain is how the body signals it. Both are "alarm signal" relations.',
  },
  {
    id: 'en-114',
    order_index: 114,
    category: 'verbal',
    difficulty: 5,
    locale: 'en',
    question_text: 'Which word is most different in meaning from the others?',
    options: [
      { id: 'A', text: 'prejudice' },
      { id: 'B', text: 'bias' },
      { id: 'C', text: 'insight' },
      { id: 'D', text: 'stereotype' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (insight). A, B, D all describe negative pre-formed judgments. "Insight" is a positive cognitive capacity — seeing the true nature of something.',
  },

  // Numerical +3
  {
    id: 'en-115',
    order_index: 115,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  9, 4, 7, 4, 5, 4, ?, 4',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
      { id: 'C', text: '5' },
      { id: 'D', text: '7' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (3). Two interleaved sequences: even positions are all 4; odd positions step down by 2 (9 → 7 → 5 → 3).',
  },
  {
    id: 'en-116',
    order_index: 116,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text: 'If a 12% discount brings the price to $22, what was the original price?',
    options: [
      { id: 'A', text: '$23.50' },
      { id: 'B', text: '$24.64' },
      { id: 'C', text: '$25.00' },
      { id: 'D', text: '$26.40' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C ($25). 88% = $22 → original = 22 ÷ 0.88 = $25. Reverse-engineering an original price from a discounted one.',
  },
  {
    id: 'en-117',
    order_index: 117,
    category: 'numerical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'From a 10 cm × 10 cm square sheet, nine 2 cm × 2 cm squares are cut out. What is the area of the remaining paper?',
    options: [
      { id: 'A', text: '36 cm²' },
      { id: 'B', text: '50 cm²' },
      { id: 'C', text: '64 cm²' },
      { id: 'D', text: '72 cm²' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (64 cm²). Total 100 cm² − 9 × 4 cm² = 100 − 36 = 64.',
  },

  // Spatial +3
  {
    id: 'en-118',
    order_index: 118,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    figure_id: 'arrow-down',
    question_text: 'If you rotate the arrow below by 90° clockwise, which direction does it point?',
    options: [
      { id: 'A', figure_id: 'arrow-right' },
      { id: 'B', figure_id: 'arrow-left' },
      { id: 'C', figure_id: 'arrow-up' },
      { id: 'D', figure_id: 'arrow-down' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (left). A downward-pointing arrow rotated 90° clockwise points left.',
  },
  {
    id: 'en-119',
    order_index: 119,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    question_text:
      "A clock's hour hand moves from the 6 position to the 9 position. How many degrees did it rotate?",
    options: [
      { id: 'A', text: '60°' },
      { id: 'B', text: '90°' },
      { id: 'C', text: '120°' },
      { id: 'D', text: '180°' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (90°). The clock face is 12 equal segments of 30° each. 6 → 9 is 3 segments = 3 × 30° = 90°.',
  },
  {
    id: 'en-120',
    order_index: 120,
    category: 'spatial',
    difficulty: 5,
    locale: 'en',
    question_text:
      'A 4 cm cube is painted on all outer faces, then sliced into 1 cm cubes. How many small cubes have exactly two painted faces?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '18' },
      { id: 'C', text: '24' },
      { id: 'D', text: '36' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (24). Edge cubes have two painted faces. For a 4 cm cube: (4 − 2) = 2 edge cubes per edge × 12 edges = 24.',
  },

  // Logical +3
  {
    id: 'en-121',
    order_index: 121,
    category: 'logical',
    difficulty: 3,
    locale: 'en',
    question_text:
      '"Cats are animals. Animals breathe." If both statements are true, which is necessarily true?',
    options: [
      { id: 'A', text: 'All animals are cats.' },
      { id: 'B', text: 'Cats breathe.' },
      { id: 'C', text: 'Everything that breathes is a cat.' },
      { id: 'D', text: 'Cats are not animals.' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. Classic transitive syllogism. A and C are converse errors; D directly contradicts a premise.',
  },
  {
    id: 'en-122',
    order_index: 122,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'In a town, red-hat people always tell the truth, blue-hat people always lie. Someone says "My hat is blue." What color is their hat?',
    options: [
      { id: 'A', text: 'Red' },
      { id: 'B', text: 'Blue' },
      { id: 'C', text: 'Could be either' },
      { id: 'D', text: 'Cannot be determined' },
    ],
    correct_id: 'D',
    explanation:
      "Answer: D. If red-hat (truth-teller), the statement 'my hat is blue' is false — contradiction. If blue-hat (liar), the statement is true — also contradiction. A self-defeating statement.",
  },
  {
    id: 'en-123',
    order_index: 123,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'Of four candidates A, B, C, D, exactly two passed an exam. All of these are true: "If A did not pass, then B did not pass." "If C passed, then D passed." "Exactly one of B and C passed." Who passed?',
    options: [
      { id: 'A', text: 'A and B' },
      { id: 'B', text: 'A and C' },
      { id: 'C', text: 'B and D' },
      { id: 'D', text: 'C and D' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (A and B). From rule 3, exactly one of B/C. If C passed, rule 2 → D too, giving 3 passers (contradicts "exactly two"). So C did NOT pass, B did. Rule 1 contrapositive: B passed → A passed. So A and B.',
  },

  // ───── Final pool round (+5) ─────
  {
    id: 'en-124',
    order_index: 124,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Comfort : Sadness = Encouragement : ?',
    options: [
      { id: 'A', text: 'courage' },
      { id: 'B', text: 'fear' },
      { id: 'C', text: 'failure' },
      { id: 'D', text: 'attempt' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (fear). Comfort addresses sadness; encouragement addresses fear. Both are "action that counters this specific emotion" relations.',
  },
  {
    id: 'en-125',
    order_index: 125,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'A rectangle has a 3:2 width-to-height ratio and a perimeter of 50 cm. What is its width?',
    options: [
      { id: 'A', text: '12 cm' },
      { id: 'B', text: '15 cm' },
      { id: 'C', text: '18 cm' },
      { id: 'D', text: '20 cm' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (15 cm). Let width = 3x, height = 2x. Perimeter = 2(3x + 2x) = 10x = 50, so x = 5 and width = 15 cm.',
  },
  {
    id: 'en-126',
    order_index: 126,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    figure_id: 'arrow-up',
    question_text: 'If you rotate the arrow below by 270° clockwise, which direction does it point?',
    options: [
      { id: 'A', figure_id: 'arrow-right' },
      { id: 'B', figure_id: 'arrow-left' },
      { id: 'C', figure_id: 'arrow-down' },
      { id: 'D', figure_id: 'arrow-up' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (left). 270° clockwise equals 90° counter-clockwise. Up → left. Tests rotational equivalence.',
  },
  {
    id: 'en-127',
    order_index: 127,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'If "All apples are red" is FALSE, which is necessarily true?',
    options: [
      { id: 'A', text: 'No apples are red.' },
      { id: 'B', text: 'All apples are not red.' },
      { id: 'C', text: 'At least one apple is not red.' },
      { id: 'D', text: 'Nothing red is an apple.' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C. Negating a universal ∀ gives an existential ∃-not. "At least one apple is not red" is the precise negation; A/B claim more, D is unrelated.',
  },
  {
    id: 'en-128',
    order_index: 128,
    category: 'verbal',
    difficulty: 5,
    locale: 'en',
    question_text: 'Which word best fills the blank?  "His argument was so ___ that it was hard to agree with."',
    options: [
      { id: 'A', text: 'clear' },
      { id: 'B', text: 'biased' },
      { id: 'C', text: 'simple' },
      { id: 'D', text: 'concrete' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (biased). The "hard to agree with" framing wants a negative descriptor. "Biased" fits; the others are neutral or positive and would clash with the sentence frame.',
  },
];
