import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes } from '../score';
import { slangQuestionsKo, slangQuestionsEn } from './questions';
import { slangProfilesKo, slangProfilesEn } from './profiles';

export const SLANG_TEST_TYPE = 'slang' as const;
export const SLANG_TOTAL_QUESTIONS = 15;

/** Correct-answer quiz: Y axis counts correct picks, 0–15. */
export const SLANG_AXIS_MAX = 15;

export function getSlangQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? slangQuestionsEn : slangQuestionsKo;
}

export function getSlangProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? slangProfilesEn : slangProfilesKo;
  return pool[profileId];
}

export function getAllSlangProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? slangProfilesEn : slangProfilesKo;
  return Object.values(pool);
}

/**
 * Correct count (Y) banded into 4 provocative "language age" profiles —
 * the fewer you get right, the older you're roasted as:
 *   0–4 grandpa (70대 할배) · 5–8 ajae · 9–12 mz-passing · 13–15 alpha.
 */
export function scoreSlang(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getSlangQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const y = axisScores.Y ?? 0;
  const profileId =
    y <= 4 ? 'grandpa' : y <= 8 ? 'ajae' : y <= 12 ? 'mz-passing' : 'alpha';
  return { axisScores, profileId };
}
