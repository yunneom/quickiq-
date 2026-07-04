import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes } from '../score';
import { dopamineQuestionsKo, dopamineQuestionsEn } from './questions';
import { dopamineProfilesKo, dopamineProfilesEn } from './profiles';

export const DOPAMINE_TEST_TYPE = 'dopamine' as const;
export const DOPAMINE_TOTAL_QUESTIONS = 15;

/** 15 questions × max 3 points = 45 max on the single D axis. */
export const DOPAMINE_AXIS_MAX = 45;

export function getDopamineQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? dopamineQuestionsEn : dopamineQuestionsKo;
}

export function getDopamineProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? dopamineProfilesEn : dopamineProfilesKo;
  return pool[profileId];
}

export function getAllDopamineProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? dopamineProfilesEn : dopamineProfilesKo;
  return Object.values(pool);
}

/**
 * Single D (dopamine) axis, 0–45, banded into 4 profiles:
 *   0–11 zen · 12–22 balanced · 23–33 hunter · 34–45 goblin.
 * Band edges chosen so a "middle of the road" answer sheet (all 1s or
 * all 2s) lands in the two middle bands, keeping the extremes earned.
 */
export function scoreDopamine(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getDopamineQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const d = axisScores.D ?? 0;
  const profileId =
    d <= 11 ? 'zen' : d <= 22 ? 'balanced' : d <= 33 ? 'hunter' : 'goblin';
  return { axisScores, profileId };
}
