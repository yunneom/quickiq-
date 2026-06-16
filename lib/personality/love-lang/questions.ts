import type { PersonalityQuestion } from '../types';

// Entertainment purposes only. Original wording inspired by the general
// concept of five categories of expressing affection. Not affiliated with,
// nor copied from, any published work.

export const loveLangQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'll-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '연인이 어떻게 해줄 때 가장 사랑받는다고 느끼나요?',
    options: [
      { id: 'A', text: '"오늘 너 정말 멋졌어"라고 진심 어린 칭찬을 들을 때', scores: { words: 1 } },
      { id: 'B', text: '소파에서 자연스럽게 손을 잡고 어깨에 기댈 때', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '힘든 하루를 보낸 날, 연인의 어떤 행동이 가장 위로가 되나요?',
    options: [
      { id: 'A', text: '말없이 따뜻한 저녁을 차려놓고 기다려줄 때', scores: { service: 1 } },
      { id: 'B', text: '휴대폰을 내려놓고 온전히 내 이야기를 들어줄 때', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '기념일에 연인에게 가장 받고 싶은 것은?',
    options: [
      { id: 'A', text: '나를 떠올리며 고른 작지만 의미 있는 선물', scores: { gifts: 1 } },
      { id: 'B', text: '둘만을 위해 따로 비운 하루', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '연인과 다툰 뒤 화해할 때, 무엇이 마음을 가장 풀어주나요?',
    options: [
      { id: 'A', text: '"내가 미안했어, 너를 정말 아껴"라는 다정한 말', scores: { words: 1 } },
      { id: 'B', text: '꼭 안아주며 등을 토닥여주는 포옹', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '바쁜 한 주를 보내는 연인이 나를 챙겨준다면?',
    options: [
      { id: 'A', text: '내 차에 기름을 채워두거나 귀찮은 일을 대신 처리해줄 때', scores: { service: 1 } },
      { id: 'B', text: '출근길에 마실 커피 한 잔을 깜짝 선물로 건넬 때', scores: { gifts: 1 } },
    ],
  },
  {
    id: 'll-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '주말에 연인과 함께라면 가장 행복한 순간은?',
    options: [
      { id: 'A', text: '다른 약속 없이 둘이서 느긋하게 보내는 하루', scores: { time: 1 } },
      { id: 'B', text: '소파에 딱 붙어 앉아 영화 보며 살을 맞대는 시간', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '연인이 출장을 다녀온다면 가장 기대되는 것은?',
    options: [
      { id: 'A', text: '"네 생각하면서 골랐어" 하며 건네는 작은 기념품', scores: { gifts: 1 } },
      { id: 'B', text: '"네가 정말 보고 싶었어"라는 따뜻한 한마디', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '내가 아플 때 연인이 어떻게 해주면 가장 사랑받는 기분이 드나요?',
    options: [
      { id: 'A', text: '죽을 끓이고 약을 챙기며 묵묵히 돌봐줄 때', scores: { service: 1 } },
      { id: 'B', text: '옆에 누워 이마를 짚어주고 손을 꼭 잡아줄 때', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '연인과의 데이트에서 가장 기억에 남는 장면은?',
    options: [
      { id: 'A', text: '걸으며 손깍지를 끼고 팔짱을 끼던 순간', scores: { touch: 1 } },
      { id: 'B', text: '서로 눈을 보며 끝없이 대화하던 시간', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '연인이 나를 자랑스러워한다는 걸 느낄 때는?',
    options: [
      { id: 'A', text: '친구들 앞에서 "이 사람 정말 대단해"라고 말해줄 때', scores: { words: 1 } },
      { id: 'B', text: '말없이 내가 좋아하는 디저트를 사다 놓을 때', scores: { gifts: 1 } },
    ],
  },
  {
    id: 'll-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '이사처럼 큰일을 앞두고 있을 때, 연인의 어떤 모습이 든든한가요?',
    options: [
      { id: 'A', text: '소매를 걷어붙이고 짐을 함께 옮기며 도와줄 때', scores: { service: 1 } },
      { id: 'B', text: '"잘하고 있어, 우리 해낼 수 있어"라고 응원해줄 때', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '평범한 저녁, 연인의 어떤 행동에 마음이 가장 따뜻해지나요?',
    options: [
      { id: 'A', text: '설거지나 청소를 먼저 해두고 쉬게 해줄 때', scores: { service: 1 } },
      { id: 'B', text: '"오늘 하루 어땠어?" 하며 곁에 앉아 함께 있어줄 때', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '연인이 평소 나를 떠올린다는 걸 어떻게 느끼고 싶나요?',
    options: [
      { id: 'A', text: '길에서 보고 "딱 너 같아서" 사 온 작은 물건으로', scores: { gifts: 1 } },
      { id: 'B', text: '낮에 보내온 "보고 싶다"는 다정한 메시지로', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '오랜만에 만난 연인에게 가장 바라는 첫 순간은?',
    options: [
      { id: 'A', text: '달려와 와락 끌어안아 주는 포옹', scores: { touch: 1 } },
      { id: 'B', text: '다른 일정 다 미루고 나에게만 집중하는 저녁', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '연인의 사랑을 가장 깊게 느끼는 사소한 순간은?',
    options: [
      { id: 'A', text: '말하지 않아도 내가 필요한 일을 알아서 해줄 때', scores: { service: 1 } },
      { id: 'B', text: '깜짝 선물을 내밀며 "이거 너 주려고" 할 때', scores: { gifts: 1 } },
    ],
  },
];

export const loveLangQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'll-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'When do you feel most loved by your partner?',
    options: [
      { id: 'A', text: 'When they say "You were amazing today" and clearly mean it', scores: { words: 1 } },
      { id: 'B', text: 'When they reach for your hand and lean into you on the couch', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-en-02',
    order_index: 2,
    locale: 'en',
    question_text: 'After a rough day, what comforts you most from your partner?',
    options: [
      { id: 'A', text: 'A warm dinner quietly made and waiting for you', scores: { service: 1 } },
      { id: 'B', text: 'Them putting the phone down to fully listen to you', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'What would you most love to receive on your anniversary?',
    options: [
      { id: 'A', text: 'A small but meaningful gift they picked thinking of you', scores: { gifts: 1 } },
      { id: 'B', text: 'A whole day cleared just for the two of you', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-en-04',
    order_index: 4,
    locale: 'en',
    question_text: 'When making up after a fight, what eases your heart the most?',
    options: [
      { id: 'A', text: 'A tender "I\'m sorry, I really cherish you"', scores: { words: 1 } },
      { id: 'B', text: 'A long hug with a gentle pat on the back', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-en-05',
    order_index: 5,
    locale: 'en',
    question_text: 'During a hectic week, how would you love your partner to look out for you?',
    options: [
      { id: 'A', text: 'By filling up your gas tank or handling an annoying errand for you', scores: { service: 1 } },
      { id: 'B', text: 'By surprising you with a coffee for your morning commute', scores: { gifts: 1 } },
    ],
  },
  {
    id: 'll-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'What is your happiest moment when spending a weekend together?',
    options: [
      { id: 'A', text: 'A slow, unhurried day with no other plans but each other', scores: { time: 1 } },
      { id: 'B', text: 'Curling up side by side, bodies close, watching a movie', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'When your partner returns from a trip, what are you most excited for?',
    options: [
      { id: 'A', text: 'A little souvenir with "I saw this and thought of you"', scores: { gifts: 1 } },
      { id: 'B', text: 'A heartfelt "I missed you so much"', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'When you are sick, what makes you feel most loved?',
    options: [
      { id: 'A', text: 'Them quietly cooking soup and keeping your meds on hand', scores: { service: 1 } },
      { id: 'B', text: 'Them lying beside you, feeling your forehead, holding your hand', scores: { touch: 1 } },
    ],
  },
  {
    id: 'll-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'What stays with you most from a date together?',
    options: [
      { id: 'A', text: 'Walking with fingers laced and arms linked', scores: { touch: 1 } },
      { id: 'B', text: 'Talking endlessly while looking into each other\'s eyes', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-en-10',
    order_index: 10,
    locale: 'en',
    question_text: 'How do you most feel your partner is proud of you?',
    options: [
      { id: 'A', text: 'When they tell their friends "this person is incredible"', scores: { words: 1 } },
      { id: 'B', text: 'When they quietly pick up your favorite dessert for you', scores: { gifts: 1 } },
    ],
  },
  {
    id: 'll-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'Facing something big like a move, what reassures you most about your partner?',
    options: [
      { id: 'A', text: 'When they roll up their sleeves and carry boxes with you', scores: { service: 1 } },
      { id: 'B', text: 'When they cheer "You\'ve got this, we can do it together"', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-en-12',
    order_index: 12,
    locale: 'en',
    question_text: 'On an ordinary evening, what warms your heart most?',
    options: [
      { id: 'A', text: 'When they do the dishes or tidy up first so you can rest', scores: { service: 1 } },
      { id: 'B', text: 'When they sit beside you and ask "How was your day?"', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'How do you most like to feel that your partner is thinking of you?',
    options: [
      { id: 'A', text: 'A little something they grabbed because "it was so you"', scores: { gifts: 1 } },
      { id: 'B', text: 'A sweet midday text saying "I miss you"', scores: { words: 1 } },
    ],
  },
  {
    id: 'll-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'Reuniting after time apart, what first moment do you crave most?',
    options: [
      { id: 'A', text: 'Them rushing over to wrap you in a tight hug', scores: { touch: 1 } },
      { id: 'B', text: 'An evening with everything else set aside, all eyes on you', scores: { time: 1 } },
    ],
  },
  {
    id: 'll-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'In what small moment do you feel your partner\'s love most deeply?',
    options: [
      { id: 'A', text: 'When they handle what you need before you even ask', scores: { service: 1 } },
      { id: 'B', text: 'When they hand you a surprise saying "I got this for you"', scores: { gifts: 1 } },
    ],
  },
];
