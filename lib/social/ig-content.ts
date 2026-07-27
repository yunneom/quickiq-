import { dummyEnQuestions } from '@/lib/questions/dummy-en';
import { extraEnQuestions } from '@/lib/questions/extra-en';
import type { Question } from '@/lib/questions/types';

/**
 * Content plan for the global (English) Instagram account.
 *
 * Two post families, mixed by the daily rotation:
 *
 *  1. BAIT posts — hand-crafted comment-bait in the three formats that
 *     dominate viral quiz reels: trick-logic puzzles ("which car arrived
 *     first?"), spelling traps ("which spelling is correct?"), and
 *     "99% fail" math/sequence checks. These exist to farm comments and
 *     shares; every caption funnels to the IQ test in bio.
 *  2. QUESTION posts — real items from the EN test pool, which double as
 *     a product preview. Only text-based questions are eligible (spatial
 *     items reference figure assets the card renderer can't draw).
 *
 * Rotation is 2 bait : 1 question per 3-day cycle — bait is the growth
 * engine, the pool question keeps the account honest about the product.
 */

export type CardTheme = 'blue' | 'orange' | 'green' | 'purple';

export interface IgCardOption {
  id: string;
  text: string;
}

/** Everything the edge card renderer needs — no question-pool coupling. */
export interface IgCard {
  /** Top-left category tag, e.g. "SPELLING TEST". */
  label: string;
  /** Provocative pill above the prompt, e.g. "99% FAIL THIS" (optional). */
  badge: string | null;
  prompt: string;
  options: IgCardOption[];
  theme: CardTheme;
  /** Bottom CTA pill text. */
  footer: string;
}

export interface IgPostPlan {
  /** Stable id used for dedup in the ig_posts ledger. */
  key: string;
  card: IgCard;
  caption: string;
}

/** Questions that render correctly as a standalone card. */
export function eligibleQuestions(): Question[] {
  return [...dummyEnQuestions, ...extraEnQuestions].filter(
    (q) => !q.figure_id && !q.question_image_url && q.category !== 'spatial',
  );
}

// ---------------------------------------------------------------------------
// Bait pool — hand-written, modeled on the highest-performing viral formats.
// Keep prompts self-contained (the card is the whole post) and keep answers
// OUT of the caption: the comment section is the engagement engine.
// ---------------------------------------------------------------------------

type BaitKind = 'trick' | 'spelling' | 'math';

interface BaitPost {
  /** Stable id — part of the ledger key, never reuse or rename. */
  id: string;
  kind: BaitKind;
  hook: string;
  badge: string | null;
  prompt: string;
  options: IgCardOption[];
}

