import type { PersonalityProfile } from '../types';

/**
 * 4 result profiles for 테토/에겐, one per (dominant axis × gender).
 * Provided in ko + en. Profile id format: `teto-male` | `teto-female`
 * | `egen-male` | `egen-female`. The compatibility map shows the
 * "best match" partner profile so couples are nudged toward a 1+1
 * purchase pattern.
 */

export const tetoEgenProfilesKo: Record<string, PersonalityProfile> = {
  'teto-male': {
    id: 'teto-male',
    name: '테토남 🔥',
    tagline: '추진력과 카리스마의 알파형 남자',
    description:
      '결단력 있고 목표 지향적이며, 책임감 있게 앞장서서 이끄는 타입. 운동·도전·성취에서 에너지를 얻고, 감정 표현보단 행동으로 마음을 보여줍니다.',
    strengths: ['강한 추진력', '문제 해결 능력', '책임감', '리더십', '결단력'],
    weaknesses: ['감정 표현이 서툼', '때로는 너무 직설적', '쉬는 법을 모름'],
    compatibility: {
      'egen-female': '⭐ 최고 궁합 — 부드러움이 강함을 보완',
      'teto-female': '🔥 강 vs 강, 서로 자극하는 파트너',
      'egen-male': '🤝 다른 매력으로 친구 케미',
      'teto-male': '⚡ 비슷한 결, 경쟁심 자극',
    },
  },
  'teto-female': {
    id: 'teto-female',
    name: '테토녀 ⚔️',
    tagline: '주도적이고 당찬 보스걸',
    description:
      '독립적이고 자기 의견 분명한 타입. "내가 알아서 해" 가 입버릇. 일·운동·도전에서 빛나고, 연애에서도 끌고 가는 쪽을 선호합니다.',
    strengths: ['독립성', '결단력', '자기 확신', '추진력', '리더십'],
    weaknesses: ['고집이 셈', '감정 공유 어려움', '약한 모습 보이기 꺼림'],
    compatibility: {
      'egen-male': '⭐ 최고 궁합 — 받쳐주는 다정함이 매력',
      'teto-male': '🔥 강 vs 강, 서로 자극하는 파트너',
      'egen-female': '🤝 다른 매력으로 친구 케미',
      'teto-female': '⚡ 비슷한 결, 경쟁심 자극',
    },
  },
  'egen-male': {
    id: 'egen-male',
    name: '에겐남 🌿',
    tagline: '다정하고 섬세한 소프트 가이',
    description:
      '공감 능력이 뛰어나고 분위기를 잘 살피는 타입. 감정을 솔직하게 표현할 줄 알고, 함께 있는 사람을 편안하게 만듭니다. 강요보다 동의로, 명령보다 대화로 움직입니다.',
    strengths: ['공감 능력', '경청', '감성 지능', '배려', '안정감'],
    weaknesses: ['결정에 시간이 걸림', '갈등 회피 경향', '자기 주장이 약함'],
    compatibility: {
      'teto-female': '⭐ 최고 궁합 — 강한 그녀를 따뜻하게 품음',
      'egen-female': '💕 비슷한 결, 편안한 케미',
      'teto-male': '🤝 다른 매력으로 친구 케미',
      'egen-male': '☁️ 평화롭지만 추진력 부족할 수도',
    },
  },
  'egen-female': {
    id: 'egen-female',
    name: '에겐녀 🌷',
    tagline: '따뜻하고 감성 충만한 로맨틱 걸',
    description:
      '섬세하고 정 많은 타입. 사랑·관계·아름다움에 가치를 두고, 작은 디테일에서 행복을 찾습니다. 상대의 감정을 빠르게 읽고 분위기를 부드럽게 만드는 능력자.',
    strengths: ['공감 능력', '감수성', '배려', '관계 형성', '감성 표현'],
    weaknesses: ['거절을 어려워함', '쉽게 상처받음', '결정을 미루는 경향'],
    compatibility: {
      'teto-male': '⭐ 최고 궁합 — 든든함에 안정감',
      'egen-male': '💕 비슷한 결, 편안한 케미',
      'teto-female': '🤝 다른 매력으로 친구 케미',
      'egen-female': '🌸 평화롭지만 추진력 부족할 수도',
    },
  },
};

export const tetoEgenProfilesEn: Record<string, PersonalityProfile> = {
  'teto-male': {
    id: 'teto-male',
    name: 'Teto Guy 🔥',
    tagline: 'Driven, decisive, alpha-type leader',
    description:
      'Decisive, goal-oriented, and naturally takes charge. Recharges through movement, challenge, and achievement. Expresses feelings through action more than words.',
    strengths: ['Strong drive', 'Problem-solving', 'Responsibility', 'Leadership', 'Decisiveness'],
    weaknesses: ['Awkward with emotions', 'Sometimes too blunt', "Doesn't know how to rest"],
    compatibility: {
      'egen-female': '⭐ Top match — her softness complements your edge',
      'teto-female': '🔥 Power vs power, electric partnership',
      'egen-male': '🤝 Different energies, great friendship',
      'teto-male': '⚡ Same vibe, mutual competition',
    },
  },
  'teto-female': {
    id: 'teto-female',
    name: 'Teto Girl ⚔️',
    tagline: 'Bold, independent boss girl',
    description:
      'Independent with a clear voice. "I\'ve got this" is your default. Shines in work, sports, and challenges — and prefers to take the lead in love too.',
    strengths: ['Independence', 'Decisiveness', 'Self-confidence', 'Drive', 'Leadership'],
    weaknesses: ['Stubborn', 'Hard to share feelings', 'Reluctant to show weakness'],
    compatibility: {
      'egen-male': '⭐ Top match — his warmth balances your strength',
      'teto-male': '🔥 Power vs power, electric partnership',
      'egen-female': '🤝 Different energies, great friendship',
      'teto-female': '⚡ Same vibe, mutual competition',
    },
  },
  'egen-male': {
    id: 'egen-male',
    name: 'Egen Guy 🌿',
    tagline: 'Caring, sensitive soft guy',
    description:
      'Highly empathetic and attuned to atmosphere. Expresses feelings openly and makes others feel safe. Moves through agreement, not command — through conversation, not orders.',
    strengths: ['Empathy', 'Listening', 'Emotional IQ', 'Care', 'Stability'],
    weaknesses: ['Slow to decide', 'Avoids conflict', 'Underclaims himself'],
    compatibility: {
      'teto-female': '⭐ Top match — you ground her fire',
      'egen-female': '💕 Same vibe, calm chemistry',
      'teto-male': '🤝 Different energies, great friendship',
      'egen-male': '☁️ Peaceful, but may lack drive',
    },
  },
  'egen-female': {
    id: 'egen-female',
    name: 'Egen Girl 🌷',
    tagline: 'Warm, sensitive romantic',
    description:
      'Sensitive and full of love. Values connection, beauty, and small details. Reads moods quickly and naturally softens any room.',
    strengths: ['Empathy', 'Sensitivity', 'Care', 'Connection', 'Emotional expression'],
    weaknesses: ['Hard to say no', 'Easily hurt', 'Tends to delay decisions'],
    compatibility: {
      'teto-male': '⭐ Top match — his strength steadies you',
      'egen-male': '💕 Same vibe, calm chemistry',
      'teto-female': '🤝 Different energies, great friendship',
      'egen-female': '🌸 Peaceful, but may lack drive',
    },
  },
};
