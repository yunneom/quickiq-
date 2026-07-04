import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scoreTf, getTfQuestions, TF_TOTAL_QUESTIONS } from '../../lib/personality/tf';
import {
  scoreDopamine,
  getDopamineQuestions,
  DOPAMINE_TOTAL_QUESTIONS,
} from '../../lib/personality/dopamine';
import type { PersonalityAnswer, PersonalityOptionId } from '../../lib/personality/types';

function sheet(
  questions: { id: string }[],
  pattern: string,
): PersonalityAnswer[] {
  return questions.map((q, i) => ({
    question_id: q.id,
    selected_id: pattern[i % pattern.length] as PersonalityOptionId,
  }));
}

describe('tf (너 T야?) scoring', () => {
  for (const locale of ['ko', 'en'] as const) {
    it(`${locale}: has ${TF_TOTAL_QUESTIONS} questions with 4 options each`, () => {
      const qs = getTfQuestions(locale);
      assert.equal(qs.length, TF_TOTAL_QUESTIONS);
      for (const q of qs) assert.equal(q.options.length, 4);
    });
  }

  it('maps the four uniform answer sheets to the four profiles', () => {
    const qs = getTfQuestions('ko');
    assert.equal(scoreTf(sheet(qs, 'A'), 'ko').profileId, 'facts-t');
    assert.equal(scoreTf(sheet(qs, 'B'), 'ko').profileId, 'soft-t');
    assert.equal(scoreTf(sheet(qs, 'C'), 'ko').profileId, 'warm-f');
    assert.equal(scoreTf(sheet(qs, 'D'), 'ko').profileId, 'tearful-f');
  });

  it('mild-only sheets never reach the extreme profiles', () => {
    const qs = getTfQuestions('ko');
    // All-B = +15 margin, all-C = −15 — both must stay in the middle bands.
    assert.equal(scoreTf(sheet(qs, 'B'), 'ko').profileId, 'soft-t');
    assert.equal(scoreTf(sheet(qs, 'C'), 'ko').profileId, 'warm-f');
  });

  it('resolves a tie to warm-f (empathy benefit of the doubt)', () => {
    const qs = getTfQuestions('ko');
    // Exact tie: 3 A (T6) + 4 B (T4) = T10 vs 6 C (F6) + 2 D (F4) = F10.
    const tie = qs.map((q, i) => ({
      question_id: q.id,
      selected_id: (i < 3 ? 'A' : i < 7 ? 'B' : i < 13 ? 'C' : 'D') as PersonalityOptionId,
    }));
    const r = scoreTf(tie, 'ko');
    assert.equal(r.axisScores.T, r.axisScores.F);
    assert.equal(r.profileId, 'warm-f');
  });
});

describe('dopamine scoring', () => {
  for (const locale of ['ko', 'en'] as const) {
    it(`${locale}: has ${DOPAMINE_TOTAL_QUESTIONS} questions with 4 options each`, () => {
      const qs = getDopamineQuestions(locale);
      assert.equal(qs.length, DOPAMINE_TOTAL_QUESTIONS);
      for (const q of qs) assert.equal(q.options.length, 4);
    });
  }

  it('maps uniform sheets to the four bands', () => {
    const qs = getDopamineQuestions('ko');
    assert.equal(scoreDopamine(sheet(qs, 'D'), 'ko').profileId, 'zen'); // 0
    assert.equal(scoreDopamine(sheet(qs, 'C'), 'ko').profileId, 'balanced'); // 15
    assert.equal(scoreDopamine(sheet(qs, 'B'), 'ko').profileId, 'hunter'); // 30
    assert.equal(scoreDopamine(sheet(qs, 'A'), 'ko').profileId, 'goblin'); // 45
  });

  it('band edges: 11→zen, 12→balanced, 33→hunter, 34→goblin', () => {
    const qs = getDopamineQuestions('ko');
    // 11 = 3×3 + 2×1 + rest 0 → three A, one B... simpler: craft via patterns.
    // 4 B (8) + 3 C (3) = 11 → zen edge.
    const eleven = qs.map((q, i) => ({
      question_id: q.id,
      selected_id: (i < 4 ? 'B' : i < 7 ? 'C' : 'D') as PersonalityOptionId,
    }));
    assert.equal(scoreDopamine(eleven, 'ko').profileId, 'zen');
    // 12 = 4 A (12) → balanced edge.
    const twelve = qs.map((q, i) => ({
      question_id: q.id,
      selected_id: (i < 4 ? 'A' : 'D') as PersonalityOptionId,
    }));
    assert.equal(scoreDopamine(twelve, 'ko').profileId, 'balanced');
    // 33 = 11 A (33) → hunter top edge.
    const thirty3 = qs.map((q, i) => ({
      question_id: q.id,
      selected_id: (i < 11 ? 'A' : 'D') as PersonalityOptionId,
    }));
    assert.equal(scoreDopamine(thirty3, 'ko').profileId, 'hunter');
    // 34 = 11 A + 1 B + ... → 11×3 + 1 = 34 → goblin.
    const thirty4 = qs.map((q, i) => ({
      question_id: q.id,
      selected_id: (i < 11 ? 'A' : i === 11 ? 'C' : 'D') as PersonalityOptionId,
    }));
    assert.equal(scoreDopamine(thirty4, 'ko').profileId, 'goblin');
  });
});
