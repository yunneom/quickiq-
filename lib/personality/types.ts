/**
 * Shared types for personality-style tests (테토/에겐, MBTI, 애착 유형, etc.).
 * These are distinct from the IQ test types because there is no
 * "correct answer" — each option contributes points to one or more
 * personality axes, and the dominant axis(es) map to a profile.
 */

export type PersonalityOptionId = 'A' | 'B' | 'C' | 'D';

/** Map of axis id (e.g. 'T', 'E') → points contributed when option is selected. */
export type AxisScoreMap = Record<string, number>;

export interface PersonalityOption {
  id: PersonalityOptionId;
  text: string;
  /** Per-axis points this option grants. Multiple axes allowed (e.g. MBTI). */
  scores: AxisScoreMap;
}

export interface PersonalityQuestion {
  id: string;
  order_index: number;
  locale: 'ko' | 'en';
  question_text: string;
  options: PersonalityOption[];
}

export interface PersonalityProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  /** Optional: profile id → 1-line compatibility note (only for relationship-style tests). */
  compatibility?: Record<string, string>;
}

export interface PersonalityAnswer {
  question_id: string;
  selected_id: PersonalityOptionId | null;
}

export interface PersonalityScoreResult {
  /** Raw per-axis totals (e.g. { T: 18, E: 12 } for 테토/에겐). */
  axisScores: AxisScoreMap;
  /** Resolved profile id (e.g. 'teto-male'). */
  profileId: string;
}