const BAIT_POSTS: BaitPost[] = [
  // -- trick logic ----------------------------------------------------------
  {
    id: 'trick-cars',
    kind: 'trick',
    hook: 'Everyone answers this too fast 🚨',
    badge: 'MOST PEOPLE GET IT WRONG',
    prompt: '3 cars leave the same city at the same time. Which one arrives first?',
    options: [
      { id: 'A', text: '40 km/h · drives 100 km' },
      { id: 'B', text: '60 km/h · drives 200 km' },
      { id: 'C', text: '80 km/h · drives 350 km' },
    ],
  },
  {
    id: 'trick-sheep',
    kind: 'trick',
    hook: 'Read it twice before you answer 👀',
    badge: null,
    prompt: 'A farmer has 17 sheep. All but 9 run away. How many are left?',
    options: [
      { id: 'A', text: '8' },
      { id: 'B', text: '9' },
      { id: 'C', text: '17' },
      { id: 'D', text: '0' },
    ],
  },
  {
    id: 'trick-race',
    kind: 'trick',
    hook: '90% fall for this one.',
    badge: null,
    prompt: 'In a race, you overtake the runner in 2nd place. What place are you in now?',
    options: [
      { id: 'A', text: '1st' },
      { id: 'B', text: '2nd' },
      { id: 'C', text: '3rd' },
    ],
  },
  {
    id: 'trick-cats',
    kind: 'trick',
    hook: 'Simple numbers. Sneaky logic.',
    badge: 'THINK BEFORE YOU SCROLL',
    prompt: '3 cats catch 3 mice in 3 minutes. How many cats catch 100 mice in 100 minutes?',
    options: [
      { id: 'A', text: '3 cats' },
      { id: 'B', text: '100 cats' },
      { id: 'C', text: '33 cats' },
      { id: 'D', text: '9 cats' },
    ],
  },
  {
    id: 'trick-months',
    kind: 'trick',
    hook: 'This one starts arguments 👇',
    badge: null,
    prompt: 'Some months have 31 days, some have 30. How many months have 28 days?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '2' },
      { id: 'C', text: '6' },
      { id: 'D', text: '12' },
    ],
  },
  {
    id: 'trick-pills',
    kind: 'trick',
    hook: 'Doctors get this wrong too 💊',
    badge: null,
    prompt:
      'A doctor gives you 3 pills and says take one every 30 minutes. How long until the pills are gone?',
    options: [
      { id: 'A', text: '90 minutes' },
      { id: 'B', text: '60 minutes' },
      { id: 'C', text: '120 minutes' },
    ],
  },
  {
    id: 'trick-batball',
    kind: 'trick',
    hook: 'The most failed question in psychology 🧠',
    badge: '50% OF HARVARD GOT IT WRONG',
    prompt:
      'A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much is the ball?',
    options: [
      { id: 'A', text: '10 cents' },
      { id: 'B', text: '5 cents' },
      { id: 'C', text: '15 cents' },
      { id: 'D', text: '1 cent' },
    ],
  },
  {
    id: 'trick-lily',
    kind: 'trick',
    hook: 'Your gut answer is wrong. Probably.',
    badge: null,
    prompt:
      'Lily pads on a lake double every day. They cover the whole lake on day 48. On which day was HALF the lake covered?',
    options: [
      { id: 'A', text: 'Day 24' },
      { id: 'B', text: 'Day 47' },
      { id: 'C', text: 'Day 46' },
      { id: 'D', text: 'Day 12' },
    ],
  },
  {
    id: 'trick-machines',
    kind: 'trick',
    hook: 'Solve it in 5 seconds. Go.',
    badge: null,
    prompt:
      '5 machines make 5 widgets in 5 minutes. How long do 100 machines take to make 100 widgets?',
    options: [
      { id: 'A', text: '100 minutes' },
      { id: 'B', text: '5 minutes' },
      { id: 'C', text: '20 minutes' },
      { id: 'D', text: '1 minute' },
    ],
  },

  // -- spelling traps -------------------------------------------------------
  {
    id: 'spell-government',
    kind: 'spelling',
    hook: 'If you spot it instantly, your English is elite ✍️',
    badge: 'ONLY 1 IS CORRECT',
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Goverment' },
      { id: 'B', text: 'Government' },
      { id: 'C', text: 'Governnment' },
      { id: 'D', text: 'Governmant' },
    ],
  },
  {
    id: 'spell-definitely',
    kind: 'spelling',
    hook: 'The most misspelled word on the internet 📱',
    badge: null,
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Definately' },
      { id: 'B', text: 'Definitley' },
      { id: 'C', text: 'Definitely' },
      { id: 'D', text: 'Definetely' },
    ],
  },
  {
    id: 'spell-accommodate',
    kind: 'spelling',
    hook: 'Double letters are a trap 🪤',
    badge: 'ONLY 1 IS CORRECT',
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Acommodate' },
      { id: 'B', text: 'Accomodate' },
      { id: 'C', text: 'Accommodate' },
      { id: 'D', text: 'Acomodate' },
    ],
  },
  {
    id: 'spell-embarrassed',
    kind: 'spelling',
    hook: "Don't be embarrassed if you miss it 😅",
    badge: null,
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Embarassed' },
      { id: 'B', text: 'Embarrassed' },
      { id: 'C', text: 'Embarased' },
      { id: 'D', text: 'Emberrassed' },
    ],
  },
  {
    id: 'spell-necessary',
    kind: 'spelling',
    hook: 'One collar, two sleeves. Or was it the other way?',
    badge: null,
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Neccessary' },
      { id: 'B', text: 'Necesary' },
      { id: 'C', text: 'Necessary' },
      { id: 'D', text: 'Neccesary' },
    ],
  },
  {
    id: 'spell-receive',
    kind: 'spelling',
    hook: 'I before E… except when it lies to you.',
    badge: null,
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Recieve' },
      { id: 'B', text: 'Receive' },
      { id: 'C', text: 'Receeve' },
      { id: 'D', text: 'Riceive' },
    ],
  },
  {
    id: 'spell-separate',
    kind: 'spelling',
    hook: 'This word fools even native speakers 🇺🇸',
    badge: 'ONLY 1 IS CORRECT',
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Seperate' },
      { id: 'B', text: 'Separate' },
      { id: 'C', text: 'Seperete' },
      { id: 'D', text: 'Saparate' },
    ],
  },
  {
    id: 'spell-occurrence',
    kind: 'spelling',
    hook: 'A rare occurrence: getting this right first try.',
    badge: null,
    prompt: 'Which spelling is correct?',
    options: [
      { id: 'A', text: 'Occurence' },
      { id: 'B', text: 'Occurrence' },
      { id: 'C', text: 'Ocurrence' },
      { id: 'D', text: 'Occurrance' },
    ],
  },

  // -- "99% fail" math & sequences ------------------------------------------
  {
    id: 'math-8div',
    kind: 'math',
    hook: 'This equation broke the internet. Twice.',
    badge: 'THE INTERNET IS STILL FIGHTING',
    prompt: '8 ÷ 2(2+2) = ?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '16' },
      { id: 'C', text: '4' },
      { id: 'D', text: '8' },
    ],
  },
  {
    id: 'math-pattern-sum',
    kind: 'math',
    hook: '99% of people failed this test 😳',
    badge: '99% FAIL THIS',
    prompt: 'If 2 + 3 = 10, 7 + 2 = 63, and 6 + 5 = 66, then 8 + 4 = ?',
    options: [
      { id: 'A', text: '96' },
      { id: 'B', text: '32' },
      { id: 'C', text: '12' },
      { id: 'D', text: '48' },
    ],
  },
  {
    id: 'math-order',
    kind: 'math',
    hook: 'Remember PEMDAS? Prove it.',
    badge: null,
    prompt: '6 − 1 × 0 + 2 ÷ 2 = ?',
    options: [
      { id: 'A', text: '7' },
      { id: 'B', text: '1' },
      { id: 'C', text: '5' },
      { id: 'D', text: '3.5' },
    ],
  },
  {
    id: 'math-seq-double',
    kind: 'math',
    hook: 'Spot the pattern in 10 seconds ⏱️',
    badge: 'TOP 10% ONLY',
    prompt: 'What comes next? 2, 3, 5, 9, 17, …',
    options: [
      { id: 'A', text: '26' },
      { id: 'B', text: '33' },
      { id: 'C', text: '31' },
      { id: 'D', text: '34' },
    ],
  },
  {
    id: 'math-seq-multiply',
    kind: 'math',
    hook: 'If you see it, your brain works differently.',
    badge: null,
    prompt: 'What comes next? 3, 6, 18, 72, …',
    options: [
      { id: 'A', text: '360' },
      { id: 'B', text: '288' },
      { id: 'C', text: '144' },
      { id: 'D', text: '216' },
    ],
  },
  {
    id: 'math-half',
    kind: 'math',
    hook: 'Sounds easy. Isn’t.',
    badge: null,
    prompt: 'Divide 30 by ½, then add 10. What do you get?',
    options: [
      { id: 'A', text: '25' },
      { id: 'B', text: '70' },
      { id: 'C', text: '40' },
      { id: 'D', text: '55' },
    ],
  },
  {
    id: 'math-subtract',
    kind: 'math',
    hook: 'A kindergarten question adults keep failing.',
    badge: null,
    prompt: 'How many times can you subtract 5 from 25?',
    options: [
      { id: 'A', text: '5 times' },
      { id: 'B', text: 'Once' },
      { id: 'C', text: '4 times' },
      { id: 'D', text: 'Forever' },
    ],
  },
  {
    id: 'math-look-say',
    kind: 'math',
    hook: 'Only 1% see the pattern 🔍',
    badge: 'ONLY 1% SEE IT',
    prompt: 'What comes next? 1, 11, 21, 1211, 111221, …',
    options: [
      { id: 'A', text: '312211' },
      { id: 'B', text: '122111' },
      { id: 'C', text: '311221' },
      { id: 'D', text: '132211' },
    ],
  },
];

