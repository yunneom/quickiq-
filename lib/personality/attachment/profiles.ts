import type { PersonalityProfile } from '../types';

export const attachmentProfilesKo: Record<string, PersonalityProfile> = {
  secure: {
    id: 'secure',
    name: '안정형 💚',
    tagline: '사랑을 편안하게, 그리고 단단하게',
    description:
      '당신은 가까워지는 것도, 혼자 있는 것도 모두 편안하게 받아들이는 사람입니다. 감정을 솔직하게 표현하면서도 상대에게 충분한 공간을 줄 줄 알아, 관계가 자연스럽게 깊어집니다. 갈등이 생겨도 도망치거나 매달리기보다 차분히 대화로 풀어갑니다.',
    strengths: [
      '감정을 솔직하고 건강하게 표현한다',
      '갈등 앞에서도 침착하게 대화로 풀어간다',
      '상대를 믿고 적당한 거리를 존중한다',
      '관계에 안정감과 신뢰를 준다',
      '독립과 친밀함의 균형을 잘 잡는다',
    ],
    weaknesses: [
      '상대의 불안한 신호를 가볍게 넘길 때가 있다',
      '너무 무난해서 밀당이 필요한 상대에겐 심심해 보일 수 있다',
      '안정감에 익숙해 관계의 권태를 놓치기 쉽다',
    ],
    compatibility: {
      secure: '⭐ 서로를 든든하게 받쳐주는 최고의 짝. 잔잔하지만 오래가는 사랑.',
      anxious: '당신의 안정감이 상대의 불안을 가라앉혀 주는 좋은 궁합.',
      avoidant: '인내심을 가지고 다가가면 회피형도 서서히 마음을 연다.',
      fearful: '일관된 따뜻함이 혼란형에게 가장 필요한 처방이 된다.',
    },
  },
  anxious: {
    id: 'anxious',
    name: '불안형 💛',
    tagline: '사랑에 진심, 그래서 더 애가 타는',
    description:
      '당신은 누구보다 깊고 뜨겁게 사랑하는 사람입니다. 다만 상대의 마음을 자주 확인하고 싶고, 작은 신호에도 마음이 크게 흔들립니다. 사랑받고 있다는 확신이 들 때 가장 빛나는 타입이에요.',
    strengths: [
      '애정 표현이 풍부하고 헌신적이다',
      '상대의 감정 변화를 섬세하게 알아챈다',
      '관계에 진심을 다해 몰입한다',
      '함께 있을 때 따뜻함과 친밀감을 준다',
    ],
    weaknesses: [
      '확인받고 싶은 마음에 상대를 부담스럽게 할 수 있다',
      '작은 일도 크게 해석해 스스로를 괴롭힌다',
      '질투와 불안이 다툼의 불씨가 되기 쉽다',
      '상대의 침묵을 거절로 받아들이곤 한다',
    ],
    compatibility: {
      secure: '⭐ 흔들림 없는 안정감이 당신의 불안을 녹여주는 최고의 짝.',
      anxious: '서로의 마음은 잘 알지만 함께 불안이 증폭될 수 있다.',
      avoidant: '쫓고 도망가는 패턴에 빠지기 쉬워 많은 노력이 필요하다.',
      fearful: '둘 다 감정 기복이 커 안전한 거리 조절이 관건이다.',
    },
  },
  avoidant: {
    id: 'avoidant',
    name: '회피형 💙',
    tagline: '내 공간을 지키며 사랑하는',
    description:
      '당신은 독립적이고 자기 세계가 분명한 사람입니다. 사랑하면서도 자신만의 시간과 자유를 중요하게 여기고, 감정을 드러내기보다 안으로 다지는 편이에요. 신뢰가 쌓이면 누구보다 단단하고 든든한 파트너가 됩니다.',
    strengths: [
      '독립적이고 스스로를 잘 챙긴다',
      '감정에 휘둘리지 않고 침착하다',
      '상대에게 충분한 자유와 공간을 준다',
      '책임감 있고 믿음직스럽다',
      '위기 상황에서도 흔들리지 않는다',
    ],
    weaknesses: [
      '속마음을 잘 드러내지 않아 오해를 산다',
      '가까워지면 무의식적으로 거리를 둔다',
      '감정적 교류가 부족해 상대를 외롭게 할 수 있다',
    ],
    compatibility: {
      secure: '⭐ 강요하지 않는 안정감이 당신을 천천히 열게 만드는 최고의 짝.',
      anxious: '상대의 다가옴에 자꾸 뒤로 물러나 어긋나기 쉽다.',
      avoidant: '서로 편하지만 거리가 너무 멀어 깊어지기 어렵다.',
      fearful: '밀당의 온도차가 커서 둘 다 지칠 수 있다.',
    },
  },
  fearful: {
    id: 'fearful',
    name: '혼란형 🤍',
    tagline: '가까워지고 싶지만, 다칠까 두려운',
    description:
      '당신은 사랑을 간절히 원하면서도 동시에 상처받는 것이 두려운, 섬세하고 복합적인 사람입니다. 다가가고 싶은 마음과 도망치고 싶은 마음이 함께 있어 관계에서 자주 흔들립니다. 안전하다고 느낄 때 비로소 깊은 사랑을 나눌 수 있어요.',
    strengths: [
      '감정의 깊이가 풍부하고 공감 능력이 뛰어나다',
      '상대의 상처를 잘 이해하고 보듬는다',
      '진정성 있는 관계를 간절히 원한다',
      '자기 성찰적이고 성장 의지가 강하다',
    ],
    weaknesses: [
      '다가감과 밀어냄을 반복해 상대를 혼란스럽게 한다',
      '거절과 상처에 대한 두려움이 크다',
      '감정의 기복이 관계를 불안정하게 만든다',
      '신뢰를 쌓기까지 시간이 오래 걸린다',
    ],
    compatibility: {
      secure: '⭐ 한결같은 안정감이 당신의 두려움을 녹여주는 최고의 짝.',
      anxious: '서로의 깊은 감정은 통하지만 기복이 함께 커질 수 있다.',
      avoidant: '거리감의 온도차가 커서 엇갈리기 쉽다.',
      fearful: '깊이 공감하지만 함께 흔들리기 쉬워 안전장치가 필요하다.',
    },
  },
};

