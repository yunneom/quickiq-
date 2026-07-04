import type { PersonalityProfile } from '../types';

export const ajaeProfilesKo: Record<string, PersonalityProfile> = {
  newgen: {
    id: 'newgen',
    name: '청정 신세대 🍼',
    tagline: '아재 문화 무결점 청정구역',
    description:
      '아재 문화 오염도 0%. 삐삐도, PC통신도, 비디오 되감기도 당신의 세계에는 존재하지 않는 유물입니다. 혹시 이 문제들을 보며 "이게 다 무슨 소리지?" 싶었다면 정상입니다 — 당신은 완벽한 디지털 네이티브니까요. 다만 회사 회식에서 부장님의 추억 토크에 리액션할 수 없다는 치명적 약점이 있습니다.',
    strengths: [
      '아재개그 면역 — 웃어주지 않을 권리를 행사한다',
      '최신 문화에 100% 리소스 집중 가능',
      '"라떼는" 토크에 물들지 않은 순수함',
      '되감기 없는 스트리밍 세대의 효율성',
    ],
    weaknesses: [
      '부장님 추억 토크에 낄 수 없다 (영혼 없는 끄덕임만)',
      '레트로 감성 마케팅이 전혀 안 통한다',
      '부모님 세대와의 공감 포인트가 부족하다',
      '달고나를 오징어게임으로 처음 배웠다',
    ],
  },
  sprout: {
    id: 'sprout',
    name: '아재 새싹 🌱',
    tagline: '아재의 세계에 입문한 견습생',
    description:
      '아재 문화를 "어디서 들어는 본" 수준입니다. 부모님 어깨너머로, 유튜브 레트로 영상으로 주워들은 지식이 슬슬 쌓이는 중이군요. 아직은 새싹이지만 몇 년 뒤 "그 시절 감성" 플레이리스트를 스스로 검색하는 자신을 발견하게 될 겁니다. 아재화(化)는 그렇게 조용히 시작됩니다.',
    strengths: [
      '세대 문화를 넘나드는 균형 감각',
      '레트로 밈을 신선하게 소비할 수 있다',
      '부장님과 신입 사이의 가교 역할 가능',
      '아직은 무릎을 치지 않고 웃을 수 있다',
    ],
    weaknesses: [
      '어설픈 옛날 지식으로 아는 척하다 들킨다',
      '요즘 문화도 옛날 문화도 애매하게 안다',
      '아재화 진행 중이라는 사실을 부정한다',
    ],
  },
  middle: {
    id: 'middle',
    name: '중견 아재 👔',
    tagline: '추억이 차오르는 소리가 들린다',
    description:
      '문제를 풀면서 입가에 미소가 번졌다면 인정하셔야 합니다. 삐삐 암호도, 오락실 아도겐도, 비디오 되감기의 촉감도 전부 "체험"으로 알고 있는 진성 아재입니다. 나쁜 게 아닙니다 — 이 모든 걸 직접 겪은 세대는 이제 희소 자원이니까요. 다만 신조어 테스트도 같이 응시해 보시길. 균형이 중요합니다.',
    strengths: [
      '레트로 문화의 살아있는 데이터베이스',
      '동년배 모임에서 추억 토크 무한 발제 가능',
      '아날로그와 디지털을 모두 겪은 하이브리드',
      '오락실 게임 실력이 아직 손에 남아있다',
    ],
    weaknesses: [
      '추억 토크가 시작되면 멈추지 못한다',
      '"요즘 애들은 모르겠지만"이 입에 붙었다',
      '신조어 테스트를 응시하면 결과가 두렵다',
      '무의식적으로 무릎을 치며 웃기 시작했다',
    ],
  },
  legend: {
    id: 'legend',
    name: '레전드 아재 🏆',
    tagline: '부장님, 여기서 이러시면 안 됩니다',
    description:
      '만점급 아재력. 당신의 뇌는 80~00년대 한국 문화의 국가기록원입니다. 이 정도면 지식이 아니라 "살아온 역사"죠. 축하드립니다 — 그리고 애도를 표합니다. 이제 남은 건 아재개그 봉인 해제뿐인데, 아마 이미 해제되어 있을 겁니다. 오늘도 어딘가에서 "아메리카노는 아메리카에서 안 만들어~"라고 말하고 계시겠죠.',
    strengths: [
      '80~00년대 문화 국가대표급 지식 보유',
      '어떤 레트로 퀴즈쇼에 나가도 우승 후보',
      '추억 팔이 콘텐츠의 핵심 타깃이자 감별사',
      '그 시절을 전부 "실시간"으로 살아낸 산증인',
    ],
    weaknesses: [
      '아재개그가 자동 발사된다 (본인은 재밌음)',
      '신조어 테스트 응시를 무의식적으로 회피한다',
      '"요즘 노래는 노래가 아니야"를 시전한 적 있다',
      '회식 추억 토크 지분율 80% 이상',
    ],
  },
};

