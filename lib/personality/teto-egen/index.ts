import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tetoEgenQuestionsKo, tetoEgenQuestionsEn } from './questions';
import { tetoEgenProfilesKo, tetoEgenProfilesEn } from './profiles';

export const TETO_EGEN_TEST_TYPE = 'teto-egen' as const;
export const TETO_EGEN_TOTAL_QUESTIONS = 15;

export type Gender = 'male' | 'female';

export function getTetoEgenQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? tetoEgenQuestionsEn : tetoEgenQuestionsKo;
}

export function getTetoEgenProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? tetoEgenProfilesEn : tetoEgenProfilesKo;
  return pool[profileId];
}

export function getAllTetoEgenProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? tetoEgenProfilesEn : tetoEgenProfilesKo;
  return Object.values(pool);
}

/**
 * Score the 테토/에겐 answers against the question pool, then resolve to
 * one of 4 profiles using the user-declared gender. Ties on the T/E axis
 * resolve to E (the softer profile) so we never crown a runaway alpha
 * label on a 50/50 split.
 */
export function scoreTetoEgen(
  answers: PersonalityAnswer[],
  locale: string,
  gender: Gender,
): PersonalityScoreResult {
  const questions = getTetoEgenQuestions(locale);
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const axisScores: Record<string, number> = { T: 0, E: 0 };
  for (const ans of answers) {
    if (!ans.selected_id) continue;
    const q = questionMap.get(ans.question_id);
    if (!q) continue;
    const opt = q.options.find((o) => o.id === ans.selected_id);
    if (!opt) continue;
    for (const [axis, pts] of Object.entries(opt.scores)) {
      axisScores[axis] = (axisScores[axis] ?? 0) + pts;
    }
  }

  const dominant = axisScores.T > axisScores.E ? 'teto' : 'egen';
  const profileId = `${dominant}-${gender}`;

  return { axisScores, profileId };
}
