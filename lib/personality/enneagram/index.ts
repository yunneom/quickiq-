import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes, dominantAxis } from '../score';
import { enneagramQuestionsKo, enneagramQuestionsEn } from './questions';
import { enneagramProfilesKo, enneagramProfilesEn } from './profiles';

export const ENNEAGRAM_TEST_TYPE = 'enneagram' as const;
export const ENNEAGRAM_TOTAL_QUESTIONS = 18;

/** Tie-break order = type1 → type9. */
export const ENNEAGRAM_AXES = [
  'type1',
  'type2',
  'type3',
  'type4',
  'type5',
  'type6',
  'type7',
  'type8',
  'type9',
];

export function getEnneagramQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? enneagramQuestionsEn : enneagramQuestionsKo;
}

export function getEnneagramProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? enneagramProfilesEn : enneagramProfilesKo;
  return pool[profileId];
}

export function getAllEnneagramProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? enneagramProfilesEn : enneagramProfilesKo;
  return Object.values(pool);
}

/** Sum the 9 type scores; the highest is the dominant enneagram type. */
export function scoreEnneagram(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getEnneagramQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const profileId = dominantAxis(axisScores, ENNEAGRAM_AXES);
  return { axisScores, profileId };
}
