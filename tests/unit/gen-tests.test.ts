import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreSlang,
  getSlangQuestions,
  SLANG_TOTAL_QUESTIONS,
} from '../../lib/personality/slang';
import {
  scoreAjae,
  getAjaeQuestions,
  AJAE_TOTAL_QUESTIONS,
} from '../../lib/personality/ajae';
import type {
  PersonalityAnswer,
  PersonalityOptionId,
  PersonalityQuestion,
} from '../../lib/personality/types';

/** Answer sheet that picks the correct (score=1) option for the first n
 *  questions and a wrong one for the rest. */
function correctSheet(
  questions: PersonalityQuestion[],
  axis: string,
  n: number,
): PersonalityAnswer[] {
  return questions.map((q, i) => {
    const correct = q.options.find((o) => (o.scores[axis] ?? 0) === 1);
    const wrong = q.options.find((o) => (o.scores[axis] ?? 0) === 0);
    assert.ok(correct && wrong, `q ${q.id} must have correct + wrong options`);
    return {
      question_id: q.id,
      selected_id: (i < n ? correct.id : wrong.id) as PersonalityOptionId,
    };
  });
}

describe('slang quiz (신조어 능력고사)', () => {
  for (const locale of ['ko', 'en'] as const) {
    it(`${locale}: ${SLANG_TOTAL_QUESTIONS} questions, each with exactly one correct option`, () => {
      const qs = getSlangQuestions(locale);
      assert.equal(qs.length, SLANG_TOTAL_QUESTIONS);
      for (const q of qs) {
        const correct = q.options.filter((o) => (o.scores.Y ?? 0) === 1);
        assert.equal(correct.length, 1, `${q.id} must have exactly 1 correct option`);
        assert.equal(q.options.length, 4);
      }
    });
  }

  it('bands: 0→grandpa, 4→grandpa, 5→ajae, 8→ajae, 9→mz-passing, 12→mz-passing, 13→alpha, 15→alpha', () => {
    const qs = getSlangQuestions('ko');
    const cases: Array<[number, string]> = [
      [0, 'grandpa'], [4, 'grandpa'], [5, 'ajae'], [8, 'ajae'],
      [9, 'mz-passing'], [12, 'mz-passing'], [13, 'alpha'], [15, 'alpha'],
    ];
    for (const [n, expected] of cases) {
      const r = scoreSlang(correctSheet(qs, 'Y', n), 'ko');
      assert.equal(r.profileId, expected, `${n} correct → ${expected}`);
      assert.equal(r.axisScores.Y ?? 0, n);
    }
  });
});

describe('ajae quiz (아재력 테스트)', () => {
  for (const locale of ['ko', 'en'] as const) {
    it(`${locale}: ${AJAE_TOTAL_QUESTIONS} questions, each with exactly one correct option`, () => {
      const qs = getAjaeQuestions(locale);
      assert.equal(qs.length, AJAE_TOTAL_QUESTIONS);
      for (const q of qs) {
        const correct = q.options.filter((o) => (o.scores.A ?? 0) === 1);
        assert.equal(correct.length, 1, `${q.id} must have exactly 1 correct option`);
        assert.equal(q.options.length, 4);
      }
    });
  }

  it('bands: 0→newgen, 3→newgen, 4→sprout, 7→sprout, 8→middle, 11→middle, 12→legend, 15→legend', () => {
    const qs = getAjaeQuestions('ko');
    const cases: Array<[number, string]> = [
      [0, 'newgen'], [3, 'newgen'], [4, 'sprout'], [7, 'sprout'],
      [8, 'middle'], [11, 'middle'], [12, 'legend'], [15, 'legend'],
    ];
    for (const [n, expected] of cases) {
      const r = scoreAjae(correctSheet(qs, 'A', n), 'ko');
      assert.equal(r.profileId, expected, `${n} correct → ${expected}`);
      assert.equal(r.axisScores.A ?? 0, n);
    }
  });
});
