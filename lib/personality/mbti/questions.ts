import type { PersonalityQuestion } from '../types';

export const mbtiQuestionsKo: PersonalityQuestion[] = [
  // E/I (q1-5)
  {
    id: 'mb-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '주말 동안 사회생활로 에너지가 다 빠졌다. 다음 주말을 보내는 방식은?',
    options: [
      { id: 'A', text: '친구들 불러서 또 놀아야 충전이 된다', scores: { E: 1 } },
      { id: 'B', text: '집에서 혼자 조용히 쉬어야 충전이 된다', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '처음 간 모임에서 아는 사람이 거의 없을 때 나는?',
    options: [
      { id: 'A', text: '먼저 다가가 말을 걸며 분위기를 푼다', scores: { E: 1 } },
      { id: 'B', text: '누가 말 걸어줄 때까지 조용히 관찰한다', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '고민이 생겼을 때 머릿속을 정리하는 방법은?',
    options: [
      { id: 'A', text: '누군가에게 말하면서 생각이 정리된다', scores: { E: 1 } },
      { id: 'B', text: '혼자 충분히 곱씹은 뒤에야 입을 연다', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '점심시간, 동료들이 다 같이 먹으러 가자고 한다. 솔직한 마음은?',
    options: [
      { id: 'A', text: '좋지! 여럿이 같이 먹는 게 즐겁다', scores: { E: 1 } },
      { id: 'B', text: '가끔은 혼자 조용히 먹으며 쉬고 싶다', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '주말에 갑자기 친구가 "지금 나올래?" 라고 연락하면?',
    options: [
      { id: 'A', text: '오, 좋지! 바로 준비하고 나간다', scores: { E: 1 } },
      { id: 'B', text: '갑작스러운 약속은 부담스러워 망설인다', scores: { I: 1 } },
    ],
  },
  // S/N (q6-10)
  {
    id: 'mb-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '새 가전제품을 샀다. 사용 설명서를 대하는 태도는?',
    options: [
      { id: 'A', text: '순서대로 꼼꼼히 읽고 그대로 따라 한다', scores: { S: 1 } },
      { id: 'B', text: '일단 이것저것 눌러보며 감으로 익힌다', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '어떤 이야기를 들을 때 더 관심이 가는 쪽은?',
    options: [
      { id: 'A', text: '실제로 무슨 일이 있었는지 구체적인 사실', scores: { S: 1 } },
      { id: 'B', text: '그게 결국 무엇을 의미하는지 숨은 뜻', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '여행 계획을 세울 때 나는?',
    options: [
      { id: 'A', text: '검증된 맛집과 동선을 현실적으로 짠다', scores: { S: 1 } },
      { id: 'B', text: '"여기서 이런 일도 생기지 않을까" 상상부터 한다', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '일을 처리할 때 나에게 더 잘 맞는 방식은?',
    options: [
      { id: 'A', text: '검증된 방법을 차근차근 적용하는 것', scores: { S: 1 } },
      { id: 'B', text: '새로운 방식을 떠올려 시도해 보는 것', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '대화 중 "그래서 핵심이 뭔데?" 라는 말을 들으면?',
    options: [
      { id: 'A', text: '나는 원래 사실을 차례대로 자세히 말하는 편', scores: { S: 1 } },
      { id: 'B', text: '나는 자꾸 이런저런 가능성으로 이야기가 샌다', scores: { N: 1 } },
    ],
  },
  // T/F (q11-15)
  {
    id: 'mb-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '친구가 고민을 털어놓을 때 나의 첫 반응은?',
    options: [
      { id: 'A', text: '문제를 분석하고 해결책을 제시한다', scores: { T: 1 } },
      { id: 'B', text: '먼저 마음에 공감하고 위로한다', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '의견 충돌이 있을 때 더 중요하게 여기는 것은?',
    options: [
      { id: 'A', text: '누가 맞는지, 논리적으로 옳은 결론', scores: { T: 1 } },
      { id: 'B', text: '서로 상하지 않게 관계를 지키는 것', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '결정을 내릴 때 더 크게 작용하는 기준은?',
    options: [
      { id: 'A', text: '객관적인 사실과 효율', scores: { T: 1 } },
      { id: 'B', text: '관련된 사람들의 감정', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '누군가의 결과물을 평가해야 할 때 나는?',
    options: [
      { id: 'A', text: '솔직하게 잘못된 점을 짚어 주는 게 도움이라 본다', scores: { T: 1 } },
      { id: 'B', text: '상처받지 않게 표현을 고르며 조심한다', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '"넌 너무 차갑다" vs "넌 너무 무르다" 중 더 자주 듣는 말은?',
    options: [
      { id: 'A', text: '차갑다, 냉정하다는 말을 더 듣는다', scores: { T: 1 } },
      { id: 'B', text: '여리다, 정에 약하다는 말을 더 듣는다', scores: { F: 1 } },
    ],
  },
  // J/P (q16-20)
  {
    id: 'mb-ko-16',
    order_index: 16,
    locale: 'ko',
    question_text: '여행 가방을 싸는 나의 스타일은?',
    options: [
      { id: 'A', text: '체크리스트로 며칠 전부터 미리 챙긴다', scores: { J: 1 } },
      { id: 'B', text: '떠나기 직전에 후다닥 몰아서 싼다', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-ko-17',
    order_index: 17,
    locale: 'ko',
    question_text: '할 일이 생겼을 때 마음이 더 편한 쪽은?',
    options: [
      { id: 'A', text: '빨리 끝내 놓고 마음 놓는 게 편하다', scores: { J: 1 } },
      { id: 'B', text: '마감이 닥쳐야 집중이 잘 된다', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-ko-18',
    order_index: 18,
    locale: 'ko',
    question_text: '주말 일정에 대한 나의 선호는?',
    options: [
      { id: 'A', text: '어디서 뭘 할지 미리 정해 두어야 안심된다', scores: { J: 1 } },
      { id: 'B', text: '그날 기분 따라 즉흥적으로 움직이는 게 좋다', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-ko-19',
    order_index: 19,
    locale: 'ko',
    question_text: '계획이 갑자기 틀어졌을 때 나의 반응은?',
    options: [
      { id: 'A', text: '예상 밖 변수에 스트레스를 받는다', scores: { J: 1 } },
      { id: 'B', text: '"뭐 어때" 하며 금방 적응한다', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-ko-20',
    order_index: 20,
    locale: 'ko',
    question_text: '내 책상이나 방의 평소 상태는?',
    options: [
      { id: 'A', text: '제자리에 정리되어 있어야 일이 손에 잡힌다', scores: { J: 1 } },
      { id: 'B', text: '좀 어질러져 있어도 나만의 질서가 있다', scores: { P: 1 } },
    ],
  },
];

export const mbtiQuestionsEn: PersonalityQuestion[] = [
  // E/I (q1-5)
  {
    id: 'mb-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'A weekend of socializing has left you drained. How do you want to spend next weekend?',
    options: [
      { id: 'A', text: 'Call up friends again — being around people recharges me', scores: { E: 1 } },
      { id: 'B', text: 'Stay in and have some quiet time alone to recharge', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-en-02',
    order_index: 2,
    locale: 'en',
    question_text: "You walk into a party where you barely know anyone. What do you do?",
    options: [
      { id: 'A', text: 'Walk up and start chatting to break the ice', scores: { E: 1 } },
      { id: 'B', text: 'Hang back quietly until someone approaches me', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'When something is weighing on your mind, how do you sort it out?',
    options: [
      { id: 'A', text: 'I think out loud — talking it through clears my head', scores: { E: 1 } },
      { id: 'B', text: 'I chew on it alone first, then speak once I have it figured out', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-en-04',
    order_index: 4,
    locale: 'en',
    question_text: "It's lunchtime and coworkers invite the whole team out. Honestly, you feel?",
    options: [
      { id: 'A', text: 'Great — eating with a crowd is the fun part of the day', scores: { E: 1 } },
      { id: 'B', text: 'Sometimes I just want to eat alone and decompress', scores: { I: 1 } },
    ],
  },
  {
    id: 'mb-en-05',
    order_index: 5,
    locale: 'en',
    question_text: 'A friend texts out of the blue: "Want to hang out right now?" Your reaction?',
    options: [
      { id: 'A', text: 'Yes! I throw on clothes and head out immediately', scores: { E: 1 } },
      { id: 'B', text: 'Last-minute plans stress me out — I hesitate', scores: { I: 1 } },
    ],
  },
  // S/N (q6-10)
  {
    id: 'mb-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'You just bought a new gadget. What do you do with the manual?',
    options: [
      { id: 'A', text: 'Read it step by step and follow it exactly', scores: { S: 1 } },
      { id: 'B', text: 'Start pressing buttons and figure it out by feel', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'When someone tells you a story, what grabs your attention more?',
    options: [
      { id: 'A', text: 'The concrete details of what actually happened', scores: { S: 1 } },
      { id: 'B', text: 'What it all means and where it could lead', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'When planning a trip, you tend to?',
    options: [
      { id: 'A', text: 'Map out proven spots and a realistic route', scores: { S: 1 } },
      { id: 'B', text: 'Daydream about all the adventures that might happen', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'When tackling a task, which approach suits you better?',
    options: [
      { id: 'A', text: 'Applying a tried-and-true method, step by step', scores: { S: 1 } },
      { id: 'B', text: 'Dreaming up a new way and giving it a shot', scores: { N: 1 } },
    ],
  },
  {
    id: 'mb-en-10',
    order_index: 10,
    locale: 'en',
    question_text: 'Mid-conversation, someone asks "So what\'s the point?" That\'s because?',
    options: [
      { id: 'A', text: 'I tend to lay out the facts in careful detail', scores: { S: 1 } },
      { id: 'B', text: 'I keep drifting off into possibilities and tangents', scores: { N: 1 } },
    ],
  },
  // T/F (q11-15)
  {
    id: 'mb-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'A friend opens up about a problem. Your first instinct is to?',
    options: [
      { id: 'A', text: 'Analyze the issue and offer a solution', scores: { T: 1 } },
      { id: 'B', text: 'Empathize first and offer comfort', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-en-12',
    order_index: 12,
    locale: 'en',
    question_text: 'In a disagreement, what matters more to you?',
    options: [
      { id: 'A', text: "Who's right — reaching the logically correct conclusion", scores: { T: 1 } },
      { id: 'B', text: 'Keeping the relationship intact and feelings unhurt', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'When making a decision, what weighs on you more?',
    options: [
      { id: 'A', text: 'Objective facts and efficiency', scores: { T: 1 } },
      { id: 'B', text: 'How the people involved will feel', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-en-14',
    order_index: 14,
    locale: 'en',
    question_text: "When you have to give feedback on someone's work, you?",
    options: [
      { id: 'A', text: 'Point out the flaws honestly — that\'s what actually helps', scores: { T: 1 } },
      { id: 'B', text: 'Choose your words carefully so they don\'t feel hurt', scores: { F: 1 } },
    ],
  },
  {
    id: 'mb-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'Which do you hear more often: "You\'re too cold" or "You\'re too soft"?',
    options: [
      { id: 'A', text: 'People say I come across as cold or detached', scores: { T: 1 } },
      { id: 'B', text: 'People say I\'m too soft-hearted or sensitive', scores: { F: 1 } },
    ],
  },
  // J/P (q16-20)
  {
    id: 'mb-en-16',
    order_index: 16,
    locale: 'en',
    question_text: 'How do you pack for a trip?',
    options: [
      { id: 'A', text: 'With a checklist, days in advance', scores: { J: 1 } },
      { id: 'B', text: 'In a mad rush right before I leave', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-en-17',
    order_index: 17,
    locale: 'en',
    question_text: 'When a task lands on your plate, which feels better?',
    options: [
      { id: 'A', text: 'Knocking it out early so I can relax', scores: { J: 1 } },
      { id: 'B', text: 'Waiting until the deadline kicks my focus in', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-en-18',
    order_index: 18,
    locale: 'en',
    question_text: "What's your ideal way to handle weekend plans?",
    options: [
      { id: 'A', text: 'Decide where and what in advance — it puts me at ease', scores: { J: 1 } },
      { id: 'B', text: 'Go with the flow and decide on the fly', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-en-19',
    order_index: 19,
    locale: 'en',
    question_text: 'A plan suddenly falls apart. How do you react?',
    options: [
      { id: 'A', text: 'Unexpected curveballs stress me out', scores: { J: 1 } },
      { id: 'B', text: '"Whatever works" — I roll with it quickly', scores: { P: 1 } },
    ],
  },
  {
    id: 'mb-en-20',
    order_index: 20,
    locale: 'en',
    question_text: "What's the usual state of your desk or room?",
    options: [
      { id: 'A', text: 'Tidy and in order — I can\'t focus otherwise', scores: { J: 1 } },
      { id: 'B', text: 'A bit messy, but it\'s my own kind of order', scores: { P: 1 } },
    ],
  },
];
