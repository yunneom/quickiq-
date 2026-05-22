import type { Category, OptionId, Question } from '@/lib/questions/types';

/**
 * PRD §2.3 — Scoring rules.
 *
 * Raw score: 0..30. Estimated IQ uses mean 100, SD 15; we anchor the raw→IQ
 * conversion to the PRD example (24/30 → IQ ~115, top 16%), giving roughly
 * 9 raw points per standard deviation. Floor/ceiling at 70..145 as specified.
 *
 * Percentile is reported as "top N%" (i.e. 100 − cumulative percentile).
 *
 * Category sub-scores are simple per-category accuracy × 100.
 */

export const TOTAL_QUESTIONS = 30;
const MEDIAN_RAW = 15;
const RAW_PER_SD = 9;
const IQ_MIN = 70;
const IQ_MAX = 145;

export interface AnswerInput {
  question_id: string;
  selected_id: OptionId | null;
  time_ms: number;
}

export interface CategoryScores {
  verbal: number;
  numerical: number;
  spatial: number;
  logical: number;
}

export interface ScoreResult {
  rawScore: number;
  total: number;
  estimatedIq: number;
  /** "Top N%" — what users see. Lower = smarter. */
  topPercentile: number;
  categoryScores: CategoryScores;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export function rawScoreToIq(rawScore: number): number {
  const raw = clamp(rawScore, 0, TOTAL_QUESTIONS);
  const iq = 100 + (15 * (raw - MEDIAN_RAW)) / RAW_PER_SD;
  return clamp(Math.round(iq), IQ_MIN, IQ_MAX);
}

export function iqToTopPercentile(iq: number): number {
  const z = (iq - 100) / 15;
  const cum = normalCdf(z);
  const top = (1 - cum) * 100;
  // round to one decimal but never report less than 0.1% / more than 99.9%
  return clamp(Math.round(top * 10) / 10, 0.1, 99.9);
}

export function computeCategoryScores(
  questions: Question[],
  answers: AnswerInput[],
): CategoryScores {
  const byCategory: Record<Category, { correct: number; total: number }> = {
    verbal: { correct: 0, total: 0 },
    numerical: { correct: 0, total: 0 },
    spatial: { correct: 0, total: 0 },
    logical: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    byCategory[q.category].total += 1;
    const a = answers.find((x) => x.question_id === q.id);
    if (a && a.selected_id === q.correct_id) {
      byCategory[q.category].correct += 1;
    }
  }

  const toPct = (c: { correct: number; total: number }) =>
    c.total === 0 ? 0 : Math.round((c.correct / c.total) * 100);

  return {
    verbal: toPct(byCategory.verbal),
    numerical: toPct(byCategory.numerical),
    spatial: toPct(byCategory.spatial),
    logical: toPct(byCategory.logical),
  };
}

export function scoreSession(
  questions: Question[],
  answers: AnswerInput[],
): ScoreResult {
  let raw = 0;
  for (const q of questions) {
    const a = answers.find((x) => x.question_id === q.id);
    if (a && a.selected_id === q.correct_id) raw += 1;
  }
  const estimatedIq = rawScoreToIq(raw);
  return {
    rawScore: raw,
    total: questions.length,
    estimatedIq,
    topPercentile: iqToTopPercentile(estimatedIq),
    categoryScores: computeCategoryScores(questions, answers),
  };
}
