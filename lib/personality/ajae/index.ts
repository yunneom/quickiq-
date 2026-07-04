import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes } from '../score';
import { ajaeQuestionsKo, ajaeQuestionsEn } from './questions';
import { ajaeProfilesKo, ajaeProfilesEn } from './profiles';

export const AJAE_TEST_TYPE = 'ajae' as const;
export const AJAE_TOTAL_QUESTIONS = 15;

/** Correct-answer quiz: A axis counts correct picks, 0–15. */
export const AJAE_AXIS_MAX = 15;

export function getAjaeQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? ajaeQuestionsEn : ajaeQuestionsKo;
}

export function getAjaeProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? ajaeProfilesEn : ajaeProfilesKo;
  return pool[profileId];
}

export function getAllAjaeProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? ajaeProfilesEn : ajaeProfilesKo;
  return Object.values(pool);
}

/**
 * Correct count (A) banded into 4 profiles — the inverse joke of the
 * slang quiz: the MORE retro culture you know, the more ajae you are:
 *   0–3 newgen · 4–7 sprout · 8–11 middle · 12–15 legend.
 */
export function scoreAjae(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getAjaeQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const a = axisScores.A ?? 0;
  const profileId =
    a <= 3 ? 'newgen' : a <= 7 ? 'sprout' : a <= 11 ? 'middle' : 'legend';
  return { axisScores, profileId };
}
