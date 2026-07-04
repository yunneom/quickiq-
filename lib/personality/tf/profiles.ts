import type { PersonalityProfile } from '../types';

export const tfProfilesKo: Record<string, PersonalityProfile> = {
  'facts-t': {
    id: 'facts-t',
    name: '팩폭머신 T 🤖',
    tagline: '"그래서 결론이 뭔데?"가 입버릇',
    description:
      '당신의 뇌는 항상 문제 해결 모드입니다. 친구의 하소연을 듣다 보면 나도 모르게 원인 분석과 해결책 3가지가 정리되어 있죠. 위로가 서툰 게 아니라, 당신에게는 "해결해주는 것"이 최고의 위로이기 때문입니다. 다만 세상 사람 절반은 답이 아니라 공감을 원한다는 것, 그것만 기억하면 무적입니다.',
    strengths: [
      '문제의 핵심을 정확하고 빠르게 짚는다',
      '감정에 휩쓸리지 않고 냉철하게 판단한다',
      '돌려 말하지 않아 오해가 없다',
      '위기 상황에서 가장 믿음직한 사람',
      '조언의 실전 적중률이 높다',
    ],
    weaknesses: [
      '위로가 필요한 순간에 팩트를 날려 분위기를 얼린다',
      '"너 T야?" 소리를 주 3회 이상 듣는다',
      '상대의 서운함을 눈치채는 데 시간이 걸린다',
    ],
    compatibility: {
      'facts-t': '효율 만렙 대화. 단, 둘 다 위로는 포기해야 한다.',
      'soft-t': '논리 코드가 맞아 편안한 조합. 대화가 착착 진행된다.',
      'warm-f': '당신의 팩트를 부드럽게 통역해주는 고마운 존재.',
      'tearful-f': '⭐ 정반대라서 오히려 배울 게 가장 많은 짝.',
    },
  },
  'soft-t': {
    id: 'soft-t',
    name: '스윗한 T 🧊',
    tagline: '논리적인데 포장까지 할 줄 아는',
    description:
      '본질은 T지만 사회화가 아주 잘 된 타입입니다. 머릿속에선 이미 결론이 나왔지만, 상대의 기분을 봐가며 말할 타이밍과 수위를 조절할 줄 알죠. "팩트를 말하되 아프지 않게" — 이 어려운 기술을 구사하는 당신은 사실 대화계의 고수입니다.',
    strengths: [
      '논리와 배려의 밸런스가 좋다',
      '갈등 상황에서 중재자 역할을 잘한다',
      '피드백을 기분 나쁘지 않게 전달한다',
      '들을 때는 듣고, 말할 때는 말한다',
    ],
    weaknesses: [
      '속으로는 답답한데 겉으로 참는 일이 많다',
      '너무 재다가 말할 타이밍을 놓치기도 한다',
      '가끔은 그냥 시원하게 팩폭하고 싶다',
    ],
    compatibility: {
      'facts-t': '논리 코드가 맞아 편안한 조합. 대화가 착착 진행된다.',
      'soft-t': '서로 배려하다가 결정이 늦어지는 것만 조심.',
      'warm-f': '⭐ 서로의 언어를 반쯤 알아듣는 최적의 밸런스.',
      'tearful-f': '당신의 다정한 논리가 F의 마음을 잘 잡아준다.',
    },
  },
  'warm-f': {
    id: 'warm-f',
    name: '온기충전 F 🧸',
    tagline: '공감 먼저, 해결책은 그다음',
    description:
      '당신과 대화하면 사람들은 "이해받았다"는 느낌을 받습니다. 상대의 표정, 말투, 침묵까지 읽어내는 정서 레이더가 기본 탑재되어 있죠. 해결책을 몰라서 공감부터 하는 게 아니라, 마음이 풀려야 문제도 풀린다는 걸 본능적으로 아는 사람입니다.',
    strengths: [
      '상대의 감정 변화를 빠르게 알아챈다',
      '이야기를 끝까지 들어주는 인내심',
      '모임의 분위기를 부드럽게 만든다',
      '사람들이 고민을 먼저 털어놓는 존재',
    ],
    weaknesses: [
      '거절을 잘 못해서 손해 볼 때가 있다',
      '남 걱정하느라 내 감정은 뒷전이 된다',
      '팩트가 필요한 순간에도 돌려 말한다',
    ],
    compatibility: {
      'facts-t': '당신이 T의 팩트를 통역해주면 최강 콤비.',
      'soft-t': '⭐ 서로의 언어를 반쯤 알아듣는 최적의 밸런스.',
      'warm-f': '따뜻함 두 배. 단, 결정할 사람이 없다.',
      'tearful-f': '공감의 나라. 대화가 3시간은 기본.',
    },
  },
  'tearful-f': {
    id: 'tearful-f',
    name: '눈물버튼 F 💧',
    tagline: '광고 보다가도 우는 사람',
    description:
      '감정의 해상도가 남들보다 몇 배는 높은 사람입니다. 유기견 영상, 군대 간 아들 영상, 심지어 보험 광고에도 눈물 버튼이 눌리죠. 그만큼 타인의 아픔을 내 것처럼 느끼는 능력은 아무나 가질 수 없는 재능입니다. 세상의 온도를 1도 올리는 건 당신 같은 사람들이에요.',
    strengths: [
      '공감 능력이 압도적으로 뛰어나다',
      '진심이 느껴지는 리액션의 소유자',
      '주변 사람들의 감정 쓰레기통이 되어줄 만큼 따뜻하다',
      '예술·콘텐츠를 온몸으로 느끼며 즐긴다',
    ],
    weaknesses: [
      '감정 소모가 커서 쉽게 지친다',
      '팩트 한 방에 며칠씩 마음이 아프다',
      '객관적 판단이 필요한 순간에도 마음이 앞선다',
      '눈물 때문에 하고 싶은 말을 다 못 한다',
    ],
    compatibility: {
      'facts-t': '⭐ 정반대라서 오히려 배울 게 가장 많은 짝.',
      'soft-t': '다정한 논리가 당신의 마음을 잘 잡아준다.',
      'warm-f': '공감의 나라. 대화가 3시간은 기본.',
      'tearful-f': '같이 울 수 있어 행복하지만 티슈값이 많이 든다.',
    },
  },
};

