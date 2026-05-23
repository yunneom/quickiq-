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
      '정답은 C(감). 귤이 가장 오른쪽, 사과는 배의 오른쪽이므로 배보다 오른쪽. 감은 사과 왼쪽. 가능한 순서는 감-배-사과-귤이고 가장 왼쪽은 감입니다.',
  },
  // ───── 추가 문항 (셔플 모드 변별력 ↑) ─────
  {
    id: 'ko-108',
    order_index: 108,
    category: 'verbal',
    difficulty: 2,
    locale: 'ko',
    question_text: '다음 중 나머지와 관계가 다른 것은?',
    options: [
      { id: 'A', text: '연필 — 글씨' },
      { id: 'B', text: '망치 — 못' },
      { id: 'C', text: '바늘 — 실' },
      { id: 'D', text: '책 — 도서관' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(책 — 도서관). A·B·C는 "도구와 그 결과/대상물"의 관계지만, D는 "사물과 그 사물이 있는 장소"라 관계 유형이 다릅니다.',
  },
  {
    id: 'ko-109',
    order_index: 109,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  7, 14, 28, 56, ?',
    options: [
      { id: 'A', text: '84' },
      { id: 'B', text: '98' },
      { id: 'C', text: '112' },
      { id: 'D', text: '128' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(112). 매번 2배씩 증가하는 등비수열입니다. 56 × 2 = 112. A(+28)는 등차로 잘못 계산한 함정.',
  },
  {
    id: 'ko-110',
    order_index: 110,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    figure_id: 'f-upright',
    question_text: '아래 글자를 180도 회전시킨 모습은?',
    options: [
      { id: 'A', figure_id: 'f-rot90' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot270' },
      { id: 'D', figure_id: 'f-mirror' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B. 180도 회전은 글자가 위아래로 뒤집힌 모습입니다. A는 90도, C는 270도, D는 좌우 반전(거울상)이라 다릅니다.',
  },
  {
    id: 'ko-111',
    order_index: 111,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '4명(가, 나, 다, 라)이 마라톤을 했습니다. 가는 나보다 늦었지만 다보다 빠릅니다. 라는 모두보다 늦었습니다. 1등은 누구일까요?',
    options: [
      { id: 'A', text: '가' },
      { id: 'B', text: '나' },
      { id: 'C', text: '다' },
      { id: 'D', text: '라' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(나). 조건을 합치면 나 > 가 > 다 > 라 순서(빠른 순). 1등은 나입니다. 라는 마지막인 게 명시되어 있어 답에서 제외.',
  },

  // ───── 추가 풀 라운드 2 (각 영역 +3) ─────

  // Verbal +3
  {
    id: 'ko-112',
    order_index: 112,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 빈칸에 가장 어울리는 단어는?  "어머니는 자식의 행복을 ___ 바라셨다."',
    options: [
      { id: 'A', text: '간절히' },
      { id: 'B', text: '드물게' },
      { id: 'C', text: '우연히' },
      { id: 'D', text: '경솔히' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(간절히). 자식의 행복을 바라는 어머니의 감정 강도와 결합하는 자연스러운 부사는 "간절히". 나머지는 의미가 맞지 않습니다.',
  },
  {
    id: 'ko-113',
    order_index: 113,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '"양심 : 가책 = 신체 : ?" 빈칸에 알맞은 단어는?',
    options: [
      { id: 'A', text: '운동' },
      { id: 'B', text: '통증' },
      { id: 'C', text: '뇌' },
      { id: 'D', text: '심장' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(통증). 양심이 잘못을 경고하는 것이 "가책"이듯, 신체가 이상을 경고하는 것은 "통증"입니다. 둘 다 "이상을 알리는 신호" 관계.',
  },
  {
    id: 'ko-114',
    order_index: 114,
    category: 'verbal',
    difficulty: 5,
    locale: 'ko',
    question_text: '다음 중 의미적으로 가장 다른 단어는?',
    options: [
      { id: 'A', text: '편견' },
      { id: 'B', text: '선입견' },
      { id: 'C', text: '통찰' },
      { id: 'D', text: '고정관념' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(통찰). A·B·D는 모두 사전 판단의 부정적 형태이며 의미가 유사합니다. "통찰"은 사물의 본질을 꿰뚫어 본다는 긍정적 인지 능력으로 의미가 정반대.',
  },

  // Numerical +3
  {
    id: 'ko-115',
    order_index: 115,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  9, 4, 7, 4, 5, 4, ?, 4',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
      { id: 'C', text: '5' },
      { id: 'D', text: '7' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(3). 짝수 자리는 모두 4로 고정되고, 홀수 자리는 9 → 7 → 5 → 3으로 매번 2씩 감소합니다. 두 수열이 교차된 패턴.',
  },
  {
    id: 'ko-116',
    order_index: 116,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text: '12% 할인 후 가격이 22,000원이면 원래 가격은 약 얼마인가요?',
    options: [
      { id: 'A', text: '23,500원' },
      { id: 'B', text: '24,640원' },
      { id: 'C', text: '25,000원' },
      { id: 'D', text: '26,400원' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(25,000원). 88%가 22,000원이면 원가 = 22,000 ÷ 0.88 = 25,000원. 할인율 → 원가 역산 능력을 봅니다.',
  },
  {
    id: 'ko-117',
    order_index: 117,
    category: 'numerical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '한 변이 10cm인 정사각형 종이에 한 변이 2cm인 정사각형 9개를 잘라낼 수 있습니다. 남은 종이의 넓이는?',
    options: [
      { id: 'A', text: '36 cm²' },
      { id: 'B', text: '50 cm²' },
      { id: 'C', text: '64 cm²' },
      { id: 'D', text: '72 cm²' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(64 cm²). 전체 100cm² - 잘라낸 9 × 2² = 36cm² = 남은 64cm². 면적 계산 + 곱셈 활용.',
  },

  // Spatial +3 (figure 활용 + 텍스트)
  {
    id: 'ko-118',
    order_index: 118,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    figure_id: 'arrow-down',
    question_text: '아래 화살표를 시계방향으로 90도 회전시키면 어느 방향을 가리키나요?',
    options: [
      { id: 'A', figure_id: 'arrow-right' },
      { id: 'B', figure_id: 'arrow-left' },
      { id: 'C', figure_id: 'arrow-up' },
      { id: 'D', figure_id: 'arrow-down' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(왼쪽). 아래를 향한 화살표를 시계방향 90도 회전하면 왼쪽을 향합니다. 회전 방향 직관 테스트.',
  },
  {
    id: 'ko-119',
    order_index: 119,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '시계의 시침이 6시에서 9시 방향으로 움직였습니다. 시침이 회전한 각도는?',
    options: [
      { id: 'A', text: '60°' },
      { id: 'B', text: '90°' },
      { id: 'C', text: '120°' },
      { id: 'D', text: '180°' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(90°). 시계는 12등분, 한 칸 30°. 6시 → 9시는 3칸 이동이므로 3 × 30° = 90°.',
  },
  {
    id: 'ko-120',
    order_index: 120,
    category: 'spatial',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '한 변이 4cm인 정육면체의 모든 바깥 면에 색칠한 뒤 1cm 정육면체로 자르면, 두 면이 칠해진 작은 정육면체는 몇 개인가요?',
    options: [
      { id: 'A', text: '12개' },
      { id: 'B', text: '18개' },
      { id: 'C', text: '24개' },
      { id: 'D', text: '36개' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(24개). 모서리에 위치한 큐브가 두 면 칠해짐. 4cm 큐브 한 모서리당 (4-2)=2개 모서리 큐브 × 12 모서리 = 24개.',
  },

  // Logical +3
  {
    id: 'ko-121',
    order_index: 121,
    category: 'logical',
    difficulty: 3,
    locale: 'ko',
    question_text:
      '"고양이는 동물이다. 동물은 호흡한다." 두 명제가 모두 참이라면 다음 중 반드시 참인 것은?',
    options: [
      { id: 'A', text: '모든 동물은 고양이다' },
      { id: 'B', text: '고양이는 호흡한다' },
      { id: 'C', text: '호흡하는 것은 모두 고양이다' },
      { id: 'D', text: '고양이는 동물이 아니다' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B. 삼단논법의 표준 형태. A·C는 역의 오류, D는 직접 모순. 전건의 함의 관계가 전이되어 결론에 도달.',
  },
  {
    id: 'ko-122',
    order_index: 122,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '한 마을에는 빨간 모자만 쓰는 사람과 파란 모자만 쓰는 사람이 있습니다. 빨간 모자 사람은 진실만, 파란 모자 사람은 거짓만 말합니다. 한 사람이 "내 모자는 파란색이다"라고 말했습니다. 그 사람의 모자는?',
    options: [
      { id: 'A', text: '빨간색' },
      { id: 'B', text: '파란색' },
      { id: 'C', text: '둘 다 가능' },
      { id: 'D', text: '판단 불가능' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D. 빨간 모자(진실)라면 "내 모자는 파란색"이 거짓이라 모순. 파란 모자(거짓)라면 "내 모자는 파란색"이 진실이라 모순. 어느 쪽도 일관성이 없는 자기 부정 명제.',
  },
  {
    id: 'ko-123',
    order_index: 123,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '시험에서 A, B, C, D 4명 중 두 명만 통과했습니다. 다음 진술들이 모두 참일 때 통과한 두 명은?  "A가 통과하지 않았다면 B도 통과하지 않았다." "C가 통과했다면 D도 통과했다." "B와 C 중 정확히 한 명만 통과했다."',
    options: [
      { id: 'A', text: 'A, B' },
      { id: 'B', text: 'A, C' },
      { id: 'C', text: 'B, D' },
      { id: 'D', text: 'C, D' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(A, B). 진술 3에서 B와 C 중 하나만 통과. C가 통과하면 진술 2에 의해 D도 통과 → 3명 통과로 모순. 따라서 B 통과, C 불통과. 진술 1의 대우로 B 통과 → A 통과. D는 자동으로 불통과.',
  },
];