export const ajaeProfilesEn: Record<string, PersonalityProfile> = {
  newgen: {
    id: 'newgen',
    name: 'Pure New Generation 🍼',
    tagline: 'A retro-culture-free clean zone',
    description:
      'Retro contamination: 0%. Pagers, dial-up chat, rewinding tapes — relics that simply don\'t exist in your world. If you read these questions thinking "what IS all this?", that\'s normal: you\'re a flawless digital native. Your one fatal weakness: zero reaction material when the boss starts reminiscing at company dinner.',
    strengths: [
      'Immune to dad jokes — exercises the right not to laugh',
      '100% of cultural bandwidth invested in the present',
      'Unspoiled by "back in my day" talk',
      'The streaming generation\'s no-rewind efficiency',
    ],
    weaknesses: [
      'Cannot join the boss\'s nostalgia talk (soulless nodding only)',
      'Retro-emotion marketing has no effect on you',
      'Few common touchpoints with your parents\' generation',
      'Learned dalgona from Squid Game',
    ],
  },
  sprout: {
    id: 'sprout',
    name: 'Ajae Sprout 🌱',
    tagline: 'An apprentice entering the ajae world',
    description:
      'You\'ve "sort of heard of" retro culture — knowledge gleaned over parents\' shoulders and from YouTube retro clips is quietly accumulating. Still a sprout, but in a few years you\'ll catch yourself searching for "that era vibes" playlists. That\'s how ajae-fication begins: silently.',
    strengths: [
      'Balanced fluency across generational cultures',
      'Can consume retro memes as fresh content',
      'Bridges the boss and the intern',
      'Can still laugh without slapping a knee',
    ],
    weaknesses: [
      'Gets caught faking retro knowledge',
      'Knows both eras only halfway',
      'In denial about the ajae-fication in progress',
    ],
  },
  middle: {
    id: 'middle',
    name: 'Mid-level Ajae 👔',
    tagline: 'You can hear the nostalgia filling up',
    description:
      'If you smiled while solving these, it\'s time to admit it. Pager codes, arcade "Adogen", the tactile feel of rewinding a tape — you know them all as lived experience. That\'s not a bad thing: people who lived all of it are a scarce resource now. But do take the slang quiz too. Balance matters.',
    strengths: [
      'A living database of retro culture',
      'Infinite nostalgia-talk agenda for peer gatherings',
      'A hybrid who lived both analog and digital',
      'Arcade skills still in the muscle memory',
    ],
    weaknesses: [
      'Cannot stop once nostalgia talk begins',
      '"Kids these days wouldn\'t know…" is now a verbal tic',
      'Afraid of what the slang quiz would say',
      'Has started knee-slapping while laughing',
    ],
  },
  legend: {
    id: 'legend',
    name: 'Legendary Ajae 🏆',
    tagline: 'Sir, you can\'t do this here',
    description:
      'Perfect-score-tier ajae power. Your brain is the national archive of 80s–00s Korean culture. At this level it\'s not knowledge — it\'s lived history. Congratulations… and condolences. The only thing left is the dad-joke seal, which, let\'s be honest, broke years ago.',
    strengths: [
      'National-team-level retro culture knowledge',
      'Favorite to win any retro quiz show',
      'Prime target AND authenticator of nostalgia content',
      'A living witness who experienced it all in real time',
    ],
    weaknesses: [
      'Dad jokes auto-fire (hilarious to you alone)',
      'Unconsciously avoids taking the slang quiz',
      'Has said "music these days isn\'t music" at least once',
      'Holds 80%+ share of company-dinner nostalgia talk',
    ],
  },
};
