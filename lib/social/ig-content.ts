import { dummyEnQuestions } from '@/lib/questions/dummy-en';
import { extraEnQuestions } from '@/lib/questions/extra-en';
import type { Question } from '@/lib/questions/types';
import type { Scene } from './quiz-scene';

/**
 * Content plan for the global (English) Instagram account.
 *
 * Two post families, mixed by the daily rotation:
 *
 *  1. BAIT posts — hand-crafted comment-bait: speed/distance races, work
 *     rates, percentage traps, number sequences, spelling traps. Most
 *     carry a `scene`, an illustration generated from the question's own
 *     numbers (cars on a road, bars, number tiles), because a wall of
 *     text does not stop a scrolling thumb.
 *  2. QUESTION posts — real items from the EN test pool, which double as
 *     a product preview. Only text-based questions are eligible (spatial
 *     items reference figure assets the card renderer can't draw).
 *
 * Three posts go out per day: [bait, bait, real question].
 */

export type CardTheme = 'blue' | 'orange' | 'green' | 'purple';

/**
 * Per-theme gradient + the dark hex used for option-letter squares.
 * Shared by the square feed card and the 9:16 reel frames so both
 * renderers stay visually consistent.
 */
export const CARD_THEMES: Record<CardTheme, { bg: string; accent: string }> = {
  blue: { bg: 'linear-gradient(135deg, #2554e6 0%, #15308f 100%)', accent: '#15308f' },
  orange: { bg: 'linear-gradient(135deg, #ff7a18 0%, #d1204b 100%)', accent: '#b81c42' },
  green: { bg: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)', accent: '#065f46' },
  purple: { bg: 'linear-gradient(135deg, #7c3aed 0%, #3b1d8f 100%)', accent: '#3b1d8f' },
};

export interface IgCardOption {
  id: string;
  text: string;
}

/** Everything the renderers need — no question-pool coupling. */
export interface IgCard {
  /** Top-left category tag, e.g. "SPELLING TEST". */
  label: string;
  /** Provocative pill above the prompt, e.g. "99% FAIL THIS" (optional). */
  badge: string | null;
  prompt: string;
  options: IgCardOption[];
  /** Illustration drawn from the question's data (optional). */
  scene?: Scene;
  theme: CardTheme;
  /** Bottom CTA pill text. */
  footer: string;
}