export const attachmentProfilesEn: Record<string, PersonalityProfile> = {
  secure: {
    id: 'secure',
    name: 'Secure 💚',
    tagline: 'Loving with ease and steadiness',
    description:
      'You feel comfortable both getting close and having time on your own. You express your feelings honestly while still giving your partner plenty of space, so your relationships deepen naturally. When conflict arises, you neither run away nor cling — you talk it through calmly.',
    strengths: [
      'Expresses feelings openly and healthily',
      'Stays calm and talks through conflict',
      'Trusts a partner and respects their space',
      'Brings stability and trust to the relationship',
      'Balances independence and intimacy well',
    ],
    weaknesses: [
      'May brush off a partner’s anxious signals',
      'Can seem a little too easygoing for someone who loves the chase',
      'Comfort can make it easy to miss creeping boredom',
    ],
    compatibility: {
      secure: '⭐ A rock-solid match — calm, steady, and built to last.',
      anxious: 'Your steadiness soothes their worries — a great fit.',
      avoidant: 'With patience, your warmth slowly draws them out.',
      fearful: 'Your consistent warmth is exactly what they need most.',
    },
  },
  anxious: {
    id: 'anxious',
    name: 'Anxious 💛',
    tagline: 'All in on love — and aching for reassurance',
    description:
      'You love deeply and wholeheartedly, more than most. The catch is that you often crave reassurance, and small signals can shake you up. You shine brightest when you truly feel loved and secure.',
    strengths: [
      'Affectionate and devoted',
      'Picks up on a partner’s emotional shifts',
      'Throws their whole heart into the relationship',
      'Brings warmth and closeness when together',
    ],
    weaknesses: [
      'Can overwhelm a partner with the need for reassurance',
      'Reads too much into small things and torments themselves',
      'Jealousy and worry can spark arguments',
      'Tends to take silence as rejection',
    ],
    compatibility: {
      secure: '⭐ Their unshakable calm melts your worries — the perfect match.',
      anxious: 'You get each other, but anxiety can amplify on both sides.',
      avoidant: 'Easy to fall into a chase-and-retreat loop — takes real effort.',
      fearful: 'Both run hot and cold, so managing distance is key.',
    },
  },
  avoidant: {
    id: 'avoidant',
    name: 'Avoidant 💙',
    tagline: 'Loving while guarding your own space',
    description:
      'You are independent with a strong sense of your own world. Even in love, you value your time and freedom, and you tend to process emotions inwardly rather than show them. Once trust is built, you become an exceptionally steady and reliable partner.',
    strengths: [
      'Independent and self-sufficient',
      'Stays calm and isn’t ruled by emotions',
      'Gives a partner plenty of freedom and space',
      'Responsible and dependable',
      'Holds steady even in a crisis',
    ],
    weaknesses: [
      'Rarely shows true feelings, leading to misunderstandings',
      'Pulls away instinctively when things get close',
      'Limited emotional exchange can leave a partner lonely',
    ],
    compatibility: {
      secure: '⭐ Their no-pressure calm slowly opens you up — the best match.',
      anxious: 'Their pushing toward you makes you retreat — easily misaligned.',
      avoidant: 'Comfortable together, but too distant to ever go deep.',
      fearful: 'The push-pull gap is wide — both can end up worn out.',
    },
  },
  fearful: {
    id: 'fearful',
    name: 'Fearful 🤍',
    tagline: 'Longing to get close, afraid of getting hurt',
    description:
      'You deeply crave love yet fear being hurt at the same time — a sensitive, complex soul. The urge to draw near and the urge to flee live side by side, so relationships often feel like a rollercoaster. Only when you feel safe can you share the deep love you’re capable of.',
    strengths: [
      'Emotionally deep and highly empathetic',
      'Understands and tends to a partner’s wounds',
      'Genuinely longs for an authentic connection',
      'Self-reflective with a strong drive to grow',
    ],
    weaknesses: [
      'Swings between pulling close and pushing away, confusing a partner',
      'Carries a strong fear of rejection and hurt',
      'Emotional ups and downs can destabilize the relationship',
      'Takes a long time to build trust',
    ],
    compatibility: {
      secure: '⭐ Their steady consistency melts your fears — the best match.',
      anxious: 'You connect on deep feelings, but the highs and lows can compound.',
      avoidant: 'A wide gap in closeness makes you easily miss each other.',
      fearful: 'Deeply empathetic but easily shaken together — you’ll need safeguards.',
    },
  },
};
