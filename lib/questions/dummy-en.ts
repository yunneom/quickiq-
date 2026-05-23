import type { Question } from './types';

export const dummyEnQuestions: Question[] = [
  // ───── Verbal (8) ─────
  {
    id: 'en-001',
    order_index: 1,
    category: 'verbal',
    difficulty: 1,
    locale: 'en',
    question_text: 'Which one does NOT belong with the others?',
    options: [
      { id: 'A', text: 'Apple' },
      { id: 'B', text: 'Pear' },
      { id: 'C', text: 'Carrot' },
      { id: 'D', text: 'Grape' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (Carrot). Apple, pear, and grape are fruits; carrot is a root vegetable. Tests the ability to group objects under a shared superordinate category.',
  },
  {
    id: 'en-002',
    order_index: 2,
    category: 'verbal',
    difficulty: 2,
    locale: 'en',
    question_text: 'Which word is closest in meaning to "joyful"?',
    options: [
      { id: 'A', text: 'sad' },
      { id: 'B', text: 'delighted' },
      { id: 'C', text: 'angry' },
      { id: 'D', text: 'surprised' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (delighted). A is an antonym, C is a negative emotion, D is neutral. Only "delighted" shares the positive-emotion register of "joyful".',
  },
  {
    id: 'en-003',
    order_index: 3,
    category: 'verbal',
    difficulty: 2,
    locale: 'en',
    question_text: 'What is the opposite of "wide"?',
    options: [
      { id: 'A', text: 'narrow' },
      { id: 'B', text: 'long' },
      { id: 'C', text: 'tall' },
      { id: 'D', text: 'deep' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A (narrow). B, C, and D each describe a different spatial dimension; only "narrow" is the direct opposite of "wide".',
  },
  {
    id: 'en-004',
    order_index: 4,
    category: 'verbal',
    difficulty: 2,
    locale: 'en',
    question_text: 'Which is NOT a piece of furniture?',
    options: [
      { id: 'A', text: 'chair' },
      { id: 'B', text: 'desk' },
      { id: 'C', text: 'bed' },
      { id: 'D', text: 'pencil' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (pencil). Chair, desk, and bed are all furniture; a pencil is a writing tool. Tests functional categorization.',
  },
  {
    id: 'en-005',
    order_index: 5,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Doctor : Hospital = Teacher : ?',
    options: [
      { id: 'A', text: 'Student' },
      { id: 'B', text: 'School' },
      { id: 'C', text: 'Textbook' },
      { id: 'D', text: 'Lesson' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (School). The pattern is profession → workplace. A, C, and D are elements within a school, but they are not the workplace itself.',
  },
  {
    id: 'en-006',
    order_index: 6,
    category: 'verbal',
    difficulty: 3,
    locale: 'en',
    question_text: 'Foot : Sock = Hand : ?',
    options: [
      { id: 'A', text: 'shoe' },
      { id: 'B', text: 'glove' },
      { id: 'C', text: 'hat' },
      { id: 'D', text: 'watch' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (glove). The relation is body part → clothing that covers it. A covers the foot, C covers the head, D is an accessory — none match.',
  },
  {
    id: 'en-007',
    order_index: 7,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which word has a meaning different from the others?',
    options: [
      { id: 'A', text: 'enormous' },
      { id: 'B', text: 'vast' },
      { id: 'C', text: 'tiny' },
      { id: 'D', text: 'massive' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (tiny). A, B, and D all mean "very large"; only "tiny" carries the opposite meaning.',
  },
  {
    id: 'en-008',
    order_index: 8,
    category: 'verbal',
    difficulty: 4,
    locale: 'en',
    question_text: 'Pen : Writing = Brush : ?',
    options: [
      { id: 'A', text: 'paper' },
      { id: 'B', text: 'ink' },
      { id: 'C', text: 'painting' },
      { id: 'D', text: 'palette' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (painting). The relation is tool → output. A, B, and D are materials/tools used with a brush, not the resulting creative output.',
  },

  // ───── Numerical (8) ─────
  {
    id: 'en-009',
    order_index: 9,
    category: 'numerical',
    difficulty: 1,
    locale: 'en',
    question_text: 'What number comes next?  2, 4, 6, 8, ?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '10' },
      { id: 'C', text: '12' },
      { id: 'D', text: '14' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (10). Arithmetic progression with common difference 2. 8 + 2 = 10. Tests the most basic sequence-pattern recognition.',
  },
  {
    id: 'en-010',
    order_index: 10,
    category: 'numerical',
    difficulty: 2,
    locale: 'en',
    question_text: 'What number comes next?  3, 6, 12, 24, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '48' },
      { id: 'D', text: '60' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (48). Geometric progression with ratio 2 (each term doubles). 24 × 2 = 48. A (+12) is the trap of mistaking it for arithmetic.',
  },
  {
    id: 'en-011',
    order_index: 11,
    category: 'numerical',
    difficulty: 2,
    locale: 'en',
    question_text: 'If 3 apples cost $1.20, how much do 5 apples cost?',
    options: [
      { id: 'A', text: '$1.80' },
      { id: 'B', text: '$2.00' },
      { id: 'C', text: '$2.40' },
      { id: 'D', text: '$3.00' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B ($2.00). Unit price is $0.40 → 5 × $0.40 = $2.00. Tests proportional reasoning and unit conversion.',
  },
  {
    id: 'en-012',
    order_index: 12,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number comes next?  1, 1, 2, 3, 5, 8, ?',
    options: [
      { id: 'A', text: '11' },
      { id: 'B', text: '13' },
      { id: 'C', text: '15' },
      { id: 'D', text: '21' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (13). Fibonacci sequence — each term is the sum of the previous two. 5 + 8 = 13. Tests recognition of non-linear patterns.',
  },
  {
    id: 'en-013',
    order_index: 13,
    category: 'numerical',
    difficulty: 3,
    locale: 'en',
    question_text: 'What number is missing?  1, 4, 9, 16, ?, 36',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '24' },
      { id: 'C', text: '25' },
      { id: 'D', text: '32' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (25). Perfect squares: 1², 2², 3², 4², 5², 6². The fifth term is 5² = 25. Spotting "×self" rather than "+constant" is the key.',
  },
  {
    id: 'en-014',
    order_index: 14,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text: 'What number comes next?  2, 5, 11, 23, ?',
    options: [
      { id: 'A', text: '35' },
      { id: 'B', text: '41' },
      { id: 'C', text: '46' },
      { id: 'D', text: '47' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (47). Each term equals the previous one multiplied by 2 plus 1 (×2 +1). 23 × 2 + 1 = 47. Tests recognition of compound operations.',
  },
  {
    id: 'en-015',
    order_index: 15,
    category: 'numerical',
    difficulty: 4,
    locale: 'en',
    question_text: 'What is the average of 4, 7, and 11?',
    options: [
      { id: 'A', text: '7' },
      { id: 'B', text: '7.3' },
      { id: 'C', text: '7.5' },
      { id: 'D', text: '8' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (7.3). Sum 22 ÷ 3 ≈ 7.333. The trap is A (7), the median — averages are pulled by every value, not just the middle.',
  },
  {
    id: 'en-016',
    order_index: 16,
    category: 'numerical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'On a clock at exactly 3:00, what is the angle between the hour and minute hands?',
    options: [
      { id: 'A', text: '60°' },
      { id: 'B', text: '75°' },
      { id: 'C', text: '90°' },
      { id: 'D', text: '120°' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (90°). 360° / 12 hour marks = 30° per mark; 3 marks apart = 3 × 30° = 90°. Combines geometry with arithmetic.',
  },

  // ───── Spatial (7) ─────
  {
    id: 'en-017',
    order_index: 17,
    category: 'spatial',
    difficulty: 2,
    locale: 'en',
    figure_id: 'cube-net-cross',
    question_text:
      'The cross-shaped net below folds into a cube. How many pairs of opposite faces does the cube have?',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '3' },
      { id: 'C', text: '4' },
      { id: 'D', text: '6' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (3). A cube has 6 faces arranged in opposing pairs: 6 ÷ 2 = 3. Tests basic understanding of 3D solid properties.',
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
      'Answer: A. Rotating "F" 90° clockwise places its top on the right. B is 180°, C is 270°, D is a mirror image — different transformations.',
  },
  {
    id: 'en-019',
    order_index: 19,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    question_text:
      'On a die, 1 is opposite 6, 2 is opposite 5, and 3 is opposite 4. If 1, 2, and 3 are visible, what is the sum of the three hidden faces?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '12' },
      { id: 'C', text: '15' },
      { id: 'D', text: '18' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (15). Hidden faces are the opposites: 6 + 5 + 4 = 15. Shortcut: opposite faces always sum to 7, so 3 × 7 − (1+2+3) = 15.',
  },
  {
    id: 'en-020',
    order_index: 20,
    category: 'spatial',
    difficulty: 3,
    locale: 'en',
    figure_id: 'f-upright',
    question_text: 'Which figure shows the mirror image (left-right flip) of the letter below?',
    options: [
      { id: 'A', figure_id: 'f-mirror' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot90' },
      { id: 'D', figure_id: 'f-rot270' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A. A mirror image flips left-right only. B is a 180° rotation (flips both ways), C and D are rotations — none match a true mirror reflection.',
  },
  {
    id: 'en-021',
    order_index: 21,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    question_text:
      'A piece of paper is folded once horizontally and then once vertically. When unfolded, how many crease lines are there?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '3' },
      { id: 'D', text: '4' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (2). One horizontal crease + one vertical crease = 2 lines total. Tests the ability to mentally replay a sequence of folds.',
  },
  {
    id: 'en-022',
    order_index: 22,
    category: 'spatial',
    difficulty: 4,
    locale: 'en',
    figure_id: 'pyramid-3step',
    question_text:
      'The figure below is a 3-step pyramid built from 1 cm cubes. How many cubes are there in total?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '12' },
      { id: 'C', text: '14' },
      { id: 'D', text: '27' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (14). Step 1 (1²=1) + Step 2 (2²=4) + Step 3 (3²=9) = 14. D (27) is the trap of confusing this with a solid 3×3×3 cube.',
  },
  {
    id: 'en-023',
    order_index: 23,
    category: 'spatial',
    difficulty: 5,
    locale: 'en',
    figure_id: 'painted-cube',
    question_text:
      'A 3 cm cube is painted on all outer faces, then sliced into 1 cm cubes. How many small cubes have exactly three painted faces?',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '6' },
      { id: 'C', text: '8' },
      { id: 'D', text: '12' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (8). Only corner cubes are painted on three sides, and a cube has 8 corners. B (6) is the face count, D (12) is the edge count — both common traps.',
  },

  // ───── Logical (7) ─────
  {
    id: 'en-024',
    order_index: 24,
    category: 'logical',
    difficulty: 2,
    locale: 'en',
    question_text:
      'All students carry a backpack. Sam is a student. Therefore?',
    options: [
      { id: 'A', text: 'Sam carries a backpack.' },
      { id: 'B', text: 'Sam does not have a backpack.' },
      { id: 'C', text: 'Sam is not a student.' },
      { id: 'D', text: 'Cannot be determined.' },
    ],
    correct_id: 'A',
    explanation:
      'Answer: A. Classic syllogism (major + minor premise → conclusion). When both premises are true, the conclusion must follow — "cannot be determined" is wrong.',
  },
  {
    id: 'en-025',
    order_index: 25,
    category: 'logical',
    difficulty: 3,
    locale: 'en',
    question_text: 'If it rains, I use an umbrella. I am not using an umbrella. Therefore?',
    options: [
      { id: 'A', text: 'It is raining.' },
      { id: 'B', text: 'It is not raining.' },
      { id: 'C', text: 'It will rain soon.' },
      { id: 'D', text: 'Cannot be determined.' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B. Modus tollens: if "P → Q" is true, then "not Q → not P" is also true. Denying the consequent denies the antecedent.',
  },
  {
    id: 'en-026',
    order_index: 26,
    category: 'logical',
    difficulty: 3,
    locale: 'en',
    question_text:
      'A is taller than B. B is taller than C. C is taller than D. Who is the shortest?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D. By transitivity (A > B > C > D), D is shorter than everyone. Tests ordering and inequality composition.',
  },
  {
    id: 'en-027',
    order_index: 27,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text:
      'If yesterday was Tuesday, what day will the day after tomorrow be?',
    options: [
      { id: 'A', text: 'Thursday' },
      { id: 'B', text: 'Friday' },
      { id: 'C', text: 'Saturday' },
      { id: 'D', text: 'Sunday' },
    ],
    correct_id: 'B',
    explanation:
      'Answer: B (Friday). Yesterday Tue → today Wed → tomorrow Thu → day after = Fri. Requires careful placement on a time axis.',
  },
  {
    id: 'en-028',
    order_index: 28,
    category: 'logical',
    difficulty: 4,
    locale: 'en',
    question_text: 'Which one does NOT belong with the others?',
    options: [
      { id: 'A', text: 'Lion' },
      { id: 'B', text: 'Tiger' },
      { id: 'C', text: 'Leopard' },
      { id: 'D', text: 'Rabbit' },
    ],
    correct_id: 'D',
    explanation:
      'Answer: D (Rabbit). A, B, and C are all big cats (family Felidae); rabbit belongs to a different order (Lagomorpha). The classifier is family-level taxonomy, not just "animal".',
  },
  {
    id: 'en-029',
    order_index: 29,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'Five people stand in a line. A is in front of B. C is in front of A. D is in front of C. E is at the very back. Who is at the very front?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'C' },
      { id: 'C', text: 'D' },
      { id: 'D', text: 'E' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C (D). Composing the constraints yields D → C → A → B → E. Multiple conditions converge to a single unique ordering.',
  },
  {
    id: 'en-030',
    order_index: 30,
    category: 'logical',
    difficulty: 5,
    locale: 'en',
    question_text:
      'On an island, truth-tellers always tell the truth and liars always lie. You ask one person, "Are you a truth-teller?" The person says "Yes". What can you conclude?',
    options: [
      { id: 'A', text: 'They must be a truth-teller.' },
      { id: 'B', text: 'They must be a liar.' },
      { id: 'C', text: 'They could be either.' },
      { id: 'D', text: 'Cannot be determined.' },
    ],
    correct_id: 'C',
    explanation:
      'Answer: C. A truth-teller answers "Yes" honestly; a liar also answers "Yes" because they lie about being a liar. Both produce the same answer, so they are indistinguishable.',
  },
];