export interface IgPostPlan {
  /** Stable id used for dedup in the ig_posts ledger. */
  key: string;
  card: IgCard;
  caption: string;
  /** Correct option id — used for the next-day answer reply, never posted with the puzzle. */
  answer?: string;
  explain?: string;
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
//
// `answer`/`explain` exist so the answer can be revealed the next day
// without re-deriving it by hand. They are never rendered on the card.
// ---------------------------------------------------------------------------

type BaitKind = 'speed' | 'rate' | 'percent' | 'sequence' | 'trick' | 'spelling';

interface BaitPost {
  /** Stable id — part of the ledger key, never reuse or rename. */
  id: string;
  kind: BaitKind;
  hook: string;
  badge: string | null;
  prompt: string;
  options: IgCardOption[];
  scene?: Scene;
  answer: string;
  explain: string;
}

/** Cars sitting on the start line — shows the setup without leaking the answer. */
const START = 0.04;

const BAIT_POSTS: BaitPost[] = [
  // -- speed / distance / time (road scenes) --------------------------------
  {
    id: 'trick-cars',
    kind: 'speed',
    hook: 'Everyone answers this too fast 🚨',
    badge: 'MOST PEOPLE GET IT WRONG',
    prompt: '3 cars leave the same city at the same time. Which one arrives first?',
    options: [
      { id: 'A', text: 'Car A' },
      { id: 'B', text: 'Car B' },
      { id: 'C', text: 'Car C' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: '40 km/h · 100 km', progress: START },
        { caption: '60 km/h · 200 km', progress: START },
        { caption: '80 km/h · 350 km', progress: START },
      ],
    },
    answer: 'A',
    explain: 'A takes 2h30, B takes 3h20, C takes 4h23. Fastest ≠ first.',
  },
  {
    id: 'speed-catchup',
    kind: 'speed',
    hook: 'Bus vs car. Most people guess 10:00 👀',
    badge: null,
    prompt:
      'A bus left at 8:00 doing 50 km/h. A car left at 9:00 doing 75 km/h on the same road. When does the car catch it?',
    options: [
      { id: 'A', text: '10:00' },
      { id: 'B', text: '11:00' },
      { id: 'C', text: '12:00' },
      { id: 'D', text: 'Never' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: 'Bus · 50 km/h · left 8:00', progress: 0.34 },
        { caption: 'Car · 75 km/h · left 9:00', progress: START },
      ],
    },
    answer: 'B',
    explain: 'At 9:00 the bus is 50 km ahead; the gap closes at 25 km/h → 2 hours → 11:00.',
  },
  {
    id: 'speed-average',
    kind: 'speed',
    hook: 'The answer is NOT 45. Prove me wrong 👇',
    badge: '90% SAY 45',
    prompt:
      'You drive 60 km at 30 km/h, then another 60 km at 60 km/h. What is your average speed?',
    options: [
      { id: 'A', text: '45 km/h' },
      { id: 'B', text: '40 km/h' },
      { id: 'C', text: '50 km/h' },
      { id: 'D', text: '90 km/h' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: 'First 60 km · 30 km/h · 2 h', progress: 0.45 },
        { caption: 'Next 60 km · 60 km/h · 1 h', progress: 0.45 },
      ],
    },
    answer: 'B',
    explain: '120 km in 3 hours = 40 km/h. You spend more time at the slow speed.',
  },
  {
    id: 'speed-roundtrip',
    kind: 'speed',
    hook: 'Same road, two speeds. Average is not 50 🤯',
    badge: null,
    prompt:
      'You drive to work at 40 km/h and drive home on the same road at 60 km/h. Average speed for the whole trip?',
    options: [
      { id: 'A', text: '50 km/h' },
      { id: 'B', text: '48 km/h' },
      { id: 'C', text: '52 km/h' },
      { id: 'D', text: '45 km/h' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: 'To work · 40 km/h', progress: START },
        { caption: 'Back home · 60 km/h', progress: START },
      ],
    },
    answer: 'B',
    explain: 'Harmonic mean: 2×40×60 ÷ 100 = 48 km/h. The slow leg lasts longer.',
  },
  {
    id: 'speed-meet',
    kind: 'speed',
    hook: 'Head-on. How long? ⏱️',
    badge: null,
    prompt:
      'Two cars start 300 km apart and drive toward each other at 60 km/h and 40 km/h. How long until they meet?',
    options: [
      { id: 'A', text: '2 h 30' },
      { id: 'B', text: '3 h' },
      { id: 'C', text: '5 h' },
      { id: 'D', text: '6 h' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: '60 km/h →', progress: START },
        { caption: '← 40 km/h', progress: 0.88 },
      ],
    },
    answer: 'B',
    explain: 'They close the gap at 100 km/h → 300 ÷ 100 = 3 hours.',
  },
  {
    id: 'speed-trains',
    kind: 'speed',
    hook: 'Two trains. One answer. Go 🚄',
    badge: null,
    prompt:
      'Two trains are 400 km apart, heading toward each other at 120 km/h and 80 km/h. When do they meet?',
    options: [
      { id: 'A', text: 'After 2 h' },
      { id: 'B', text: 'After 2 h 30' },
      { id: 'C', text: 'After 3 h 20' },
      { id: 'D', text: 'After 4 h' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: '120 km/h →', progress: START, vehicle: 'train' },
        { caption: '← 80 km/h', progress: 0.88, vehicle: 'train' },
      ],
    },
    answer: 'A',
    explain: 'Closing speed 200 km/h → 400 ÷ 200 = 2 hours.',
  },
  {
    id: 'speed-bridge',
    kind: 'speed',
    hook: 'Careful — the train has a length 🚆',
    badge: 'ALMOST EVERYONE FORGETS THIS',
    prompt:
      'A 200 m long train travels at 20 m/s. How long does it take to completely cross a 300 m bridge?',
    options: [
      { id: 'A', text: '15 s' },
      { id: 'B', text: '25 s' },
      { id: 'C', text: '10 s' },
      { id: 'D', text: '30 s' },
    ],
    // Lane lengths are to scale (200 m vs 300 m) so the "the tail still
    // has to clear it" trap is visible, not just stated.
    scene: {
      kind: 'road',
      lanes: [
        {
          caption: 'Train 200 m · 20 m/s',
          progress: START,
          length: 0.67,
          vehicle: 'train',
        },
        { caption: 'Bridge 300 m', progress: 0.5, length: 1, vehicle: 'train' },
      ],
    },
    answer: 'B',
    explain: 'The tail must clear it too: (300 + 200) ÷ 20 = 25 s.',
  },
  {
    id: 'speed-chase',
    kind: 'speed',
    hook: 'Cyclist vs runner. Who is patient enough to solve it?',
    badge: null,
    prompt:
      'A runner is 5 km ahead, going 10 km/h. A cyclist chases at 15 km/h. How long to catch up?',
    options: [
      { id: 'A', text: '30 min' },
      { id: 'B', text: '1 h' },
      { id: 'C', text: '1 h 30' },
      { id: 'D', text: '2 h' },
    ],
    scene: {
      kind: 'road',
      lanes: [
        { caption: 'Runner · 10 km/h · 5 km ahead', progress: 0.42 },
        { caption: 'Cyclist · 15 km/h', progress: START },
      ],
    },
    answer: 'B',
    explain: 'Gap closes at 5 km/h → 5 ÷ 5 = 1 hour.',
  },
  {
    id: 'speed-convert',
    kind: 'speed',
    hook: '5 seconds. No calculator ⏱️',
    badge: null,
    prompt: '72 km/h is how many metres per second?',
    options: [
      { id: 'A', text: '20 m/s' },
      { id: 'B', text: '25 m/s' },
      { id: 'C', text: '12 m/s' },
      { id: 'D', text: '7.2 m/s' },
    ],
    scene: {
      kind: 'road',
      lanes: [{ caption: '72 km/h · how many m/s?', progress: 0.45 }],
    },
    answer: 'A',
    explain: '72 × 1000 ÷ 3600 = 20 m/s. Divide km/h by 3.6.',
  },
  {
    id: 'speed-minutes',
    kind: 'speed',
    hook: 'Quick one. Don’t overthink it.',
    badge: null,
    prompt: 'A car covers 30 km at a steady 90 km/h. How many minutes does that take?',
    options: [
      { id: 'A', text: '30 min' },
      { id: 'B', text: '20 min' },
      { id: 'C', text: '15 min' },
      { id: 'D', text: '45 min' },
    ],
    scene: {
      kind: 'road',
      lanes: [{ caption: '90 km/h · 30 km', progress: START }],
    },
    answer: 'B',
    explain: '30 ÷ 90 h = ⅓ h = 20 minutes.',
  },
  {
    id: 'trick-snail',
    kind: 'speed',
    hook: 'The snail question that ruins friendships 🐌',
    badge: '99% SAY DAY 10',
    prompt:
      'A snail climbs 3 m up a 10 m well each day and slips 2 m back each night. On which day does it get out?',
    options: [
      { id: 'A', text: 'Day 10' },
      { id: 'B', text: 'Day 8' },
      { id: 'C', text: 'Day 9' },
      { id: 'D', text: 'Never' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Day climbs +3 m', fill: 0.3 },
        { caption: 'Night slips −2 m', fill: 0.2 },
        { caption: 'Well depth 10 m', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'Net +1 m/day, but on day 8 it starts at 7 m and climbs 3 → out before nightfall.',
  },

  // -- work & rate ----------------------------------------------------------
  {
    id: 'rate-machines',
    kind: 'rate',
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
    scene: {
      kind: 'bars',
      items: [
        { caption: '5 machines → 5 widgets → 5 min', fill: 0.25 },
        { caption: '100 machines → 100 widgets → ?', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'Each machine makes 1 widget in 5 min, so 100 machines still need only 5 min.',
  },
  {
    id: 'rate-painters',
    kind: 'rate',
    hook: 'Double the workers. Halve the days?',
    badge: null,
    prompt: '3 painters paint a house in 6 days. How long would 6 painters take?',
    options: [
      { id: 'A', text: '3 days' },
      { id: 'B', text: '12 days' },
      { id: 'C', text: '6 days' },
      { id: 'D', text: '2 days' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '3 painters → 6 days', fill: 1 },
        { caption: '6 painters → ?', fill: 0.5 },
      ],
    },
    answer: 'A',
    explain: 'The job is 18 painter-days; 18 ÷ 6 = 3 days.',
  },
  {
    id: 'rate-taps',
    kind: 'rate',
    hook: 'Both taps open. How fast? 🚰',
    badge: null,
    prompt:
      'Tap A fills a tank in 4 hours. Tap B fills it in 6 hours. How long with both taps open?',
    options: [
      { id: 'A', text: '5 hours' },
      { id: 'B', text: '2 h 24 min' },
      { id: 'C', text: '2 h 30 min' },
      { id: 'D', text: '10 hours' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Tap A · full in 4 h', fill: 0.66 },
        { caption: 'Tap B · full in 6 h', fill: 0.44 },
      ],
    },
    answer: 'B',
    explain: 'Rates add: ¼ + ⅙ = 5/12 per hour → 12/5 h = 2 h 24 min.',
  },
  {
    id: 'rate-hens',
    kind: 'rate',
    hook: 'Hens, eggs, days. Only one is a trap 🥚',
    badge: null,
    prompt: 'If 6 hens lay 6 eggs in 6 days, how many days do 12 hens need to lay 12 eggs?',
    options: [
      { id: 'A', text: '3 days' },
      { id: 'B', text: '6 days' },
      { id: 'C', text: '12 days' },
      { id: 'D', text: '1 day' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '6 hens → 6 eggs → 6 days', fill: 0.5 },
        { caption: '12 hens → 12 eggs → ?', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'Each hen lays 1 egg per 6 days. Doubling both sides changes nothing.',
  },
  {
    id: 'rate-diggers',
    kind: 'rate',
    hook: 'Basic maths. Comment before you scroll 👇',
    badge: null,
    prompt: '4 workers dig a trench in 12 hours. How long would 6 workers need?',
    options: [
      { id: 'A', text: '8 hours' },
      { id: 'B', text: '9 hours' },
      { id: 'C', text: '6 hours' },
      { id: 'D', text: '18 hours' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '4 workers → 12 h', fill: 1 },
        { caption: '6 workers → ?', fill: 0.66 },
      ],
    },
    answer: 'A',
    explain: '48 worker-hours ÷ 6 workers = 8 hours.',
  },
  {
    id: 'trick-cats',
    kind: 'rate',
    hook: 'Simple numbers. Sneaky logic.',
    badge: 'THINK BEFORE YOU SCROLL',
    prompt: '3 cats catch 3 mice in 3 minutes. How many cats catch 100 mice in 100 minutes?',
    options: [
      { id: 'A', text: '3 cats' },
      { id: 'B', text: '100 cats' },
      { id: 'C', text: '33 cats' },
      { id: 'D', text: '9 cats' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '3 cats → 3 mice → 3 min', fill: 0.2 },
        { caption: '? cats → 100 mice → 100 min', fill: 1 },
      ],
    },
    answer: 'A',
    explain: 'One cat catches 1 mouse per 3 min → 3 cats catch 100 mice in 100 min.',
  },

  // -- percentages & money --------------------------------------------------
  {
    id: 'pct-double-discount',
    kind: 'percent',
    hook: 'Shops love people who get this wrong 🛍️',
    badge: 'NOT 30%',
    prompt: 'A $100 jacket is 50% off, then 20% off at the register. What do you pay?',
    options: [
      { id: 'A', text: '$30' },
      { id: 'B', text: '$40' },
      { id: 'C', text: '$35' },
      { id: 'D', text: '$45' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Original $100', fill: 1 },
        { caption: 'After 50% off', fill: 0.5 },
        { caption: 'After 20% more off', fill: 0.4 },
      ],
    },
    answer: 'B',
    explain: '100 × 0.5 × 0.8 = 40. Discounts multiply, they do not add.',
  },
  {
    id: 'pct-up-down',
    kind: 'percent',
    hook: 'Up 10%, down 10%. Back to even?',
    badge: null,
    prompt: 'A $100 stock rises 10%, then falls 10%. What is it worth now?',
    options: [
      { id: 'A', text: '$100' },
      { id: 'B', text: '$99' },
      { id: 'C', text: '$101' },
      { id: 'D', text: '$98' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Start $100', fill: 0.9 },
        { caption: '+10% → $110', fill: 1 },
        { caption: '−10% → ?', fill: 0.89 },
      ],
    },
    answer: 'B',
    explain: '110 × 0.9 = 99. The 10% drop is taken off a bigger number.',
  },
  {
    id: 'pct-reverse',
    kind: 'percent',
    hook: 'Reverse the discount. $24 is the trap 🪤',
    badge: null,
    prompt: 'A shirt costs $20 after a 20% discount. What was the original price?',
    options: [
      { id: 'A', text: '$24' },
      { id: 'B', text: '$25' },
      { id: 'C', text: '$22' },
      { id: 'D', text: '$26' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Price paid $20 (after −20%)', fill: 0.8 },
        { caption: 'Original price ?', fill: 1 },
      ],
    },
    answer: 'B',
    explain: '$20 is 80% of the original → 20 ÷ 0.8 = $25.',
  },
  {
    id: 'pct-of-pct',
    kind: 'percent',
    hook: 'No calculator. 5 seconds.',
    badge: null,
    prompt: 'What is 20% of 50% of 200?',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '40' },
      { id: 'C', text: '10' },
      { id: 'D', text: '70' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Start 200', fill: 1 },
        { caption: '50% of it', fill: 0.5 },
        { caption: '20% of that = ?', fill: 0.1 },
      ],
    },
    answer: 'A',
    explain: '50% of 200 = 100, and 20% of 100 = 20.',
  },
  {
    id: 'pct-apples',
    kind: 'percent',
    hook: 'Shopping maths. Don’t embarrass yourself 🍎',
    badge: null,
    prompt: 'If 3 apples cost $1.50, how much do 7 apples cost?',
    options: [
      { id: 'A', text: '$3.00' },
      { id: 'B', text: '$3.50' },
      { id: 'C', text: '$4.20' },
      { id: 'D', text: '$2.80' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '3 apples = $1.50', fill: 0.43 },
        { caption: '7 apples = ?', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'One apple is $0.50 → 7 × 0.50 = $3.50.',
  },
  {
    id: 'pct-average',
    kind: 'percent',
    hook: 'Averages hide things. Find the missing number 🔍',
    badge: 'TOP 10% ONLY',
    prompt:
      'Five numbers average 10. Remove one and the remaining four average 12. Which number was removed?',
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '8' },
      { id: 'C', text: '10' },
      { id: 'D', text: '12' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '5 numbers · average 10', fill: 0.83 },
        { caption: '4 numbers left · average 12', fill: 1 },
      ],
    },
    answer: 'A',
    explain: 'Total was 50; the four left total 48 → the removed number is 2.',
  },
  {
    id: 'pct-book',
    kind: 'percent',
    hook: 'Reads like a riddle. It’s algebra 📚',
    badge: null,
    prompt: 'A book costs $10 plus half of its own price. How much is the book?',
    options: [
      { id: 'A', text: '$15' },
      { id: 'B', text: '$20' },
      { id: 'C', text: '$10' },
      { id: 'D', text: '$30' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: '$10 flat', fill: 0.5 },
        { caption: '+ half of its own price', fill: 0.5 },
        { caption: 'Total price = ?', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'p = 10 + p/2 → p/2 = 10 → p = $20.',
  },
  {
    id: 'pct-half-of',
    kind: 'percent',
    hook: 'Two steps. Most people do one.',
    badge: null,
    prompt: 'What is half of two-thirds of 90?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '45' },
      { id: 'C', text: '60' },
      { id: 'D', text: '15' },
    ],
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Start 90', fill: 1 },
        { caption: 'Two-thirds of it', fill: 0.66 },
        { caption: 'Half of that = ?', fill: 0.33 },
      ],
    },
    answer: 'A',
    explain: 'Two-thirds of 90 = 60; half of 60 = 30.',
  },

  // -- number sequences -----------------------------------------------------
  {
    id: 'seq-double-plus',
    kind: 'sequence',
    hook: 'Spot the pattern in 10 seconds ⏱️',
    badge: 'TOP 10% ONLY',
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '26' },
      { id: 'B', text: '33' },
      { id: 'C', text: '31' },
      { id: 'D', text: '34' },
    ],
    scene: { kind: 'sequence', items: ['2', '3', '5', '9', '17', '?'] },
    answer: 'B',
    explain: 'Each step doubles and subtracts 1: 17 × 2 − 1 = 33.',
  },
  {
    id: 'seq-multiply',
    kind: 'sequence',
    hook: 'If you see it, your brain works differently.',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '360' },
      { id: 'B', text: '288' },
      { id: 'C', text: '144' },
      { id: 'D', text: '216' },
    ],
    scene: { kind: 'sequence', items: ['3', '6', '18', '72', '?'] },
    answer: 'A',
    explain: 'Multipliers grow: ×2, ×3, ×4 → 72 × 5 = 360.',
  },
  {
    id: 'seq-squares',
    kind: 'sequence',
    hook: 'Easy… until you look twice.',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '30' },
      { id: 'B', text: '36' },
      { id: 'C', text: '35' },
      { id: 'D', text: '49' },
    ],
    scene: { kind: 'sequence', items: ['1', '4', '9', '16', '25', '?'] },
    answer: 'B',
    explain: 'Perfect squares: 6² = 36.',
  },
  {
    id: 'seq-oblong',
    kind: 'sequence',
    hook: 'Not squares. Look again 👀',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '35' },
      { id: 'B', text: '37' },
      { id: 'C', text: '36' },
      { id: 'D', text: '38' },
    ],
    scene: { kind: 'sequence', items: ['2', '5', '10', '17', '26', '?'] },
    answer: 'B',
    explain: 'Squares plus one: 1+1, 4+1, 9+1, 16+1, 25+1 → 36+1 = 37.',
  },
  {
    id: 'seq-fibonacci',
    kind: 'sequence',
    hook: 'Nature’s favourite sequence 🌻',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '11' },
      { id: 'B', text: '13' },
      { id: 'C', text: '16' },
      { id: 'D', text: '12' },
    ],
    scene: { kind: 'sequence', items: ['1', '1', '2', '3', '5', '8', '?'] },
    answer: 'B',
    explain: 'Each term is the sum of the two before it: 5 + 8 = 13.',
  },
  {
    id: 'seq-mersenne',
    kind: 'sequence',
    hook: 'Double it, then some. What’s next?',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '62' },
      { id: 'B', text: '63' },
      { id: 'C', text: '64' },
      { id: 'D', text: '65' },
    ],
    scene: { kind: 'sequence', items: ['3', '7', '15', '31', '?'] },
    answer: 'B',
    explain: 'Double and add 1: 31 × 2 + 1 = 63.',
  },
  {
    id: 'seq-thirds',
    kind: 'sequence',
    hook: 'Going down. How far? 📉',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '0' },
      { id: 'C', text: '2' },
      { id: 'D', text: '1.5' },
    ],
    scene: { kind: 'sequence', items: ['81', '27', '9', '3', '?'] },
    answer: 'A',
    explain: 'Divide by 3 each time: 3 ÷ 3 = 1.',
  },
  {
    id: 'seq-factorial',
    kind: 'sequence',
    hook: 'This one explodes fast 💥',
    badge: 'ONLY 1% SEE IT',
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '600' },
      { id: 'B', text: '720' },
      { id: 'C', text: '480' },
      { id: 'D', text: '840' },
    ],
    scene: { kind: 'sequence', items: ['1', '2', '6', '24', '120', '?'] },
    answer: 'B',
    explain: 'Factorials — multiply by the next counting number: 120 × 6 = 720.',
  },
  {
    id: 'seq-double-plus-one',
    kind: 'sequence',
    hook: 'Comment your answer before you scroll 👇',
    badge: null,
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '78' },
      { id: 'B', text: '79' },
      { id: 'C', text: '80' },
      { id: 'D', text: '77' },
    ],
    scene: { kind: 'sequence', items: ['4', '9', '19', '39', '?'] },
    answer: 'B',
    explain: 'Double and add 1: 39 × 2 + 1 = 79.',
  },
  {
    id: 'seq-look-say',
    kind: 'sequence',
    hook: 'Only 1% see the pattern 🔍',
    badge: 'ONLY 1% SEE IT',
    prompt: 'What comes next?',
    options: [
      { id: 'A', text: '312211' },
      { id: 'B', text: '122111' },
      { id: 'C', text: '311221' },
      { id: 'D', text: '132211' },
    ],
    scene: { kind: 'sequence', items: ['1', '11', '21', '1211', '111221', '?'] },
    answer: 'A',
    explain: 'Read the previous line aloud: "three 1s, two 2s, one 1" → 312211.',
  },

  // -- arithmetic traps -----------------------------------------------------
  {
    id: 'math-8div',
    kind: 'trick',
    hook: 'This equation broke the internet. Twice.',
    badge: 'THE INTERNET IS STILL FIGHTING',
    prompt: '8 ÷ 2(2+2) = ?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '16' },
      { id: 'C', text: '4' },
      { id: 'D', text: '8' },
    ],
    answer: 'B',
    explain: 'Left to right after the bracket: 8 ÷ 2 × 4 = 16.',
  },
  {
    id: 'math-pattern-sum',
    kind: 'trick',
    hook: '99% of people failed this test 😳',
    badge: '99% FAIL THIS',
    prompt: 'If 2 + 3 = 10, 7 + 2 = 63, and 6 + 5 = 66, then 8 + 4 = ?',
    options: [
      { id: 'A', text: '96' },
      { id: 'B', text: '32' },
      { id: 'C', text: '12' },
      { id: 'D', text: '48' },
    ],
    scene: {
      kind: 'sequence',
      items: ['10', '63', '66', '?'],
    },
    answer: 'A',
    explain: 'The rule is a × (a + b): 8 × 12 = 96.',
  },
  {
    id: 'math-order',
    kind: 'trick',
    hook: 'Remember PEMDAS? Prove it.',
    badge: null,
    prompt: '6 − 1 × 0 + 2 ÷ 2 = ?',
    options: [
      { id: 'A', text: '7' },
      { id: 'B', text: '1' },
      { id: 'C', text: '5' },
      { id: 'D', text: '3.5' },
    ],
    answer: 'A',
    explain: '6 − 0 + 1 = 7. Multiply and divide before adding.',
  },
  {
    id: 'math-ones',
    kind: 'trick',
    hook: 'Ten ones and one zero. What could go wrong?',
    badge: null,
    prompt: '1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 × 0 + 1 = ?',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '10' },
      { id: 'C', text: '11' },
      { id: 'D', text: '1' },
    ],
    answer: 'B',
    explain: 'Only the tenth 1 is multiplied by 0: nine 1s + 0 + 1 = 10.',
  },
  {
    id: 'math-half',
    kind: 'trick',
    hook: 'Sounds easy. Isn’t.',
    badge: null,
    prompt: 'Divide 30 by ½, then add 10. What do you get?',
    options: [
      { id: 'A', text: '25' },
      { id: 'B', text: '70' },
      { id: 'C', text: '40' },
      { id: 'D', text: '55' },
    ],
    answer: 'B',
    explain: 'Dividing by ½ doubles it: 60 + 10 = 70.',
  },
  {
    id: 'math-subtract',
    kind: 'trick',
    hook: 'A kindergarten question adults keep failing.',
    badge: null,
    prompt: 'How many times can you subtract 5 from 25?',
    options: [
      { id: 'A', text: '5 times' },
      { id: 'B', text: 'Once' },
      { id: 'C', text: '4 times' },
      { id: 'D', text: 'Forever' },
    ],
    answer: 'B',
    explain: 'After the first subtraction you are no longer subtracting from 25.',
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
    answer: 'B',
    explain: '5¢ ball + $1.05 bat = $1.10, and the gap is exactly $1.00.',
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
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Day 46', fill: 0.25 },
        { caption: 'Day 47', fill: 0.5 },
        { caption: 'Day 48 · lake full', fill: 1 },
      ],
    },
    answer: 'B',
    explain: 'Doubling backwards once: half the lake the day before it was full.',
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
    scene: {
      kind: 'bars',
      items: [
        { caption: 'Started with 17 sheep', fill: 1 },
        { caption: 'All but 9 ran away → ?', fill: 0.53 },
      ],
    },
    answer: 'B',
    explain: '"All but 9" means 9 stayed.',
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
    answer: 'B',
    explain: 'You took 2nd place — the leader is still ahead.',
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
    answer: 'D',
    explain: 'Every month contains a 28th day.',
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
    answer: 'B',
    explain: 'Take the first at 0 min: waits are only between pills — 30 + 30 = 60.',
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
    answer: 'B',
    explain: 'govern + ment — the N stays.',
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
    answer: 'C',
    explain: 'It hides the word "finite": de-finite-ly.',
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
    answer: 'C',
    explain: 'It accommodates two Cs and two Ms.',
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
    answer: 'B',
    explain: 'Two Rs and two Ss.',
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
    answer: 'C',
    explain: 'One C, two Ss — one collar, two sleeves.',
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
    answer: 'B',
    explain: 'I before E except after C.',
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
    answer: 'B',
    explain: 'There is "a rat" in sep-a-rate.',
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
    answer: 'B',
    explain: 'Two Cs, two Rs, and it ends in -ence.',
  },
];