export const tfProfilesEn: Record<string, PersonalityProfile> = {
  'facts-t': {
    id: 'facts-t',
    name: 'Fact-Bomber T 🤖',
    tagline: '"So what\'s the conclusion?" is your catchphrase',
    description:
      'Your brain is permanently in problem-solving mode. Halfway through a friend\'s venting session, you\'ve already mapped the root cause and three solutions. You\'re not bad at comforting — solving IS your way of comforting. Just remember: half the world wants empathy before answers, and you\'ll be unstoppable.',
    strengths: [
      'Pinpoints the core of a problem fast and accurately',
      'Judges coolly without being swept up in emotion',
      'No sugarcoating means no misunderstandings',
      'The most reliable person in a crisis',
      'Advice that actually works in practice',
    ],
    weaknesses: [
      'Drops facts when the moment called for a hug',
      'Hears "you\'re such a T" at least three times a week',
      'Takes a while to notice someone is hurt',
    ],
    compatibility: {
      'facts-t': 'Peak-efficiency conversations. Just give up on being comforted.',
      'soft-t': 'Matching logic protocols — smooth, comfortable flow.',
      'warm-f': 'Your grateful translator, softening your facts for the world.',
      'tearful-f': '⭐ Total opposites — which is exactly why you grow the most.',
    },
  },
  'soft-t': {
    id: 'soft-t',
    name: 'Sweet T 🧊',
    tagline: 'Logical, but knows how to gift-wrap it',
    description:
      'A T at the core, but exceptionally well socialized. The conclusion forms instantly in your head, yet you calibrate when and how to deliver it based on the other person\'s state. "Say the facts, but make them not hurt" — you\'ve mastered one of conversation\'s hardest arts.',
    strengths: [
      'Great balance of logic and consideration',
      'Natural mediator in conflicts',
      'Delivers feedback without bruising egos',
      'Knows when to listen and when to speak',
    ],
    weaknesses: [
      'Often frustrated inside while staying polite outside',
      'Sometimes over-calibrates and misses the moment',
      'Secretly wants to just drop the fact bomb sometimes',
    ],
    compatibility: {
      'facts-t': 'Matching logic protocols — smooth, comfortable flow.',
      'soft-t': 'Just beware of decisions delayed by mutual politeness.',
      'warm-f': '⭐ You half-speak each other\'s languages — optimal balance.',
      'tearful-f': 'Your gentle logic anchors their big feelings well.',
    },
  },
  'warm-f': {
    id: 'warm-f',
    name: 'Warm-Charger F 🧸',
    tagline: 'Empathy first, solutions later',
    description:
      'Talking to you makes people feel understood. You come factory-equipped with an emotional radar that reads expressions, tone, even silences. You don\'t lead with empathy because you lack answers — you instinctively know that hearts must untangle before problems can.',
    strengths: [
      'Quickly picks up on emotional shifts',
      'The patience to listen all the way through',
      'Softens the mood of any gathering',
      'The person people confide in first',
    ],
    weaknesses: [
      'Bad at saying no — sometimes at your own expense',
      'Your own feelings take the back seat',
      'Talks around the point even when facts are needed',
    ],
    compatibility: {
      'facts-t': 'Translate their facts for the world — unstoppable duo.',
      'soft-t': '⭐ You half-speak each other\'s languages — optimal balance.',
      'warm-f': 'Double the warmth. But who makes the decisions?',
      'tearful-f': 'Empathy nation. Three-hour talks are the baseline.',
    },
  },
  'tearful-f': {
    id: 'tearful-f',
    name: 'Tear-Button F 💧',
    tagline: 'Cries at commercials, and proud of it',
    description:
      'Your emotional resolution is several times higher than average. Rescue-dog videos, soldier-homecoming clips, even insurance ads press your tear button. But feeling others\' pain as your own is a talent very few possess. People like you are what raise the world\'s temperature by a degree.',
    strengths: [
      'Off-the-charts empathy',
      'Reactions that radiate genuine feeling',
      'Warm enough to be everyone\'s emotional shelter',
      'Experiences art and stories with your whole body',
    ],
    weaknesses: [
      'Big emotional expenditure — burns out easily',
      'One fact bomb can ache for days',
      'Heart overrides head even when objectivity is needed',
      'Tears interrupt what you actually wanted to say',
    ],
    compatibility: {
      'facts-t': '⭐ Total opposites — which is exactly why you grow the most.',
      'soft-t': 'Their gentle logic anchors your big feelings well.',
      'warm-f': 'Empathy nation. Three-hour talks are the baseline.',
      'tearful-f': 'Crying together is bliss. The tissue budget, less so.',
    },
  },
};
