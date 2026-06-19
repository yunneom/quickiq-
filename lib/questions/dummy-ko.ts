import type { Question } from './types';

/**
 * Base IQ question set (Korean), 30 items, served deterministically in
 * order 1..30. Calibrated for a middle-school-and-above (중학생 이상)
 * audience: no childish "apple/pear/carrot" items — the floor is a
 * difficulty-3 question that still requires deliberate reasoning, ramping
 * to genuinely discriminating difficulty-5 items.
 *
 * Distribution: verbal 8 / numerical 8 / spatial 7 / logical 7.
 * Difficulty floor is 3 (no trivial 1–2 items). Answer keys are spread
 * across A/B/C/D to avoid guessable position patterns.
 */
export const dummyKoQuestions: Question[] = [
  // ───── 언어 추론 (8문항) ─────
  {
    id: 'ko-001',
    order_index: 1,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '"갈증 : 물 = 허기 : ?" 빈칸에 들어갈 단어로 가장 알맞은 것은?',
    options: [
      { id: 'A', text: '음식' },
      { id: 'B', text: '요리' },
      { id: 'C', text: '포만' },
      { id: 'D', text: '위장' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(음식). "갈증을 해소하는 것이 물"이듯 "허기를 해소하는 것은 음식"입니다. C(포만)는 해소된 결과 상태, B·D는 관련 개념일 뿐 "해소 수단"이 아닙니다.',
  },
  {
    id: 'ko-002',
    order_index: 2,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 중 의미가 나머지와 가장 다른 단어는?',
    options: [
      { id: 'A', text: '미미하다' },
      { id: 'B', text: '사소하다' },
      { id: 'C', text: '지대하다' },
      { id: 'D', text: '하찮다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(지대하다 = 매우 크다). A·B·D는 모두 "작고 보잘것없다"는 뜻의 유의어이므로, 의미가 정반대인 C가 답입니다.',
  },
  {
    id: 'ko-003',
    order_index: 3,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 문장의 빈칸에 가장 알맞은 단어는?  "그는 거듭된 실패에도 ___ 않고 다시 도전했다."',
    options: [
      { id: 'A', text: '들뜨지' },
      { id: 'B', text: '우쭐하지' },
      { id: 'C', text: '굴하지' },
      { id: 'D', text: '안주하지' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(굴하지). "굴하다"는 어려움에 꺾여 굽힌다는 뜻으로, 실패에도 포기하지 않았다는 문맥과 맞습니다. A·B는 긍정적 흥분, D는 현실에 머무름이라 문맥에 어긋납니다.',
  },
  {
    id: 'ko-004',
    order_index: 4,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '"노력 : 성취 = 낭비 : ?" 빈칸에 들어갈 단어로 가장 알맞은 것은?',
    options: [
      { id: 'A', text: '시간' },
      { id: 'B', text: '손실' },
      { id: 'C', text: '여유' },
      { id: 'D', text: '절약' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(손실). "노력이 성취로 이어지듯" 원인과 결과의 관계입니다. 낭비가 가져오는 결과는 손실입니다. D(절약)는 낭비의 반대 개념이라 함정입니다.',
  },
  {
    id: 'ko-005',
    order_index: 5,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 중 성격이 나머지와 다른 것은?',
    options: [
      { id: 'A', text: '온도' },
      { id: 'B', text: '길이' },
      { id: 'C', text: '무게' },
      { id: 'D', text: '저울' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(저울). 온도·길이·무게는 모두 "측정되는 양(물리량)"이지만, 저울은 그 양을 재는 "도구"입니다. 분류 기준이 단순 단어가 아니라 추상적 역할이라는 점이 핵심.',
  },
  {
    id: 'ko-006',
    order_index: 6,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '"간헐적"과 의미가 가장 가까운 단어는?',
    options: [
      { id: 'A', text: '이따금' },
      { id: 'B', text: '꾸준히' },
      { id: 'C', text: '즉시' },
      { id: 'D', text: '영원히' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(이따금). "간헐적"은 일정 간격을 두고 이따금 반복된다는 뜻입니다. B(꾸준히)는 끊김 없는 지속이라 정반대 개념입니다.',
  },
  {
    id: 'ko-007',
    order_index: 7,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '"의사 : 진단 = 판사 : ?" 빈칸에 들어갈 단어로 가장 알맞은 것은?',
    options: [
      { id: 'A', text: '법정' },
      { id: 'B', text: '범죄' },
      { id: 'C', text: '변호' },
      { id: 'D', text: '판결' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(판결). 직업과 그 직업의 핵심 행위 관계입니다. 의사가 진단을 내리듯 판사는 판결을 내립니다. A는 장소, B는 대상, C는 변호사의 역할이라 다릅니다.',
  },
  {
    id: 'ko-008',
    order_index: 8,
    category: 'verbal',
    difficulty: 5,
    locale: 'ko',
    question_text: '"배보다 배꼽이 크다"라는 속담이 가리키는 상황으로 가장 알맞은 것은?',
    options: [
      { id: 'A', text: '작은 것이 큰 것을 이긴 상황' },
      { id: 'B', text: '부수적인 것이 정작 중요한 것보다 더 커진 상황' },
      { id: 'C', text: '욕심이 끝없이 커지는 상황' },
      { id: 'D', text: '준비를 지나치게 철저히 한 상황' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B. 배꼽(부수적인 것)이 배(본질)보다 크다는 것은, 곁딸린 부분이 정작 중심보다 더 커져 주객이 전도된 상황을 뜻합니다.',
  },

  // ───── 수리 추론 (8문항) ─────
  {
    id: 'ko-009',
    order_index: 9,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  3, 4, 6, 9, 13, ?',
    options: [
      { id: 'A', text: '16' },
      { id: 'B', text: '17' },
      { id: 'C', text: '18' },
      { id: 'D', text: '20' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(18). 인접 항의 차가 1, 2, 3, 4로 1씩 커집니다. 다음 차는 5이므로 13 + 5 = 18. "계차가 등차"인 패턴입니다.',
  },
  {
    id: 'ko-010',
    order_index: 10,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  2, 6, 12, 20, 30, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '44' },
      { id: 'D', text: '48' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(42). 각 항은 n×(n+1) 형태(1·2, 2·3, 3·4, 4·5, 5·6)이며, 차가 4, 6, 8, 10으로 커집니다. 다음 차 12 → 30 + 12 = 42.',
  },
  {
    id: 'ko-011',
    order_index: 11,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  2, 3, 5, 7, 11, ?',
    options: [
      { id: 'A', text: '12' },
      { id: 'B', text: '14' },
      { id: 'C', text: '15' },
      { id: 'D', text: '13' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(13). 이 수열은 소수(자기 자신과 1로만 나누어지는 수)의 나열입니다. 11 다음 소수는 12(×), 13(○)입니다. 산술 규칙이 아니라 "수의 성질"을 알아채야 풀립니다.',
  },
  {
    id: 'ko-012',
    order_index: 12,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text: '어떤 수의 15%가 45입니다. 이 수의 40%는?',
    options: [
      { id: 'A', text: '120' },
      { id: 'B', text: '135' },
      { id: 'C', text: '150' },
      { id: 'D', text: '180' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(120). 15%가 45이므로 전체 수는 45 ÷ 0.15 = 300. 그 40%는 300 × 0.4 = 120. 비율 역산 후 재적용하는 2단계 문제입니다.',
  },
  {
    id: 'ko-013',
    order_index: 13,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '물탱크를 A 수도꼭지는 6시간, B 수도꼭지는 3시간 만에 가득 채웁니다. 두 꼭지를 동시에 틀면 몇 시간이 걸리나요?',
    options: [
      { id: 'A', text: '1.5시간' },
      { id: 'B', text: '2시간' },
      { id: 'C', text: '2.5시간' },
      { id: 'D', text: '4.5시간' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(2시간). 시간당 채우는 양은 A가 1/6, B가 1/3이므로 합하면 1/6 + 1/3 = 1/2. 전체(1)를 채우는 데 2시간 걸립니다.',
  },
  {
    id: 'ko-014',
    order_index: 14,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '시속 60km로 2시간, 시속 90km로 1시간을 달렸습니다. 전체 구간의 평균 속력은?',
    options: [
      { id: 'A', text: '65 km/h' },
      { id: 'B', text: '70 km/h' },
      { id: 'C', text: '75 km/h' },
      { id: 'D', text: '80 km/h' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(70 km/h). 총 거리 = 60×2 + 90×1 = 210km, 총 시간 = 3시간. 평균 속력 = 210 ÷ 3 = 70km/h. 단순히 (60+90)/2 = 75로 계산하면 틀립니다(C 함정).',
  },
  {
    id: 'ko-015',
    order_index: 15,
    category: 'numerical',
    difficulty: 5,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  5, 6, 10, 12, 20, 24, 40, ?',
    options: [
      { id: 'A', text: '44' },
      { id: 'B', text: '46' },
      { id: 'C', text: '48' },
      { id: 'D', text: '60' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(48). 홀수 번째 항(5, 10, 20, 40)과 짝수 번째 항(6, 12, 24, ?)이 각각 2배씩 커지는 두 수열이 교대로 섞여 있습니다. 24 × 2 = 48.',
  },
  {
    id: 'ko-016',
    order_index: 16,
    category: 'numerical',
    difficulty: 5,
    locale: 'ko',
    question_text: '8명이 모인 자리에서 서로 한 번씩 빠짐없이 악수를 하면, 악수는 모두 몇 번 이루어지나요?',
    options: [
      { id: 'A', text: '16번' },
      { id: 'B', text: '36번' },
      { id: 'C', text: '56번' },
      { id: 'D', text: '28번' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(28번). 8명 중 2명을 뽑는 조합이므로 8 × 7 ÷ 2 = 28. "8 × 7 = 56"으로 멈추면 각 악수를 두 번씩 센 셈이라 C 함정에 빠집니다.',
  },

  // ───── 공간 추론 (7문항) ─────
  {
    id: 'ko-017',
    order_index: 17,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 네 개의 전개도 중 접었을 때 정육면체가 되지 않는 것은?',
    options: [
      { id: 'A', figure_id: 'cube-net-cross' },
      { id: 'B', figure_id: 'cube-net-t' },
      { id: 'C', figure_id: 'cube-net-l' },
      { id: 'D', figure_id: 'cube-net-bad' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D. A·B·C는 6개의 면이 겹치지 않게 배치돼 정육면체로 접히지만, D는 접었을 때 두 면이 같은 자리에 겹치고 한 면이 비어 정육면체가 되지 못합니다.',
  },
  {
    id: 'ko-018',
    order_index: 18,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    figure_id: 'f-upright',
    question_text: '아래 글자를 시계방향으로 90도 회전시킨 모습은?',
    options: [
      { id: 'A', figure_id: 'f-rot90' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot270' },
      { id: 'D', figure_id: 'f-mirror' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A. "F"를 시계방향 90도 회전하면 윗부분이 오른쪽을 향합니다. B는 180도, C는 270도, D는 좌우 반전(거울상)이라 다른 변환입니다.',
  },
  {
    id: 'ko-019',
    order_index: 19,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    figure_id: 'f-upright',
    question_text: '아래 글자를 거울에 비추었을 때(좌우 반전) 보이는 모습은?',
    options: [
      { id: 'A', figure_id: 'f-mirror' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot90' },
      { id: 'D', figure_id: 'f-rot270' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A. 거울상은 좌우만 뒤집힌 모습입니다. B(180도 회전)는 상하좌우가 모두 바뀌고, C·D는 회전이라 거울상과 구분됩니다.',
  },
  {
    id: 'ko-020',
    order_index: 20,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    question_text:
      '주사위는 마주 보는 두 면의 합이 항상 7입니다. 윗면이 2일 때 바닥면의 눈은?',
    options: [
      { id: 'A', text: '3' },
      { id: 'B', text: '4' },
      { id: 'C', text: '5' },
      { id: 'D', text: '6' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(5). 마주 보는 면의 합이 7이므로 윗면 2의 반대편(바닥)은 7 − 2 = 5입니다.',
  },
  {
    id: 'ko-021',
    order_index: 21,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    figure_id: 'pyramid-3step',
    question_text: '아래 도형은 1cm 정육면체를 쌓아 만든 3단 계단형 피라미드입니다. 정육면체는 모두 몇 개인가요?',
    options: [
      { id: 'A', text: '12개' },
      { id: 'B', text: '14개' },
      { id: 'C', text: '9개' },
      { id: 'D', text: '27개' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(14개). 위에서부터 1단(1×1=1) + 2단(2×2=4) + 3단(3×3=9) = 14개. D(27)는 3×3×3 꽉 찬 정육면체로 착각한 함정입니다.',
  },
  {
    id: 'ko-022',
    order_index: 22,
    category: 'spatial',
    difficulty: 5,
    locale: 'ko',
    figure_id: 'painted-cube',
    question_text:
      '한 변이 3cm인 정육면체의 모든 바깥 면에 색을 칠한 뒤, 1cm 정육면체 27개로 잘랐습니다. 세 면이 칠해진 작은 정육면체는 몇 개인가요?',
    options: [
      { id: 'A', text: '6개' },
      { id: 'B', text: '8개' },
      { id: 'C', text: '4개' },
      { id: 'D', text: '12개' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(8개). 세 면이 칠해지는 것은 꼭짓점에 놓인 큐브뿐이며, 정육면체의 꼭짓점은 8개입니다. A(6)는 면, D(12)는 모서리 수라 헷갈리기 쉽습니다.',
  },
  {
    id: 'ko-023',
    order_index: 23,
    category: 'spatial',
    difficulty: 5,
    locale: 'ko',
    question_text: '정육면체를 평면 하나로 한 번 잘랐을 때, 단면의 모양으로 나올 수 없는 것은?',
    options: [
      { id: 'A', text: '삼각형' },
      { id: 'B', text: '오각형' },
      { id: 'C', text: '육각형' },
      { id: 'D', text: '원' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(원). 정육면체의 면은 모두 평평한 직선 모서리로 이루어져 단면도 직선들로 둘러싸인 다각형(삼각형~육각형)만 나옵니다. 곡선인 원은 절대 만들어질 수 없습니다.',
  },

  // ───── 논리 추론 (7문항) ─────
  {
    id: 'ko-024',
    order_index: 24,
    category: 'logical',
    difficulty: 3,
    locale: 'ko',
    question_text:
      '"모든 포유류는 척추동물이다. 고래는 포유류이다." 두 명제가 참일 때 반드시 참인 것은?',
    options: [
      { id: 'A', text: '모든 척추동물은 포유류이다' },
      { id: 'B', text: '고래는 척추동물이다' },
      { id: 'C', text: '척추동물은 모두 고래이다' },
      { id: 'D', text: '고래는 포유류가 아니다' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B. 표준 삼단논법으로 함의가 전이됩니다. A·C는 역의 오류(거꾸로 뒤집은 주장), D는 전제와 직접 모순입니다.',
  },
  {
    id: 'ko-025',
    order_index: 25,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text: '"운동을 하면 건강해진다. 그런데 그는 건강해지지 않았다." 따라서 반드시 참인 것은?',
    options: [
      { id: 'A', text: '그는 운동을 했다' },
      { id: 'B', text: '운동은 건강과 무관하다' },
      { id: 'C', text: '그는 운동을 하지 않았다' },
      { id: 'D', text: '알 수 없다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C. 대우(modus tollens)의 적용입니다. "P이면 Q"가 참이면 "Q가 아니면 P도 아니다"도 참이므로, 건강해지지 않았다면 운동을 하지 않은 것입니다.',
  },
  {
    id: 'ko-026',
    order_index: 26,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '"빨간 것은 모두 크다. 큰 것은 모두 비싸다. 이 물건은 비싸지 않다." 따라서 반드시 참인 것은?',
    options: [
      { id: 'A', text: '이 물건은 빨갛지 않다' },
      { id: 'B', text: '이 물건은 빨갛다' },
      { id: 'C', text: '이 물건은 크다' },
      { id: 'D', text: '알 수 없다' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A. 빨강 → 크다 → 비싸다 이므로 빨강 → 비싸다. 그 대우는 "비싸지 않다 → 빨갛지 않다". 비싸지 않으므로 빨갛지 않습니다.',
  },
  {
    id: 'ko-027',
    order_index: 27,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text: '"모든 사과는 빨갛다"가 거짓임이 밝혀졌을 때, 반드시 참인 것은?',
    options: [
      { id: 'A', text: '모든 사과는 빨갛지 않다' },
      { id: 'B', text: '어떤 사과도 빨갛지 않다' },
      { id: 'C', text: '적어도 하나의 사과는 빨갛지 않다' },
      { id: 'D', text: '빨간 것은 모두 사과가 아니다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C. 전칭명제 "모든 사과는 빨갛다"의 부정은 존재명제 "적어도 하나의 사과는 빨갛지 않다"입니다. A·B는 지나치게 강한 주장이고 D는 무관합니다.',
  },
  {
    id: 'ko-028',
    order_index: 28,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '5명이 한 줄로 섰습니다. 갑은 을보다 앞, 병은 갑보다 앞, 정은 병보다 앞에 있고, 무는 가장 뒤에 있습니다. 맨 앞에 선 사람은?',
    options: [
      { id: 'A', text: '정' },
      { id: 'B', text: '병' },
      { id: 'C', text: '갑' },
      { id: 'D', text: '무' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(정). 조건을 합치면 정 → 병 → 갑 → 을 순서이고 무는 맨 뒤이므로 정 → 병 → 갑 → 을 → 무. 맨 앞은 정입니다.',
  },
  {
    id: 'ko-029',
    order_index: 29,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      'A, B, C, D 네 명 중 정확히 두 명만 시험에 합격했습니다. 다음이 모두 참일 때 합격한 두 명은?  ① A가 불합격이면 B도 불합격이다. ② C가 합격이면 D도 합격이다. ③ B와 C 중 정확히 한 명만 합격했다.',
    options: [
      { id: 'A', text: 'A, B' },
      { id: 'B', text: 'A, C' },
      { id: 'C', text: 'B, D' },
      { id: 'D', text: 'C, D' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(A, B). ③에서 B·C 중 한 명만 합격. 만약 C가 합격이면 ②로 D도 합격해 합격자가 3명이 되어 모순. 따라서 B 합격·C 불합격. ①의 대우(B 합격 → A 합격)로 A도 합격. 합격은 A·B 두 명입니다.',
  },
  {
    id: 'ko-030',
    order_index: 30,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '진실만 말하는 사람과 거짓만 말하는 사람이 있습니다. 한 사람에게 "당신은 진실을 말하는 사람입니까?"라고 묻자 "네"라고 답했습니다. 이 사람은?',
    options: [
      { id: 'A', text: '반드시 진실을 말하는 사람' },
      { id: 'B', text: '반드시 거짓을 말하는 사람' },
      { id: 'C', text: '둘 다 가능하다' },
      { id: 'D', text: '질문이 성립하지 않는다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C. 진실을 말하는 사람은 사실대로 "네"라 답하고, 거짓말쟁이도 자신이 거짓말쟁이라는 사실을 숨기려 "네"라 답합니다. 두 경우 모두 "네"가 나오므로 답만으로는 구분할 수 없습니다.',
  },
];