const BAIT_LABEL: Record<BaitKind, string> = {
  speed: 'SPEED & DISTANCE',
  rate: 'WORK RATE',
  percent: 'PERCENTAGE TEST',
  sequence: 'PATTERN CHECK',
  trick: 'LOGIC CHECK',
  spelling: 'SPELLING TEST',
};

const BAIT_THEME: Record<BaitKind, CardTheme> = {
  speed: 'orange',
  rate: 'blue',
  percent: 'purple',
  sequence: 'purple',
  trick: 'orange',
  spelling: 'green',
};

const KIND_TAG: Record<BaitKind, string> = {
  speed: '#mathpuzzle',
  rate: '#logicpuzzle',
  percent: '#mentalmath',
  sequence: '#numberpuzzle',
  trick: '#trickquestion',
  spelling: '#spellingtest',
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
      scene: b.scene,
      theme: BAIT_THEME[b.kind],
      // No emoji here — the image renderer has no emoji font.
      footer: 'Comment your answer · Full IQ test in bio',
    },
    caption: baitCaption(b),
    answer: b.answer,
    explain: b.explain,
  };
}

/**
 * Real pool questions carry no scene data, but numeric-sequence items
 * ("What number comes next? 3, 4, 6, 9, 13, ?") describe one in their
 * text. Lift it into number tiles so those posts get a picture too.
 */