const BAIT_LABEL: Record<BaitKind, string> = {
  trick: 'LOGIC CHECK',
  spelling: 'SPELLING TEST',
  math: 'IQ CHECK',
};

const BAIT_THEME: Record<BaitKind, CardTheme> = {
  trick: 'orange',
  spelling: 'green',
  math: 'purple',
};

// ---------------------------------------------------------------------------
// Captions — every post, bait or pool, promotes the IQ test. The bait CTA
// pushes comments first (engagement signal), then the bio link.
// ---------------------------------------------------------------------------

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

const KIND_TAG: Record<BaitKind, string> = {
  trick: '#trickquestion',
  spelling: '#spellingtest',
  math: '#mathpuzzle',
};

const CATEGORY_TAG: Record<string, string> = {
  verbal: '#verbalreasoning',
  numerical: '#mathpuzzle',
  logical: '#logicpuzzle',
  spatial: '#spatialreasoning',
};

/** The promo block appended to EVERY caption — the account exists to sell the test. */
const PROMO_LINES = [
  '🧠 Think you’re smarter than 90% of people? Prove it:',
  'Free 30-question IQ test → link in bio',
  'No sign-up · 7 minutes · instant score',
];

function tagsFor(extra: string[]): string {
  return [...HASHTAGS, ...extra, '#quickiq'].join(' ');
}

