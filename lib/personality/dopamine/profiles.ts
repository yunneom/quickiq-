import type { PersonalityProfile } from '../types';

export const dopamineProfilesKo: Record<string, PersonalityProfile> = {
  zen: {
    id: 'zen',
    name: '도파민 수도승 🧘',
    tagline: '자극이 없어도 평온한 사람',
    description:
      '축하합니다. 당신은 알고리즘이 가장 싫어하는 유형입니다. 숏폼의 무한 스크롤도, 새벽의 "한 편만 더"도 당신을 흔들지 못하죠. 심심함을 견디는 능력은 사실 집중력과 창의력의 원천입니다. 다만 가끔은 세상의 밈을 하나도 몰라서 대화에서 소외될 수 있으니, 일주일에 한 번 정도는 인터넷 구경도 나쁘지 않아요.',
    strengths: [
      '심심함을 견디는 희귀 능력 보유',
      '한 가지 일에 깊게 몰입할 수 있다',
      '수면의 질이 압도적으로 좋다',
      '알고리즘의 지배에서 자유롭다',
      '작은 것에서 만족을 찾을 줄 안다',
    ],
    weaknesses: [
      '유행하는 밈을 몰라 대화에서 종종 소외된다',
      '"그걸 아직도 안 봤어?" 소리를 자주 듣는다',
      '지나친 절제가 가끔은 고립이 되기도 한다',
    ],
  },
  balanced: {
    id: 'balanced',
    name: '밸런스 장인 ⚖️',
    tagline: '즐길 건 즐기고, 끊을 건 끊는',
    description:
      '당신은 도파민과 건강한 거리두기를 하는 중입니다. 숏폼도 보고 SNS도 하지만, 정해둔 선을 넘지 않죠. "재미"와 "일상"의 균형을 지키는 이 능력은 생각보다 희귀합니다. 지금 페이스를 유지하면서, 스트레스가 심해질 때 자극 소비가 늘어나는지만 가끔 점검해 보세요.',
    strengths: [
      '자기 조절 능력이 뛰어나다',
      '트렌드를 알면서도 휘둘리지 않는다',
      '디지털과 현실의 균형이 좋다',
      '해야 할 일 앞에서 폰을 내려놓을 수 있다',
    ],
    weaknesses: [
      '스트레스가 심하면 균형이 무너질 수 있다',
      '가끔 "너무 재미없게 사는 거 아냐?"라는 생각이 든다',
      '주변의 도파민 중독자들을 이해하기 어렵다',
    ],
  },
  hunter: {
    id: 'hunter',
    name: '도파민 헌터 🎯',
    tagline: '재미를 찾아 떠도는 자극 사냥꾼',
    description:
      '당신의 하루는 재미 탐색으로 채워져 있습니다. 숏폼, 신상 맛집, 세일 알림, 새로운 콘텐츠 — 뇌가 늘 "다음 재미"를 스캔 중이죠. 에너지와 호기심이 넘친다는 뜻이기도 하지만, 문득 "방금 뭘 본 거지?" 싶은 공허함이 온다면 그게 신호입니다. 일주일에 하루만 자극 다이어트를 해보세요. 의외로 견딜 만합니다.',
    strengths: [
      '트렌드 캐치 속도가 빠르다',
      '어디서든 재밌는 콘텐츠를 잘 찾아낸다',
      '호기심과 에너지가 넘친다',
      '대화 소재가 마르지 않는다',
    ],
    weaknesses: [
      '집중력이 예전 같지 않다고 느낀다',
      '"5분만"이 "2시간"이 되는 마법을 자주 경험한다',
      '자극이 없으면 금방 지루해한다',
      '보고 나면 기억에 안 남는 콘텐츠가 태반이다',
    ],
  },
  goblin: {
    id: 'goblin',
    name: '도파민 노예 🔥',
    tagline: '알고리즘의 VIP 고객님',
    description:
      '축하(?)합니다. 알고리즘이 당신을 사랑합니다. 눈 뜨자마자 릴스, 밥 먹으며 쇼츠, 화장실에서 틱톡, 자기 전 "한 편만 더"의 무한 루프 — 당신의 도파민 회로는 풀가동 중입니다. 좋은 소식은, 이 테스트를 끝까지 했다는 것 자체가 집중력이 아직 살아있다는 증거라는 것. 오늘 밤 폰을 침실 밖에 두는 것부터 시작해 보세요. 첫 3일이 고비입니다.',
    strengths: [
      '밈과 트렌드의 살아있는 백과사전',
      '멀티태스킹(이라고 믿는 것)에 능하다',
      '어떤 모임에서도 화제가 끊기지 않는다',
      '정보 수집 속도만큼은 초일류',
    ],
    weaknesses: [
      '스크린타임 통계를 차마 못 열어본다',
      '긴 글, 긴 영상, 긴 생각이 힘들어졌다',
      '수면 부족이 일상이 됐다',
      '심심함을 1분도 못 견딘다',
    ],
  },
};

