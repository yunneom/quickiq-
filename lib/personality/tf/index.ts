import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes } from '../score';
import { tfQuestionsKo, tfQuestionsEn } from './questions';
import { tfProfilesKo, tfProfilesEn } from './profiles';

export const TF_TEST_TYPE = 'tf' as const;
export const TF_TOTAL_QUESTIONS = 15;

/** 15 questions × max 2 points on a single side = 30 max per axis. */
export const TF_AXIS_MAX = 30;

/**
 * T−F margin at/above which we crown the extreme profile. Mild-only
 * answers max out at |diff| = 15 (15 × 1pt), so 16 guarantees at least
 * one strong (2pt) pick backs an extreme label — consistent-but-mild
 * sheets land in the two middle profiles.
 */
const EXTREME_MARGIN = 16;

export function getTfQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? tfQuestionsEn : tfQuestionsKo;
}

export function getTfProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? tfProfilesEn : tfProfilesKo;
  return pool[profileId];
}

export function getAllTfProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? tfProfilesEn : tfProfilesKo;
  return Object.values(pool);
}

/**
 * Single T-vs-F spectrum resolved by the margin (T − F):
 *   ≥ +16 → facts-t  ·  +1..+15 → soft-t  ·  −15..0 → warm-f  ·  ≤ −16 → tearful-f.
 * A tie lands on warm-f — empathy gets the benefit of the doubt, which
 * also matches the meme framing (nobody self-identifies as "50% T").
 */
export function scoreTf(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getTfQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const diff = (axisScores.T ?? 0) - (axisScores.F ?? 0);
  const profileId =
    diff >= EXTREME_MARGIN
      ? 'facts-t'
      : diff >= 1
        ? 'soft-t'
        : diff > -EXTREME_MARGIN
          ? 'warm-f'
          : 'tearful-f';
  return { axisScores, profileId };
}