function sceneFromQuestionText(text: string): Scene | undefined {
  const match = text.match(/(\d+(?:\s*,\s*\d+){2,})\s*,\s*\?/);
  if (!match) return undefined;
  const items = match[1].split(',').map((n) => n.trim());
  if (items.length < 3 || items.length > 7) return undefined;
  return { kind: 'sequence', items: [...items, '?'] };
}

/** Drop the inline sequence once the tiles show it — no duplication. */
function promptWithoutSequence(text: string): string {
  return text.replace(/\s*(\d+(?:\s*,\s*\d+){2,})\s*,\s*\?/, '').trim();
}

function questionPlan(q: Question, hook: string): IgPostPlan {
  const label =
    q.category === 'verbal'
      ? 'VERBAL REASONING'
      : q.category === 'numerical'
        ? 'NUMERICAL REASONING'
        : 'LOGICAL REASONING';
  const scene = sceneFromQuestionText(q.question_text);
  return {
    key: `q-${q.id}`,
    card: {
      label,
      badge: 'REAL TEST QUESTION',
      prompt: scene ? promptWithoutSequence(q.question_text) : q.question_text,
      options: q.options.map((o) => ({ id: o.id, text: o.text ?? '' })),
      scene,
      theme: 'blue',
      footer: 'Answer in bio → 30-question IQ test',
    },
    // The caption keeps the full original text — it is the accessible copy.
    caption: questionCaption(q, hook),
    answer: q.correct_id,
    explain: q.explanation,
  };
}