export const dopamineProfilesEn: Record<string, PersonalityProfile> = {
  zen: {
    id: 'zen',
    name: 'Dopamine Monk 🧘',
    tagline: 'At peace, even without stimulation',
    description:
      'Congratulations — you are the algorithm\'s least favorite type of person. Infinite scroll can\'t hook you; the 2am "one more episode" whisper doesn\'t reach you. Your tolerance for boredom is actually the wellspring of focus and creativity. Just note: knowing zero current memes can leave you out of conversations, so a weekly internet stroll wouldn\'t hurt.',
    strengths: [
      'The rare ability to sit with boredom',
      'Deep, sustained focus on one thing',
      'Vastly better sleep than most',
      'Free from algorithmic control',
      'Finds satisfaction in small things',
    ],
    weaknesses: [
      'Often out of the loop on trending memes',
      'Hears "you STILL haven\'t seen it?" a lot',
      'Extreme restraint can drift into isolation',
    ],
  },
  balanced: {
    id: 'balanced',
    name: 'Balance Artisan ⚖️',
    tagline: 'Enjoys the fun, honors the limits',
    description:
      'You maintain a healthy distance from dopamine. You watch shorts and use social media, but you don\'t cross the lines you\'ve drawn. Balancing "fun" and "life" is rarer than it sounds. Keep the pace — just check in occasionally on whether stress quietly inflates your stimulation intake.',
    strengths: [
      'Excellent self-regulation',
      'Knows the trends without being ruled by them',
      'Healthy digital-life balance',
      'Can put the phone down when work calls',
    ],
    weaknesses: [
      'Heavy stress can tip the balance',
      'Occasionally wonders "am I living too boringly?"',
      'Struggles to relate to dopamine addicts nearby',
    ],
  },
  hunter: {
    id: 'hunter',
    name: 'Dopamine Hunter 🎯',
    tagline: 'A stimulation hunter roaming for the next hit of fun',
    description:
      'Your day is a continuous scan for the next fun thing — shorts, new restaurants, sale alerts, fresh content. That means energy and curiosity in abundance. But if you ever surface from a scroll session thinking "what did I even just watch?", that hollow feeling is your signal. Try one stimulation-diet day per week. It\'s more survivable than you think.',
    strengths: [
      'Catches trends at lightning speed',
      'Finds the good content anywhere',
      'Overflowing curiosity and energy',
      'Never runs out of things to talk about',
    ],
    weaknesses: [
      'Focus isn\'t what it used to be',
      'Regularly experiences "5 minutes" becoming 2 hours',
      'Gets bored fast without stimulation',
      'Most of what you watch leaves no trace in memory',
    ],
  },
  goblin: {
    id: 'goblin',
    name: 'Dopamine Goblin 🔥',
    tagline: 'The algorithm\'s VIP customer',
    description:
      'Congratulations(?) — the algorithm loves you. Reels at wake-up, shorts over meals, TikTok in the bathroom, the infinite "one more" loop at bedtime: your dopamine circuit runs at full throttle. The good news? Finishing this test proves your attention span still has a pulse. Start tonight: phone sleeps outside the bedroom. The first three days are the hard part.',
    strengths: [
      'A living encyclopedia of memes and trends',
      'Skilled at what you believe is multitasking',
      'Conversation never dies when you\'re around',
      'World-class speed at information gathering',
    ],
    weaknesses: [
      'Can\'t bear to open the screen-time report',
      'Long articles, long videos, long thoughts — all hard now',
      'Sleep deprivation became the default',
      'Can\'t endure even one minute of boredom',
    ],
  },
};
