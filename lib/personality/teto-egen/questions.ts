import type { PersonalityQuestion } from '../types';

/**
 * 15 questions × 2 locales for the 테토/에겐 (Testosterone/Estrogen)
 * personality test. Each option grants +2 (strong) or +1 (mild) to the
 * T or E axis. After all answers, dominant axis × selected gender →
 * one of 4 profiles (teto-male / teto-female / egen-male / egen-female).
 *
 * Content is entertainment-grade pop psychology — clearly labeled
 * "재미용 · 과학적 검사 아님" on the result page. No clinical claims.
 */

export const tetoEgenQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'te-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '친구가 고민을 털어놓을 때 당신의 첫 반응은?',
    options: [
      { id: 'A', text: '"이렇게 해봐" — 바로 해결책 제시', scores: { T: 2 } },
      { id: 'B', text: '"왜 그랬어?" — 상황을 더 분석', scores: { T: 1 } },
      { id: 'C', text: '"속상했겠다" — 일단 공감부터', scores: { E: 1 } },
      { id: 'D', text: '"내가 옆에 있어줄게" — 정서적 지지', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '주말에 가장 끌리는 활동은?',
    options: [
      { id: 'A', text: '헬스장, 등산, 격렬한 스포츠', scores: { T: 2 } },
      { id: 'B', text: '드라이브, 새로운 장소 탐험', scores: { T: 1 } },
      { id: 'C', text: '카페에서 책 읽기, 음악 감상', scores: { E: 1 } },
      { id: 'D', text: '집에서 영화 보며 푹 쉬기', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '회의에서 의견 충돌이 생기면?',
    options: [
      { id: 'A', text: '내 입장을 강하게 밀어붙인다', scores: { T: 2 } },
      { id: 'B', text: '논리로 설득하려 한다', scores: { T: 1 } },
      { id: 'C', text: '서로의 입장을 듣고 절충안 찾기', scores: { E: 1 } },
      { id: 'D', text: '분위기 안 좋아질까봐 양보한다', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '스트레스를 풀 때 가장 효과적인 방법은?',
    options: [
      { id: 'A', text: '운동으로 땀 빼기', scores: { T: 2 } },
      { id: 'B', text: '맛집 가서 매운 거 먹기', scores: { T: 1 } },
      { id: 'C', text: '친구랑 수다 떨기', scores: { E: 1 } },
      { id: 'D', text: '따뜻한 차 마시며 혼자 정리', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '쇼핑할 때 우선순위는?',
    options: [
      { id: 'A', text: '기능, 가성비, 실용성', scores: { T: 2 } },
      { id: 'B', text: '브랜드, 품질', scores: { T: 1 } },
      { id: 'C', text: '디자인, 컬러', scores: { E: 1 } },
      { id: 'D', text: '느낌, 첫인상에 끌리면 그냥 산다', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '새로운 사람과 만났을 때 첫 인상은?',
    options: [
      { id: 'A', text: '"이 사람 어떤 사람일까" 빠르게 파악', scores: { T: 2 } },
      { id: 'B', text: '핵심 질문 몇 개 던져본다', scores: { T: 1 } },
      { id: 'C', text: '편하게 분위기 만들려고 노력', scores: { E: 1 } },
      { id: 'D', text: '상대 표정·말투에서 감정을 읽는다', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '연인이 갑자기 기분 나빠 보일 때 당신은?',
    options: [
      { id: 'A', text: '"왜 그래? 무슨 일?" 바로 직설적으로 물어봄', scores: { T: 2 } },
      { id: 'B', text: '"기분 풀려면 뭐 할까?" 행동으로 해결 시도', scores: { T: 1 } },
      { id: 'C', text: '"내가 뭐 잘못했나..." 먼저 살핀다', scores: { E: 1 } },
      { id: 'D', text: '말없이 옆에 있어주며 분위기 가라앉길 기다림', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '결정을 내릴 때 더 중요한 것은?',
    options: [
      { id: 'A', text: '효율과 결과', scores: { T: 2 } },
      { id: 'B', text: '데이터와 사실', scores: { T: 1 } },
      { id: 'C', text: '관계와 분위기', scores: { E: 1 } },
      { id: 'D', text: '내 마음의 편안함', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '좋아하는 사람에게 마음을 표현하는 방식은?',
    options: [
      { id: 'A', text: '바로 직진, "나 너 좋아해" 직설적', scores: { T: 2 } },
      { id: 'B', text: '데이트 제안으로 행동으로 보여줌', scores: { T: 1 } },
      { id: 'C', text: '편지나 메시지로 마음을 글로 적음', scores: { E: 1 } },
      { id: 'D', text: '조심스럽게 눈치 보며 천천히', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '여행 스타일은?',
    options: [
      { id: 'A', text: '액티비티 위주, 한 곳에서 최대한 많이 경험', scores: { T: 2 } },
      { id: 'B', text: '계획 빡빡하게 짜서 효율적으로', scores: { T: 1 } },
      { id: 'C', text: '카페·맛집·풍경 위주, 사진 많이', scores: { E: 1 } },
      { id: 'D', text: '한 곳에 머물며 여유롭게 힐링', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '말투의 특징은?',
    options: [
      { id: 'A', text: '단도직입, 결론부터 말함', scores: { T: 2 } },
      { id: 'B', text: '논리적, 인과관계 명확히', scores: { T: 1 } },
      { id: 'C', text: '부드럽고 둥글둥글', scores: { E: 1 } },
      { id: 'D', text: '감성적, 비유와 형용사 많음', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '갈등 상황에서 당신은?',
    options: [
      { id: 'A', text: '맞붙어서 끝장 본다', scores: { T: 2 } },
      { id: 'B', text: '내 입장 명확히 말하고 협상', scores: { T: 1 } },
      { id: 'C', text: '한 발 양보해서 풀어보려 함', scores: { E: 1 } },
      { id: 'D', text: '회피, 시간이 해결해주길 바람', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '주변에서 당신을 자주 부르는 말은?',
    options: [
      { id: 'A', text: '"든든하다", "리더십 있다"', scores: { T: 2 } },
      { id: 'B', text: '"똑똑하다", "추진력 있다"', scores: { T: 1 } },
      { id: 'C', text: '"따뜻하다", "잘 들어준다"', scores: { E: 1 } },
      { id: 'D', text: '"순수하다", "감성적이다"', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '연인과 다툰 후 화해 방식은?',
    options: [
      { id: 'A', text: '먼저 사과하고 빨리 끝낸다', scores: { T: 2 } },
      { id: 'B', text: '문제 원인을 짚어가며 대화', scores: { T: 1 } },
      { id: 'C', text: '편지나 작은 선물로 마음 전함', scores: { E: 1 } },
      { id: 'D', text: '시간을 두고 감정이 가라앉길 기다림', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '인생에서 가장 중요하다고 느끼는 가치는?',
    options: [
      { id: 'A', text: '성취와 성공', scores: { T: 2 } },
      { id: 'B', text: '독립과 자유', scores: { T: 1 } },
      { id: 'C', text: '사랑과 관계', scores: { E: 1 } },
      { id: 'D', text: '평온과 행복', scores: { E: 2 } },
    ],
  },
];

export const tetoEgenQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'te-en-01',
    order_index: 1,
    locale: 'en',
    question_text: "When a friend opens up about a problem, your first reaction is to:",
    options: [
      { id: 'A', text: '"Try this" — jump straight to a solution', scores: { T: 2 } },
      { id: 'B', text: '"Why did that happen?" — analyze the situation', scores: { T: 1 } },
      { id: 'C', text: '"That must hurt" — empathize first', scores: { E: 1 } },
      { id: 'D', text: '"I\'m here for you" — give emotional support', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-02',
    order_index: 2,
    locale: 'en',
    question_text: 'Your ideal weekend activity is:',
    options: [
      { id: 'A', text: 'Gym, hiking, intense sports', scores: { T: 2 } },
      { id: 'B', text: 'A road trip or exploring somewhere new', scores: { T: 1 } },
      { id: 'C', text: 'Reading at a café, listening to music', scores: { E: 1 } },
      { id: 'D', text: 'Watching movies at home, full rest', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'When opinions clash in a meeting, you:',
    options: [
      { id: 'A', text: 'Push your position hard', scores: { T: 2 } },
      { id: 'B', text: 'Try to convince others with logic', scores: { T: 1 } },
      { id: 'C', text: 'Listen and look for middle ground', scores: { E: 1 } },
      { id: 'D', text: 'Give in to keep the peace', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-04',
    order_index: 4,
    locale: 'en',
    question_text: 'The best way for you to relieve stress is:',
    options: [
      { id: 'A', text: 'Sweating it out at the gym', scores: { T: 2 } },
      { id: 'B', text: 'Eating something spicy or bold', scores: { T: 1 } },
      { id: 'C', text: 'Catching up with a friend', scores: { E: 1 } },
      { id: 'D', text: 'Quiet tea time alone', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-05',
    order_index: 5,
    locale: 'en',
    question_text: 'When shopping, your priority is:',
    options: [
      { id: 'A', text: 'Function, value, practicality', scores: { T: 2 } },
      { id: 'B', text: 'Brand and quality', scores: { T: 1 } },
      { id: 'C', text: 'Design and color', scores: { E: 1 } },
      { id: 'D', text: 'Vibe — if it feels right, buy it', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'Meeting someone new, your first instinct is to:',
    options: [
      { id: 'A', text: 'Size them up quickly', scores: { T: 2 } },
      { id: 'B', text: 'Ask a few sharp questions', scores: { T: 1 } },
      { id: 'C', text: 'Make the mood relaxed', scores: { E: 1 } },
      { id: 'D', text: 'Read their tone and expressions', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'When your partner suddenly seems upset, you:',
    options: [
      { id: 'A', text: '"What\'s wrong?" — ask directly', scores: { T: 2 } },
      { id: 'B', text: '"What can we do?" — try to act on it', scores: { T: 1 } },
      { id: 'C', text: '"Did I do something?" — self-check first', scores: { E: 1 } },
      { id: 'D', text: 'Stay quietly beside them and wait', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'When making decisions, what matters more?',
    options: [
      { id: 'A', text: 'Efficiency and outcome', scores: { T: 2 } },
      { id: 'B', text: 'Data and facts', scores: { T: 1 } },
      { id: 'C', text: 'Relationships and mood', scores: { E: 1 } },
      { id: 'D', text: 'My own peace of mind', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'How you express feelings to a crush:',
    options: [
      { id: 'A', text: '"I like you" — direct and bold', scores: { T: 2 } },
      { id: 'B', text: 'Suggest a date — show through action', scores: { T: 1 } },
      { id: 'C', text: 'A letter or message — written feelings', scores: { E: 1 } },
      { id: 'D', text: 'Slowly, reading signals carefully', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-10',
    order_index: 10,
    locale: 'en',
    question_text: 'Your travel style:',
    options: [
      { id: 'A', text: 'Activity-packed, do as much as possible', scores: { T: 2 } },
      { id: 'B', text: 'Tightly planned for efficiency', scores: { T: 1 } },
      { id: 'C', text: 'Cafés, food, scenery, photos', scores: { E: 1 } },
      { id: 'D', text: 'Stay in one place, slow healing trip', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'Your speaking style:',
    options: [
      { id: 'A', text: 'Straight to the point, bottom line first', scores: { T: 2 } },
      { id: 'B', text: 'Logical, clear cause and effect', scores: { T: 1 } },
      { id: 'C', text: 'Soft and rounded', scores: { E: 1 } },
      { id: 'D', text: 'Emotional, full of metaphors', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-12',
    order_index: 12,
    locale: 'en',
    question_text: 'In a conflict, you:',
    options: [
      { id: 'A', text: 'Face it head-on until resolved', scores: { T: 2 } },
      { id: 'B', text: 'State your position and negotiate', scores: { T: 1 } },
      { id: 'C', text: 'Yield a step to ease things', scores: { E: 1 } },
      { id: 'D', text: 'Avoid it, hope time heals', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'What people often call you:',
    options: [
      { id: 'A', text: '"Reliable", "natural leader"', scores: { T: 2 } },
      { id: 'B', text: '"Sharp", "driven"', scores: { T: 1 } },
      { id: 'C', text: '"Warm", "great listener"', scores: { E: 1 } },
      { id: 'D', text: '"Pure-hearted", "sensitive"', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'After a fight with a partner, you make up by:',
    options: [
      { id: 'A', text: 'Apologizing first, ending it quickly', scores: { T: 2 } },
      { id: 'B', text: 'Talking through the root cause', scores: { T: 1 } },
      { id: 'C', text: 'A small gift or written note', scores: { E: 1 } },
      { id: 'D', text: 'Giving it time, letting emotions settle', scores: { E: 2 } },
    ],
  },
  {
    id: 'te-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'The value most important to you in life:',
    options: [
      { id: 'A', text: 'Achievement and success', scores: { T: 2 } },
      { id: 'B', text: 'Independence and freedom', scores: { T: 1 } },
      { id: 'C', text: 'Love and connection', scores: { E: 1 } },
      { id: 'D', text: 'Peace and happiness', scores: { E: 2 } },
    ],
  },
];
