import type { Question } from './types';

export const dummyKoQuestions: Question[] = [
  // ───── 언어 추론 (8문항) ─────
  {
    id: 'ko-001',
    order_index: 1,
    category: 'verbal',
    difficulty: 1,
    locale: 'ko',
    question_text: '다음 중 나머지와 종류가 다른 것은?',
    options: [
      { id: 'A', text: '사과' },
      { id: 'B', text: '배' },
      { id: 'C', text: '당근' },
      { id: 'D', text: '포도' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(당근). 사과·배·포도는 모두 과일이지만 당근은 채소(뿌리식물)입니다. 상위 카테고리로 분류하는 어휘 능력을 측정합니다.',
  },
  {
    id: 'ko-002',
    order_index: 2,
    category: 'verbal',
    difficulty: 2,
    locale: 'ko',
    question_text: '"기쁘다"와 가장 비슷한 뜻을 가진 단어는?',
    options: [
      { id: 'A', text: '슬프다' },
      { id: 'B', text: '즐겁다' },
      { id: 'C', text: '화나다' },
      { id: 'D', text: '놀라다' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(즐겁다). "기쁘다"와 가장 가까운 감정 어휘입니다. A는 반의어, C는 부정 감정, D는 중립 감정이라 의미가 다릅니다.',
  },
  {
    id: 'ko-003',
    order_index: 3,
    category: 'verbal',
    difficulty: 2,
    locale: 'ko',
    question_text: '"넓다"의 반대말은?',
    options: [
      { id: 'A', text: '좁다' },
      { id: 'B', text: '길다' },
      { id: 'C', text: '높다' },
      { id: 'D', text: '깊다' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A(좁다). B/C/D는 모두 공간의 다른 차원(길이·높이·깊이)을 가리키지만, 면적의 반대 개념은 "좁다"뿐입니다.',
  },
  {
    id: 'ko-004',
    order_index: 4,
    category: 'verbal',
    difficulty: 2,
    locale: 'ko',
    question_text: '다음 중 가구가 아닌 것은?',
    options: [
      { id: 'A', text: '의자' },
      { id: 'B', text: '책상' },
      { id: 'C', text: '침대' },
      { id: 'D', text: '연필' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(연필). 의자·책상·침대는 모두 가구이지만 연필은 필기구입니다. 사물을 기능별로 분류하는 능력을 봅니다.',
  },
  {
    id: 'ko-005',
    order_index: 5,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '"의사 : 병원 = 선생님 : ?" 빈칸에 알맞은 단어는?',
    options: [
      { id: 'A', text: '학생' },
      { id: 'B', text: '학교' },
      { id: 'C', text: '교과서' },
      { id: 'D', text: '수업' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(학교). 직업과 일하는 장소의 관계입니다. A/C/D는 학교 안의 요소들이지만 "일하는 장소"라는 관계에는 해당하지 않습니다.',
  },
  {
    id: 'ko-006',
    order_index: 6,
    category: 'verbal',
    difficulty: 3,
    locale: 'ko',
    question_text: '"발 : 양말 = 손 : ?" 빈칸에 알맞은 단어는?',
    options: [
      { id: 'A', text: '신발' },
      { id: 'B', text: '장갑' },
      { id: 'C', text: '모자' },
      { id: 'D', text: '시계' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(장갑). 신체 부위와 그 부위를 감싸는 의복의 관계입니다. A는 발에, C는 머리에, D는 손목 액세서리라 관계가 다릅니다.',
  },
  {
    id: 'ko-007',
    order_index: 7,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 중 의미가 가장 다른 단어는?',
    options: [
      { id: 'A', text: '거대하다' },
      { id: 'B', text: '광활하다' },
      { id: 'C', text: '협소하다' },
      { id: 'D', text: '방대하다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(협소하다 = 좁다). A·B·D는 모두 "크다/넓다"를 의미하는 유의어이므로 의미가 정반대인 C가 답입니다.',
  },
  {
    id: 'ko-008',
    order_index: 8,
    category: 'verbal',
    difficulty: 4,
    locale: 'ko',
    question_text: '"펜 : 글 = 붓 : ?" 빈칸에 알맞은 단어는?',
    options: [
      { id: 'A', text: '종이' },
      { id: 'B', text: '먹' },
      { id: 'C', text: '그림' },
      { id: 'D', text: '벼루' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(그림). 도구와 그 도구로 만드는 결과물의 관계입니다. A·B·D는 붓과 함께 쓰이는 재료/도구지만 "결과물"은 아닙니다.',
  },

  // ───── 수리 추론 (8문항) ─────
  {
    id: 'ko-009',
    order_index: 9,
    category: 'numerical',
    difficulty: 1,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  2, 4, 6, 8, ?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '10' },
      { id: 'C', text: '12' },
      { id: 'D', text: '14' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(10). 공차 2의 등차수열입니다. 8 + 2 = 10. 가장 기본적인 수열 패턴 인식을 봅니다.',
  },
  {
    id: 'ko-010',
    order_index: 10,
    category: 'numerical',
    difficulty: 2,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  3, 6, 12, 24, ?',
    options: [
      { id: 'A', text: '36' },
      { id: 'B', text: '42' },
      { id: 'C', text: '48' },
      { id: 'D', text: '60' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(48). 공비 2의 등비수열입니다(매번 2배). 24 × 2 = 48. A(+12)는 등차수열로 잘못 계산한 함정입니다.',
  },
  {
    id: 'ko-011',
    order_index: 11,
    category: 'numerical',
    difficulty: 2,
    locale: 'ko',
    question_text: '사과 3개에 1,200원이면 5개의 가격은?',
    options: [
      { id: 'A', text: '1,800원' },
      { id: 'B', text: '2,000원' },
      { id: 'C', text: '2,400원' },
      { id: 'D', text: '3,000원' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(2,000원). 1개당 단가 400원 → 5 × 400 = 2,000원. 비례 추론과 단위 환산 능력을 측정합니다.',
  },
  {
    id: 'ko-012',
    order_index: 12,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  1, 1, 2, 3, 5, 8, ?',
    options: [
      { id: 'A', text: '11' },
      { id: 'B', text: '13' },
      { id: 'C', text: '15' },
      { id: 'D', text: '21' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(13). 피보나치 수열로, 앞 두 수의 합이 다음 수입니다. 5 + 8 = 13. 비선형 패턴 인식을 봅니다.',
  },
  {
    id: 'ko-013',
    order_index: 13,
    category: 'numerical',
    difficulty: 3,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  1, 4, 9, 16, ?, 36',
    options: [
      { id: 'A', text: '20' },
      { id: 'B', text: '24' },
      { id: 'C', text: '25' },
      { id: 'D', text: '32' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(25). 각 항이 1², 2², 3², 4², 5², 6²인 제곱수열입니다. 5의 제곱 = 25. 패턴이 "+a"가 아닌 "×자기 자신"임을 잡아내는 게 핵심.',
  },
  {
    id: 'ko-014',
    order_index: 14,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 수열의 빈칸에 들어갈 수는?  2, 5, 11, 23, ?',
    options: [
      { id: 'A', text: '35' },
      { id: 'B', text: '41' },
      { id: 'C', text: '46' },
      { id: 'D', text: '47' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(47). 각 항은 직전 항에 2를 곱하고 1을 더한 값입니다 (×2 +1). 23 × 2 + 1 = 47. 복합 연산 패턴을 잡는 능력을 봅니다.',
  },
  {
    id: 'ko-015',
    order_index: 15,
    category: 'numerical',
    difficulty: 4,
    locale: 'ko',
    question_text: '4, 7, 11의 평균은?',
    options: [
      { id: 'A', text: '7' },
      { id: 'B', text: '7.3' },
      { id: 'C', text: '7.5' },
      { id: 'D', text: '8' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(7.3). 합 22 ÷ 개수 3 ≈ 7.333. 중앙값 7(A)과 헷갈리기 쉬운 함정 — 평균은 모든 값의 영향을 받습니다.',
  },
  {
    id: 'ko-016',
    order_index: 16,
    category: 'numerical',
    difficulty: 5,
    locale: 'ko',
    question_text: '시계가 정확히 3시일 때, 분침과 시침이 이루는 각도는?',
    options: [
      { id: 'A', text: '60도' },
      { id: 'B', text: '75도' },
      { id: 'C', text: '90도' },
      { id: 'D', text: '120도' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(90도). 시계 한 바퀴 360°를 12로 나누면 한 시간 칸은 30°. 3시간 차이 = 3 × 30° = 90°. 기하와 산술이 결합된 응용 문제.',
  },

  // ───── 공간 추론 (7문항) ─────
  {
    id: 'ko-017',
    order_index: 17,
    category: 'spatial',
    difficulty: 2,
    locale: 'ko',
    figure_id: 'cube-net-cross',
    question_text:
      '아래 전개도(십자 모양)를 접어 정육면체를 만들었을 때, 마주 보는 면의 쌍은 총 몇 쌍인가요?',
    options: [
      { id: 'A', text: '2쌍' },
      { id: 'B', text: '3쌍' },
      { id: 'C', text: '4쌍' },
      { id: 'D', text: '6쌍' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(3쌍). 정육면체는 6면이고 항상 2면씩 마주 보므로 6 ÷ 2 = 3쌍. 입체의 기본 속성에 대한 이해를 봅니다.',
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
      '정답은 A. "F"를 시계방향 90도 회전하면 윗부분이 오른쪽으로 향합니다. B는 180도, C는 270도, D는 거울상이라 다른 변환입니다.',
  },
  {
    id: 'ko-019',
    order_index: 19,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    question_text:
      '주사위에서 1의 반대편은 6, 2의 반대편은 5, 3의 반대편은 4입니다. 1, 2, 3이 보일 때, 보이지 않는 세 면의 합은?',
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '12' },
      { id: 'C', text: '15' },
      { id: 'D', text: '18' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(15). 보이지 않는 면은 보이는 면의 반대편이므로 6+5+4 = 15. 마주 보는 면의 합이 항상 7임을 이용하면 3 × 7 - (1+2+3) = 15로도 풀립니다.',
  },
  {
    id: 'ko-020',
    order_index: 20,
    category: 'spatial',
    difficulty: 3,
    locale: 'ko',
    figure_id: 'f-upright',
    question_text: '아래 글자를 거울에 비추었을 때 보이는 모습은? (좌우 반전)',
    options: [
      { id: 'A', figure_id: 'f-mirror' },
      { id: 'B', figure_id: 'f-rot180' },
      { id: 'C', figure_id: 'f-rot90' },
      { id: 'D', figure_id: 'f-rot270' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A. 거울상은 좌우만 반전된 모습입니다. B는 상하좌우가 모두 뒤집힌 180도 회전이고, C·D는 회전이므로 거울상과는 구분됩니다.',
  },
  {
    id: 'ko-021',
    order_index: 21,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '종이를 반으로 접은 후, 다시 반대 방향으로 한 번 더 접으면 펼쳤을 때 접힌 자국은 총 몇 줄이 되나요?',
    options: [
      { id: 'A', text: '1줄' },
      { id: 'B', text: '2줄' },
      { id: 'C', text: '3줄' },
      { id: 'D', text: '4줄' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(2줄). 가로 1번, 세로 1번 접었으므로 가로 자국 1줄 + 세로 자국 1줄 = 2줄입니다. 접기 순서를 머릿속에서 되짚어 시각화하는 능력을 봅니다.',
  },
  {
    id: 'ko-022',
    order_index: 22,
    category: 'spatial',
    difficulty: 4,
    locale: 'ko',
    figure_id: 'pyramid-3step',
    question_text: '아래 도형은 1cm 정육면체를 쌓아 만든 3단 피라미드입니다. 정육면체는 총 몇 개일까요?',
    options: [
      { id: 'A', text: '9개' },
      { id: 'B', text: '12개' },
      { id: 'C', text: '14개' },
      { id: 'D', text: '27개' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(14개). 1단(1²=1) + 2단(2²=4) + 3단(3²=9) = 14. D(27)는 3×3×3 정육면체로 잘못 계산한 함정입니다.',
  },
  {
    id: 'ko-023',
    order_index: 23,
    category: 'spatial',
    difficulty: 5,
    locale: 'ko',
    figure_id: 'painted-cube',
    question_text:
      '한 변이 3cm인 큰 정육면체의 모든 바깥 면에 색칠을 한 뒤, 한 변이 1cm인 작은 정육면체로 자릅니다. 세 면이 칠해진 작은 정육면체는 몇 개인가요?',
    options: [
      { id: 'A', text: '4개' },
      { id: 'B', text: '6개' },
      { id: 'C', text: '8개' },
      { id: 'D', text: '12개' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(8개). 세 면이 칠해지는 것은 꼭짓점에 위치한 큐브뿐이고, 정육면체의 꼭짓점은 8개입니다. B(6)는 면, D(12)는 모서리 개수로 헷갈리기 쉽습니다.',
  },

  // ───── 논리 추론 (7문항) ─────
  {
    id: 'ko-024',
    order_index: 24,
    category: 'logical',
    difficulty: 2,
    locale: 'ko',
    question_text: '모든 학생은 가방을 멘다. 민수는 학생이다. 따라서?',
    options: [
      { id: 'A', text: '민수는 가방을 멘다' },
      { id: 'B', text: '민수는 가방이 없다' },
      { id: 'C', text: '민수는 학생이 아니다' },
      { id: 'D', text: '알 수 없다' },
    ],
    correct_id: 'A',
    explanation:
      '정답은 A. 전형적인 삼단논법(대전제 + 소전제 → 결론). 두 전제가 참이면 결론도 반드시 참이므로 "알 수 없다"는 답이 될 수 없습니다.',
  },
  {
    id: 'ko-025',
    order_index: 25,
    category: 'logical',
    difficulty: 3,
    locale: 'ko',
    question_text: '비가 오면 우산을 쓴다. 우산을 쓰지 않았다. 그러므로?',
    options: [
      { id: 'A', text: '비가 왔다' },
      { id: 'B', text: '비가 오지 않았다' },
      { id: 'C', text: '비가 곧 올 것이다' },
      { id: 'D', text: '알 수 없다' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B. 대우 명제(modus tollens)의 적용입니다. "P이면 Q이다"가 참이면 "Q가 아니면 P가 아니다"도 참. 후건 부정 → 전건 부정.',
  },
  {
    id: 'ko-026',
    order_index: 26,
    category: 'logical',
    difficulty: 3,
    locale: 'ko',
    question_text:
      'A는 B보다 크다. B는 C보다 크다. C는 D보다 크다. 가장 작은 사람은?',
    options: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D. 추이적 관계(A > B > C > D)에 의해 D가 모든 사람보다 작습니다. 순서 추론과 부등호 합성 능력을 봅니다.',
  },
  {
    id: 'ko-027',
    order_index: 27,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text:
      '월요일, 화요일, 수요일... 의 순서로 진행될 때, 어제가 화요일이라면 모레는?',
    options: [
      { id: 'A', text: '목요일' },
      { id: 'B', text: '금요일' },
      { id: 'C', text: '토요일' },
      { id: 'D', text: '일요일' },
    ],
    correct_id: 'B',
    explanation:
      '정답은 B(금요일). 어제가 화요일이면 오늘은 수요일, 내일은 목요일, 모레는 금요일입니다. 시간 축에서의 정확한 위치 파악이 필요한 문항.',
  },
  {
    id: 'ko-028',
    order_index: 28,
    category: 'logical',
    difficulty: 4,
    locale: 'ko',
    question_text: '다음 중 나머지와 종류가 다른 것은?',
    options: [
      { id: 'A', text: '사자' },
      { id: 'B', text: '호랑이' },
      { id: 'C', text: '표범' },
      { id: 'D', text: '토끼' },
    ],
    correct_id: 'D',
    explanation:
      '정답은 D(토끼). A·B·C는 고양잇과 맹수이지만 토끼는 토끼목입니다. 분류 기준이 단순 동물이 아니라 "분류학적 과(family)" 단위라는 점이 핵심.',
  },
  {
    id: 'ko-029',
    order_index: 29,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '5명이 줄을 섰다. 갑은 을 앞에 있다. 병은 갑 앞에 있다. 정은 병 앞에 있다. 무는 가장 뒤에 있다. 맨 앞에 선 사람은?',
    options: [
      { id: 'A', text: '갑' },
      { id: 'B', text: '병' },
      { id: 'C', text: '정' },
      { id: 'D', text: '무' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C(정). 조건을 합치면 정 → 병 → 갑 → 을 → 무 순서. 여러 조건을 합성하여 유일한 정답을 도출하는 추리 문제.',
  },
  {
    id: 'ko-030',
    order_index: 30,
    category: 'logical',
    difficulty: 5,
    locale: 'ko',
    question_text:
      '진실만 말하는 사람과 거짓말만 하는 사람이 있다. 한 사람에게 "당신은 진실을 말하는 사람입니까?"라고 물었더니 "네"라고 답했다. 이 사람은?',
    options: [
      { id: 'A', text: '반드시 진실을 말하는 사람' },
      { id: 'B', text: '반드시 거짓말하는 사람' },
      { id: 'C', text: '둘 다 가능하다' },
      { id: 'D', text: '판단할 수 없다' },
    ],
    correct_id: 'C',
    explanation:
      '정답은 C. 진실을 말하는 사람은 사실대로 "네"라 답하고, 거짓말쟁이도 자기가 진실하다고 거짓으로 "네"라 답합니다. 같은 답이 나오므로 구분 불가.',
  },
];