function baitCaption(b: BaitPost): string {
  return [
    b.hook,
    '',
    b.prompt,
    '',
    ...b.options.map((o) => `${o.id}. ${o.text}`),
    '',
    'Drop your answer in the comments 👇 No cheating.',
    '',
    ...PROMO_LINES,
    '',
    tagsFor([KIND_TAG[b.kind]]),
  ].join('\n');
}

function questionCaption(q: Question, hook: string): string {
  return [
    hook,
    '',
    q.question_text,
    '',
    ...q.options.map((o) => `${o.id}. ${o.text ?? ''}`),
    '',
    'This is a REAL question from our IQ test. Comment your answer 👇',
    '',
    ...PROMO_LINES,
    '',
    tagsFor([CATEGORY_TAG[q.category] ?? '#brainteaser']),
  ].join('\n');
}

function baitPlan(b: BaitPost): IgPostPlan {
  return {
    key: `bait-${b.id}`,
    card: {
      label: BAIT_LABEL[b.kind],
      badge: b.badge,
      prompt: b.prompt,
      options: b.options,
      theme: BAIT_THEME[b.kind],
      // No emoji here — the edge image renderer has no emoji font.
      footer: 'Comment your answer · Full IQ test in bio',
    },
    caption: baitCaption(b),
  };
}

function questionPlan(q: Question, hook: string): IgPostPlan {
  const label =
    q.category === 'verbal'
      ? 'VERBAL REASONING'
      : q.category === 'numerical'
        ? 'NUMERICAL REASONING'
        : 'LOGICAL REASONING';
  return {
    key: `q-${q.id}`,
    card: {
      label,
      badge: 'REAL TEST QUESTION',
      prompt: q.question_text,
      options: q.options.map((o) => ({ id: o.id, text: o.text ?? '' })),
      theme: 'blue',
      footer: 'Answer in bio → 30-question IQ test',
    },
    caption: questionCaption(q, hook),
  };
}

/**
 * Deterministic rotation: the same day always yields the same post, so a
 * retried cron run republishes nothing new and the ledger stays clean.
 * `dayIndex` is days since epoch (UTC).
 *
 * 3-day cycle: [bait, bait, question]. Bait posts drive reach; the real
 * question keeps the product visible.
 */
export function planForDay(dayIndex: number): IgPostPlan | null {
  const slot = dayIndex % 3;

  if (slot === 2) {
    const pool = eligibleQuestions();
    if (pool.length === 0) return null;
    const ordinal = Math.floor(dayIndex / 3);
    return questionPlan(
      pool[ordinal % pool.length],
      HOOKS[ordinal % HOOKS.length],
    );
  }

  if (BAIT_POSTS.length === 0) return null;
  const baitOrdinal = Math.floor(dayIndex / 3) * 2 + slot;
  return baitPlan(BAIT_POSTS[baitOrdinal % BAIT_POSTS.length]);
}

/** Days since Unix epoch in UTC — the rotation cursor. */
export function utcDayIndex(now = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}
