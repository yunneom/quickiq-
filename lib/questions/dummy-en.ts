import type { Question } from './types';

/**
 * Base IQ question set (English), 30 items, served deterministically in
 * order 1..30. Calibrated for a middle-school-and-above audience — the
 * floor is a difficulty-3 item that still demands deliberate reasoning,
 * ramping to genuinely discriminating difficulty-5 items. Mirrors the
 * Korean base set's difficulty curve and answer-key balance; numerical /
 * spatial / logical items are shared (math is language-neutral) while the
 * verbal items use English vocabulary and idioms.
 *
 * Distribution: verbal 8 / numerical 8 / spatial 7 / logical 7.
 */
export const dummyEnQuestions: Question[] = [
  // ───── Verbal (8) ─────
  {
    id: 'en-001',
    order_index: 1,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Thirst : Water = Hunger : ?',
    options: [
      { id: 'A', text: 'Food' },
      { id: 'B', text: 'Cooking' },
      { id: 'C', text: 'Fullness' },
      { id: 'D', text: 'Stomach' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (Food). Water relieves thirst as food relieves hunger — the relation is "need → what satisfies it". C (fullness) is the resulting state, not the satisfier.',
  },
  {
    id: 'en-002',
    order_index: 2,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which word differs most in meaning from the others?',
    options: [
      { id: 'A', text: 'negligible' },
      { id: 'B', text: 'trivial' },
      { id: 'C', text: 'immense' },
      { id: 'D', text: 'trifling' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (immense = very large). A, B, and D all mean "small / insignificant", so the odd one out is the word meaning the opposite.',
  },
  {
    id: 'en-003',
    order_index: 3,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text:
      'Choose the best word: "Despite repeated failures, he stayed ___ and tried again."',
    options: [
      { id: 'A', text: 'elated' },
      { id: 'B', text: 'complacent' },
      { id: 'C', text: 'undeterred' },
      { id: 'D', text: 'hesitant' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (undeterred). "Undeterred" means not discouraged by setbacks, matching "tried again". A is over-excited, B is self-satisfied, D is the opposite of pressing on.',
  },
  {
    id: 'en-004',
    order_index: 4,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Effort : Achievement = Waste : ?',
    options: [
      { id: 'A', text: 'Time' },
      { id: 'B', text: 'Loss' },
      { id: 'C', text: 'Leisure' },
      { id: 'D', text: 'Saving' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (Loss). The relation is cause → outcome: effort yields achievement, waste yields loss. D (saving) is the opposite of waste — a trap.',
  },
  {
    id: 'en-005',
    order_index: 5,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Which one is different in kind from the others?',
    options: [
      { id: 'A', text: 'Temperature' },
      { id: 'B', text: 'Length' },
      { id: 'C', text: 'Weight' },
      { id: 'D', text: 'Scale' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (Scale). Temperature, length, and weight are all measurable quantities; a scale is the instrument that measures one of them. The classifier is an abstract role, not the surface word.',
  },
  {
    id: 'en-006',
    order_index: 6,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which word is closest in meaning to "intermittent"?',
    options: [
      { id: 'A', text: 'occasionally' },
      { id: 'B', text: 'steadily' },
      { id: 'C', text: 'instantly' },
      { id: 'D', text: 'forever' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (occasionally). "Intermittent" means starting and stopping at intervals. B (steadily) describes uninterrupted continuity — the opposite.',
  },
  {
    id: 'en-007',
    order_index: 7,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Doctor : Diagnosis = Judge : ?',
    options: [
      { id: 'A', text: 'Court' },
      { id: 'B', text: 'Crime' },
      { id: 'C', text: 'Defense' },
      { id: 'D', text: 'Verdict' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (Verdict). The relation is profession → its defining act: a doctor renders a diagnosis, a judge renders a verdict. A is a place, B is a subject, C is the defense lawyer\'s role.',
  },
  {
    id: 'en-008',
    order_index: 8,
    category: 'verbal',
    difficulty: 5,
    locale: 'en',
    question_text: 'The idiom "the tail wagging the dog" describes which situation?',
    options: [
      { id: 'A', text: 'A small thing defeating a large one' },
      { id: 'B', text: 'A minor part controlling or outweighing the main thing' },
      { id: 'C', text: 'Greed that never ends' },
      { id: 'D', text: 'Preparing far too thoroughly' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. The tail (a minor part) wagging the dog (the whole) means a secondary element has taken control of, or overshadowed, what should be primary.',
  },

  // ───── Numerical (8) ─────
  {
    id: 'en-009',
    order_index: 9,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  3, 4, 6, 9, 13, ?',
    options: [
      { id: 'A', text: '16' },
      { id: 'B', text: '17' },
      { id: 'C', text: '18' },
      { id: 'D', text: '20' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (18). The differences between terms are 1, 2, 3, 4 — increasing by 1 each step. The next difference is 5, so 13 + 5 = 18.',
  },
  {
    id: 'en-010',
    order_index: 10,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  2, 6, 12, 20, 30, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '44' },
      { id: 'D', text: '48' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (42). Each term is n×(n+1): 1·2, 2·3, 3·4, 4·5, 5·6. The differences grow 4, 6, 8, 10; the next is 12, so 30 + 12 = 42.',
  },
  {
    id: 'en-011',
    order_index: 11,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  2, 3, 5, 7, 11, ?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '14' },
      { id: 'C', text: '15' },
      { id: 'D', text: '13' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (13). These are the prime numbers in order. After 11 the next prime is 13 (12 is composite). You must spot a property of the numbers, not an arithmetic rule.',
  },
  {
    id: 'en-012',
    order_index: 12,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text: '15% of a number is 45. What is 40% of the same number?',
    options: [
      { id: 'A', text: '120' },
      { id: 'B', text: '135' },
      { id: 'C', text: '150' },
      { id: 'D', text: '180' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (120). If 15% = 45, the whole is 45 ÷ 0.15 = 300. Then 40% of 300 = 120. A two-step reverse-percent problem.',
  },
  {
    id: 'en-013',
    order_index: 13,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'Tap A fills a tank in 6 hours, tap B in 3 hours. With both open, how long does it take?',
    options: [
      { id: 'A', text: '1.5 hours' },
      { id: 'B', text: '2 hours' },
      { id: 'C', text: '2.5 hours' },
      { id: 'D', text: '4.5 hours' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (2 hours). Per hour A fills 1/6 and B fills 1/3, together 1/6 + 1/3 = 1/2 of the tank. Filling the whole (1) therefore takes 2 hours.',
  },
  {
    id: 'en-014',
    order_index: 14,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'You drive at 60 km/h for 2 hours, then 90 km/h for 1 hour. What is the average speed for the whole trip?',
    options: [
      { id: 'A', text: '65 km/h' },
      { id: 'B', text: '70 km/h' },
      { id: 'C', text: '75 km/h' },
      { id: 'D', text: '80 km/h' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (70 km/h). Total distance = 60×2 + 90×1 = 210 km over 3 hours, so 210 ÷ 3 = 70 km/h. Averaging the two speeds (60+90)/2 = 75 is the trap (C).',
  },
  {
    id: 'en-015',
    order_index: 15,
    category: 'numerical',
    difficulty: 5,
    locale: 'en',
    question_text: 'What number comes next?  5, 6, 10, 12, 20, 24, 40, ?',
    options: [
      { id: 'A', text: '44' },
      { id: 'B', text: '46' },
      { id: 'C', text: '48' },
      { id: 'D', text: '60' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (48). Two interleaved sequences each double: odd positions 5, 10, 20, 40 and even positions 6, 12, 24, ?. So 24 × 2 = 48.',
  },
  {
    id: 'en-016',
    order_index: 16,
    category: 'numerical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'If 8 people each shake hands once with every other person, how many handshakes happen in total?',
    options: [
      { id: 'A', text: '16' },
      { id: 'B', text: '36' },
      { id: 'C', text: '56' },
      { id: 'D', text: '28' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (28). Choose 2 of 8 people: 8 × 7 ÷ 2 = 28. Stopping at 8 × 7 = 56 counts each handshake twice (trap C).',
  },

  // ───── Spatial (7) ─────
  {
    id: 'en-017',
    order_index: 17,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which of the four nets below does NOT fold into a cube?',
    options: [
      { id: 'A', figure_id: 'cube-net-cross' },
      { id: 'B', figure_id: 'cube-net-t' },
      { id: 'C', figure_id: 'cube-net-l' },
      { id: 'D', figure_id: 'cube-net-bad' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D. A, B, and C place six non-overlapping faces that fold into a cube; D folds so that two faces land on the same spot, leaving one face missing.',
  },
  {
    id: 'en-018',
    order_index: 18,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    figure_id: 'f-upright',
    question_text: 'Which figure shows the letter below rotated 90° clockwise?',
    options: [
      { id: 'A', figure_id: 'f-rot90' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot270' },
      { id: 'D', figure_id: 'f-mirror' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A. Rotating "F" 90° clockwise turns its top toward the right. B is 180°, C is 270°, D is a left-right mirror image.',
  },
  {
    id: 'en-019',
    order_index: 19,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    figure_id: 'f-upright',
    question_text: 'Which figure is the mirror image (left-right flip) of the letter below?',
    options: [
      { id: 'A', figure_id: 'f-mirror' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot90' },
      { id: 'D', figure_id: 'f-rot270' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A. A mirror image flips left-right only. B (180° rotation) flips both directions, while C and D are rotations — distinct from a reflection.',
  },
  {
    id: 'en-020',
    order_index: 20,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    question_text:
      'On a die, opposite faces always sum to 7. If the top face is 2, what is on the bottom face?',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
      { id: 'C', text: '5' },
      { id: 'D', text: '6' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (5). Opposite faces sum to 7, so the face opposite 2 is 7 − 2 = 5.',
  },
  {
    id: 'en-021',
    order_index: 21,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    figure_id: 'pyramid-3step',
    question_text: 'The figure below is a 3-step pyramid built from 1 cm cubes. How many cubes are there in total?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '14' },
      { id: 'C', text: '9' },
      { id: 'D', text: '27' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (14). From top down: step 1 (1×1=1) + step 2 (2×2=4) + step 3 (3×3=9) = 14. D (27) is the trap of imagining a solid 3×3×3 cube.',
  },
  {
    id: 'en-022',
    order_index: 22,
    category: 'spatial',
    difficulty: 5,
    locale: 'en',
    figure_id: 'painted-cube',
    question_text:
      'A 3 cm cube is painted on every outer face, then cut into 27 one-cm cubes. How many small cubes have exactly three painted faces?',
    options: [
      { id: 'A', text: '6' },
      { id: 'B', text: '8' },
      { id: 'C', text: '4' },
      { id: 'D', text: '12' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (8). Only corner cubes get three painted faces, and a cube has 8 corners. A (6) is the face count and D (12) the edge count — common traps.',
  },
  {
    id: 'en-023',
    order_index: 23,
    category: 'spatial',
    difficulty: 5,
    locale: 'en',
    question_text: 'Slicing a cube once with a single flat plane, which cross-section shape is IMPOSSIBLE?',
    options: [
      { id: 'A', text: 'Triangle' },
      { id: 'B', text: 'Pentagon' },
      { id: 'C', text: 'Hexagon' },
      { id: 'D', text: 'Circle' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (Circle). A cube\'s faces are flat with straight edges, so any planar slice is a polygon (triangle through hexagon). A curved circle can never result.',
  },

  // ───── Logical (7) ─────
  {
    id: 'en-024',
    order_index: 24,
    category: 'logical',
    difficulty: 3,
    locale: 'en',
    question_text:
      'All mammals are vertebrates. A whale is a mammal. Which must be true?',
    options: [
      { id: 'A', text: 'All vertebrates are mammals.' },
      { id: 'B', text: 'A whale is a vertebrate.' },
      { id: 'C', text: 'All vertebrates are whales.' },
      { id: 'D', text: 'A whale is not a mammal.' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. A standard syllogism passes the implication through. A and C are the converse error (flipping the statement); D directly contradicts a premise.',
  },
  {
    id: 'en-025',
    order_index: 25,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text: 'If you exercise, you become healthier. He did not become healthier. Therefore?',
    options: [
      { id: 'A', text: 'He exercised.' },
      { id: 'B', text: 'Exercise is unrelated to health.' },
      { id: 'C', text: 'He did not exercise.' },
      { id: 'D', text: 'Cannot be determined.' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C. Modus tollens: if "P → Q" holds, then "not Q → not P". Since he did not become healthier, he did not exercise.',
  },
  {
    id: 'en-026',
    order_index: 26,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'All red things are big. All big things are expensive. This object is not expensive. Therefore?',
    options: [
      { id: 'A', text: 'This object is not red.' },
      { id: 'B', text: 'This object is red.' },
      { id: 'C', text: 'This object is big.' },
      { id: 'D', text: 'Cannot be determined.' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A. Red → big → expensive, so red → expensive. The contrapositive is "not expensive → not red". Since it is not expensive, it is not red.',
  },
  {
    id: 'en-027',
    order_index: 27,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text: 'If the statement "All apples are red" is false, which must be true?',
    options: [
      { id: 'A', text: 'All apples are not red.' },
      { id: 'B', text: 'No apple is red.' },
      { id: 'C', text: 'At least one apple is not red.' },
      { id: 'D', text: 'Everything red is not an apple.' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C. The negation of the universal "all apples are red" is the existential "at least one apple is not red". A and B claim too much; D is unrelated.',
  },
  {
    id: 'en-028',
    order_index: 28,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'Five people stand in a line. A is ahead of B, C is ahead of A, D is ahead of C, and E is at the very back. Who is at the very front?',
    options: [
      { id: 'A', text: 'D' },
      { id: 'B', text: 'C' },
      { id: 'C', text: 'A' },
      { id: 'D', text: 'E' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (D). Combining the clues gives D → C → A → B, with E at the back: D → C → A → B → E. D is at the front.',
  },
  {
    id: 'en-029',
    order_index: 29,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'Exactly two of A, B, C, D passed an exam. All of these are true: (1) If A failed, then B failed. (2) If C passed, then D passed. (3) Exactly one of B and C passed. Who passed?',
    options: [
      { id: 'A', text: 'A and B' },
      { id: 'B', text: 'A and C' },
      { id: 'C', text: 'B and D' },
      { id: 'D', text: 'C and D' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (A and B). By (3), exactly one of B/C passed. If C passed, then by (2) D also passed — that is 3 passers, a contradiction. So B passed and C failed. By the contrapositive of (1), B passing means A passed. The two passers are A and B.',
  },
  {
    id: 'en-030',
    order_index: 30,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'On an island, truth-tellers always tell the truth and liars always lie. You ask someone, "Are you a truth-teller?" They answer "Yes." What can you conclude?',
    options: [
      { id: 'A', text: 'They must be a truth-teller.' },
      { id: 'B', text: 'They must be a liar.' },
      { id: 'C', text: 'They could be either.' },
      { id: 'D', text: 'The question is invalid.' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C. A truth-teller honestly answers "Yes"; a liar also answers "Yes" because they lie about being a liar. Both give the same answer, so the reply alone cannot distinguish them.',
  },
];
