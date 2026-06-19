import type {
  PersonalityAnswer,
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityScoreResult,
} from '../types';
import { tallyAxes } from '../score';
import { attachmentQuestionsKo, attachmentQuestionsEn } from './questions';
import { attachmentProfilesKo, attachmentProfilesEn } from './profiles';

export const ATTACHMENT_TEST_TYPE = 'attachment' as const;
export const ATTACHMENT_TOTAL_QUESTIONS = 16;

/** 8 questions per axis × max 3 points = 24 max per axis; split at the midpoint. */
export const ATTACHMENT_AXIS_MAX = 24;
const HIGH_THRESHOLD = 12;

export function getAttachmentQuestions(locale: string): PersonalityQuestion[] {
  return locale === 'en' ? attachmentQuestionsEn : attachmentQuestionsKo;
}

export function getAttachmentProfile(
  profileId: string,
  locale: string,
): PersonalityProfile | undefined {
  const pool = locale === 'en' ? attachmentProfilesEn : attachmentProfilesKo;
  return pool[profileId];
}

export function getAllAttachmentProfiles(locale: string): PersonalityProfile[] {
  const pool = locale === 'en' ? attachmentProfilesEn : attachmentProfilesKo;
  return Object.values(pool);
}

/**
 * Two axes — anxiety (ANX) and avoidance (AVO) — each thresholded at the
 * midpoint to land one of 4 quadrants:
 *   low/low → secure · high/low → anxious · low/high → avoidant · high/high → fearful.
 */
export function scoreAttachment(
  answers: PersonalityAnswer[],
  locale: string,
): PersonalityScoreResult {
  const questions = getAttachmentQuestions(locale);
  const axisScores = tallyAxes(answers, questions);
  const highAnx = (axisScores.ANX ?? 0) >= HIGH_THRESHOLD;
  const highAvo = (axisScores.AVO ?? 0) >= HIGH_THRESHOLD;
  const profileId =
    !highAnx && !highAvo
      ? 'secure'
      : highAnx && !highAvo
        ? 'anxious'
        : !highAnx && highAvo
          ? 'avoidant'
          : 'fearful';
  return { axisScores, profileId };
}
