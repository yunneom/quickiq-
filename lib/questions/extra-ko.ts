import type { Question } from './types';

/**
 * Optional extra question pool (Korean). Activated only when
 * NEXT_PUBLIC_QUESTION_POOL=shuffle, in which case `getQuestions()` mixes
 * these into the base 30 and serves a random 30 per session — giving users
 * a different test on a re-attempt and improving discrimination.
 *
 * Each entry uses a separate order_index range (100+) to avoid collisions
 * with the base set when both are loaded.
 */
export const extraKoQuestions: Question[] = [
  // ───── 언어 추론 추가 (2문항) ─────
  {
    id: 'ko-101',
    order_index: 101,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '"화가 : 그림 = 작곡가 : ?" 빈칸에 알맞은 단어는?',
    options: [
      { id: 'A', text: '악기' },
      { id: 'B', text: '음악' },
      { id: 'C', text: '가수' },
      { id: 'D', text: '공연' },
    ],
    correct_id: 'B',
    explanation: '창작자와 결과물의 관계입니다. 화가는 그림을, 작곡가는 음악을 만듭니다.',
  },
  {
    id: 'ko-102',
    order_index: 102,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 중 의미가 가장 다른 단어는?',
    options: [
      { id: 'A', text: '신중하다' },
      { id: 'B', text: '경솔하다' },
      { id: 'C', text: '조심스럽다' },
      { id: 'D', text: '사려깊다' },
    ],
    correct_id: 'B',
    explanation: '"경솔하다"는 가볍고 함부로 행동한다는 뜻이며, 나머지는 모두 "조심스럽고 깊이 생각한다"는 의미입니다.',
  },

  // ───── 수리 추론 추가 (2문항) ─────
  {
    id: 'ko-103',
    order_index: 103,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  100, 50, 25, 12.5, ?',
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '6' },
      { id: 'C', text: '6.25' },
      { id: 'D', text: '10' },
    ],
    correct_id: 'C',
    explanation: '각 항이 직전 항의 절반(공비 0.5의 등비수열)입니다. 12.5 ÷ 2 = 6.25.',
  },
  {
    id: 'ko-104',
    order_index: 104,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text: '12명이 15일에 마치는 일을 18명이 마치려면 며칠이 걸리나요? (한 사람당 작업량은 같음)',
    options: [
      { id: 'A', text: '8일' },
      { id: 'B', text: '10일' },
      { id: 'C', text: '12일' },
      { id: 'D', text: '20일' },
    ],
    correct_id: 'B',
    explanation: '총 작업량 = 12 × 15 = 180 인일. 18명이면 180 ÷ 18 = 10일.',
  },

  // ───── 공간 추론 추가 (1문항) ─────
  {
    id: 'ko-105',
    order_index: 105,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    figure_id: 'arrow-right',
    question_text: '아래 화살표를 시계방향으로 180도 회전시키면 어느 방향을 가리키나요?',
    options: [
      { id: 'A', figure_id: 'arrow-left' },
      { id: 'B', figure_id: 'arrow-up' },
      { id: 'C', figure_id: 'arrow-down' },
      { id: 'D', figure_id: 'arrow-right' },
    ],
    correct_id: 'A',
    explanation: '오른쪽을 가리키는 화살표를 180도 회전하면 반대 방향인 왼쪽을 가리킵니다.',
  },

  // ───── 논리 추론 추가 (2문항) ─────
  {
    id: 'ko-106',
    order_index: 106,
    category: 'logical',
    difficulty: 3,
    locale: 'ko',
    question_text:
      '갑, 을, 병 세 사람 중 한 명은 진실만, 한 명은 거짓만, 한 명은 그때그때 다르게 말합니다. "갑은 진실을 말한다"고 을이 말했고, "을은 거짓말쟁이다"라고 병이 말했습니다. 누가 진실만 말하는 사람일까요?',
    options: [
      { id: 'A', text: '갑' },
      { id: 'B', text: '을' },
      { id: 'C', text: '병' },
      { id: 'D', text: '알 수 없다' },
    ],
    correct_id: 'D',
    explanation: '주어진 정보만으로는 세 사람의 정체성을 유일하게 결정할 수 없습니다. 여러 시나리오가 가능합니다.',
  },
  {
    id: 'ko-107',
    order_index: 107,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '책상 위에 사과, 배, 감, 귤이 있습니다. 사과는 배의 오른쪽에 있고, 감은 사과의 왼쪽에 있으며, 귤은 가장 오른쪽에 있습니다. 가장 왼쪽에 있는 과일은?',
    options: [
      { id: 'A', text: '사과' },
      { id: 'B', text: '배' },
      { id: 'C', text: '감' },
      { id: 'D', text: '귤' },
    ],
    correct_id: 'C',
    explanation:
      '귤이 가장 오른쪽, 사과는 배의 오른쪽이므로 배보다 오른쪽. 감은 사과 왼쪽. 가능한 순서는 감-배-사과-귤이고 가장 왼쪽은 감입니다.',
  },
];
