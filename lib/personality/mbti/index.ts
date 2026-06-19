import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes, dichotomyWinner } from '../score';
import { mbtiQuestionsKo, mbtiQuestionsEn } from './questions';
import { mbtiProfilesKo, mbtiProfilesEn } from './profiles';

export const MBTI_TEST_TYPE = 'mbti' as const;
export const MBTI_TOTAL_QUESTIONS = 20;

/** The four dichotomies, high pole first. Used for bar rendering + scoring. */
export const MBTI_AXES = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P'],
] as const;

export function getMbtiQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? mbtiQuestionsEn : mbtiQuestionsKo;
}

export function getMbtiProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? mbtiProfilesEn : mbtiProfilesKo;
  return pool[profileId];
}

export function getAllMbtiProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? mbtiProfilesEn : mbtiProfilesKo;
  return Object.values(pool);
}

/**
 * Tally the 8 pole scores, pick the winner of each dichotomy, and
 * concatenate into a lowercase 4-letter profile id (e.g. 'infp'). Ties on
 * any axis resolve to the second pole (I/N/F/P) via dichotomyWinner.
 */
export function scoreMbti(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getMbtiQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const profileId = MBTI_AXES.map(([high, low]) =>
    dichotomyWinner(axisScores, high, low),
  )
    .join('')
    .toLowerCase();
  return { axisScores, profileId };
}