/** Posts published per day, spread across the day's cron runs. */
export const SLOTS_PER_DAY = 3;

/**
 * Deterministic rotation: the same (day, slot) always yields the same
 * post, so a retried cron run republishes nothing new and the ledger
 * stays clean. `dayIndex` is days since epoch (UTC).
 *
 * Each day publishes [bait, bait, real question]: bait drives reach, the
 * real question keeps the product visible.
 */
export function planForSlot(dayIndex: number, slot = 0): IgPostPlan | null {
  const s = Math.min(Math.max(Math.trunc(slot), 0), SLOTS_PER_DAY - 1);

  if (s === SLOTS_PER_DAY - 1) {
    const pool = eligibleQuestions();
    if (pool.length === 0) return null;
    return questionPlan(
      pool[dayIndex % pool.length],
      HOOKS[dayIndex % HOOKS.length],
    );
  }

  if (BAIT_POSTS.length === 0) return null;
  // Two bait slots a day walk the pool without repeating inside a cycle.
  const ordinal = dayIndex * (SLOTS_PER_DAY - 1) + s;
  // Stride instead of walking in order: the pool is grouped by kind, so
  // consecutive posts would otherwise both be, say, percentage puzzles.
  // A stride coprime with the pool length still visits every entry once
  // per cycle, it just interleaves the kinds.
  const stride = coprimeStride(BAIT_POSTS.length);
  return baitPlan(BAIT_POSTS[(ordinal * stride) % BAIT_POSTS.length]);
}

/** Largest of a few candidate strides that is coprime with `len`. */
function coprimeStride(len: number): number {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  for (const candidate of [17, 13, 11, 7, 5, 3]) {
    if (candidate < len && gcd(candidate, len) === 1) return candidate;
  }
  return 1;
}

/** Every post scheduled for a day, in publishing order. */
export function plansForDay(dayIndex: number): IgPostPlan[] {
  return Array.from({ length: SLOTS_PER_DAY }, (_, slot) =>
    planForSlot(dayIndex, slot),
  ).filter((p): p is IgPostPlan => p !== null);
}

/** Days since Unix epoch in UTC — the rotation cursor. */
export function utcDayIndex(now = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}

/** Exposed for tests: the hand-written pool behind the bait slots. */
export function baitPoolSize(): number {
  return BAIT_POSTS.length;
}

/** Exposed for tests: verify every bait answer/option pair is coherent. */
export function baitPostsForTest(): ReadonlyArray<{
  id: string;
  options: IgCardOption[];
  answer: string;
  prompt: string;
}> {
  return BAIT_POSTS;
}
