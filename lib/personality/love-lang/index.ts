import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes, dominantAxis } from '../score';
import { loveLangQuestionsKo, loveLangQuestionsEn } from './questions';
import { loveLangProfilesKo, loveLangProfilesEn } from './profiles';

export const LOVE_LANG_TEST_TYPE = 'love-lang' as const;
export const LOVE_LANG_TOTAL_QUESTIONS = 15;

/** Tie-break order = the canonical 5-language order. */
export const LOVE_LANG_AXES = ['words', 'time', 'gifts', 'service', 'touch'];

export function getLoveLangQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? loveLangQuestionsEn : loveLangQuestionsKo;
}

export function getLoveLangProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? loveLangProfilesEn : loveLangProfilesKo;
  return pool[profileId];
}

export function getAllLoveLangProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? loveLangProfilesEn : loveLangProfilesKo;
  return Object.values(pool);
}

/** Sum the 5 language scores; the highest is the primary love language. */
export function scoreLoveLang(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getLoveLangQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const profileId = dominantAxis(axisScores, LOVE_LANG_AXES);
  return { axisScores, profileId };
}
