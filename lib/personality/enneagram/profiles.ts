import type { PersonalityProfile } from '../types';

export const enneagramProfilesKo: Record<string, PersonalityProfile> = {
  type1: {
    id: 'type1',
    name: '1유형 · 개혁가',
    tagline: '더 나은 세상을 향한 원칙주의자',
    description:
      '옳고 그름에 대한 분명한 기준을 가지고, 늘 더 나은 방향으로 개선하려는 사람입니다. 마음 깊은 곳에는 결함이 있거나 잘못된 사람이 되는 것에 대한 두려움이, 그 너머에는 올바르고 흠 없는 존재가 되고 싶은 열망이 자리합니다.',
    strengths: ['높은 도덕성과 책임감', '꼼꼼하고 정확한 일처리', '공정함을 지키려는 태도', '끊임없는 자기 개선 노력', '신뢰할 수 있는 일관성'],
    weaknesses: ['지나친 자기 비판과 완벽주의', '융통성 부족', '억눌린 분노와 비판적 태도'],
  },
  type2: {
    id: 'type2',
    name: '2유형 · 조력가',
    tagline: '사랑을 주며 살아가는 따뜻한 마음',
    description:
      '타인의 필요를 먼저 알아채고 정성껏 돕는 데서 보람을 느끼는 사람입니다. 사랑받지 못하거나 필요 없는 존재가 되는 것을 두려워하며, 사람들에게 사랑받고 소중히 여겨지기를 깊이 바랍니다.',
    strengths: ['따뜻한 공감 능력', '관계를 키우는 친화력', '아낌없는 베풂과 헌신', '타인의 감정에 대한 섬세함', '주변을 편안하게 하는 배려'],
    weaknesses: ['자기 욕구를 외면하는 경향', '인정받으려는 과한 욕구', '경계 없이 떠안는 부담'],
  },
  type3: {
    id: 'type3',
    name: '3유형 · 성취가',
    tagline: '성공을 향해 달려가는 추진력의 화신',
    description:
      '목표를 이루고 인정받는 일에서 가장 큰 에너지를 얻는 사람입니다. 가치 없는 존재로 보이는 것을 두려워하며, 성취를 통해 자신의 가치를 증명하고 존경받기를 갈망합니다.',
    strengths: ['강한 목표 지향성과 추진력', '효율적인 실행력', '뛰어난 적응력', '동기를 부여하는 영향력', '자신감 있는 자기표현'],
    weaknesses: ['이미지에 집착하는 경향', '일 중심으로 감정을 미루기', '경쟁에서 오는 조급함'],
  },
  type4: {
    id: 'type4',
    name: '4유형 · 예술가',
    tagline: '깊은 감성으로 자신만의 색을 찾는 사람',
    description:
      '남과 다른 자신만의 감성과 독창성을 무엇보다 중요하게 여기는 사람입니다. 정체성이 없는 평범한 존재가 되는 것을 두려워하며, 자기다움을 찾아 의미 있고 진실한 삶을 살기를 원합니다.',
    strengths: ['풍부한 감수성과 창의성', '진정성에 대한 추구', '깊은 공감과 통찰', '미적 감각', '자기 탐구의 용기'],
    weaknesses: ['감정 기복과 우울감', '타인과의 비교에서 오는 결핍감', '자기 몰입과 현실 회피'],
  },
  type5: {
    id: 'type5',
    name: '5유형 · 탐구가',
    tagline: '지식의 깊이로 세상을 이해하는 관찰자',
    description:
      '혼자 깊이 파고들어 무언가를 완전히 이해할 때 가장 살아있음을 느끼는 사람입니다. 무능하거나 압도당하는 것을 두려워하며, 충분한 지식과 역량을 갖추어 스스로 설 수 있기를 바랍니다.',
    strengths: ['깊이 있는 분석력', '객관적이고 냉철한 시야', '독립성과 자기충족', '호기심과 전문성', '차분한 위기 대응'],
    weaknesses: ['감정과 관계로부터의 거리두기', '자원을 움켜쥐는 인색함', '지나친 사적 영역 보호'],
  },
  type6: {
    id: 'type6',
    name: '6유형 · 충실가',
    tagline: '신뢰와 책임으로 곁을 지키는 사람',
    description:
      '믿을 수 있는 사람들과 안전한 틀 안에 있을 때 안심하는 사람입니다. 의지할 곳을 잃고 불안에 빠지는 것을 두려워하며, 안전과 든든한 지지를 확보하기를 깊이 원합니다.',
    strengths: ['강한 책임감과 의리', '위험을 미리 대비하는 신중함', '협력과 충성심', '문제를 예리하게 짚는 통찰', '공동체를 지키려는 헌신'],
    weaknesses: ['과도한 걱정과 불안', '결정 앞에서의 우유부단', '권위에 대한 양가감정'],
  },
  type7: {
    id: 'type7',
    name: '7유형 · 열정가',
    tagline: '세상을 즐기는 끝없는 에너지의 소유자',
    description:
      '지루함을 못 참고 늘 새로운 자극과 즐거움을 찾는 사람입니다. 고통이나 결핍에 갇히는 것을 두려워하며, 자유롭게 만족스러운 경험을 누리며 행복하기를 갈망합니다.',
    strengths: ['밝은 에너지와 낙천성', '풍부한 아이디어와 호기심', '빠른 적응과 다재다능함', '주변에 활력을 주는 힘', '미래를 향한 긍정'],
    weaknesses: ['집중력과 끈기의 부족', '고통을 회피하는 도피 성향', '충동적인 과욕'],
  },
  type8: {
    id: 'type8',
    name: '8유형 · 도전가',
    tagline: '강인함으로 길을 여는 리더',
    description:
      '자신의 힘으로 상황을 주도하고 약한 사람을 지켜내려는 사람입니다. 타인에게 통제당하거나 상처받는 것을 두려워하며, 스스로를 지키고 삶의 주도권을 쥐기를 강하게 원합니다.',
    strengths: ['강력한 결단력과 추진력', '약자를 지키는 정의감', '솔직하고 직설적인 태도', '위기에 강한 담대함', '타인을 이끄는 카리스마'],
    weaknesses: ['지배적이고 공격적인 태도', '약함을 드러내기 어려움', '타협 없는 고집'],
  },
  type9: {
    id: 'type9',
    name: '9유형 · 평화주의자',
    tagline: '조화를 품는 넉넉한 중재자',
    description:
      '갈등을 피하고 모두가 평화롭게 지내는 것을 가장 편안하게 여기는 사람입니다. 단절되거나 갈등에 휩싸이는 것을 두려워하며, 내적 평온과 사람들 사이의 조화를 깊이 바랍니다.',
    strengths: ['포용력 있는 안정감', '갈등을 푸는 중재 능력', '편견 없는 수용', '인내심과 너그러움', '편안하게 곁을 주는 친화력'],
    weaknesses: ['갈등 회피로 인한 미루기', '자기 의견을 묻어두는 경향', '변화에 대한 수동성'],
  },
};

export const enneagramProfilesEn: Record<string, PersonalityProfile> = {
  type1: {
    id: 'type1',
    name: 'Type 1 · The Reformer',
    tagline: 'A principled idealist striving for a better world',
    description:
      'You hold a clear sense of right and wrong and constantly work to improve things. Deep down you fear being corrupt or wrong, while what you most desire is to be good, virtuous, and beyond reproach.',
    strengths: ['Strong integrity and responsibility', 'Careful, precise execution', 'Commitment to fairness', 'Relentless self-improvement', 'Dependable consistency'],
    weaknesses: ['Harsh self-criticism and perfectionism', 'Difficulty being flexible', 'Suppressed anger and a critical edge'],
  },
  type2: {
    id: 'type2',
    name: 'Type 2 · The Helper',
    tagline: 'A warm heart that lives by giving love',
    description:
      'You sense what others need before they ask and find meaning in caring for them. You fear being unloved or unwanted, and what you most desire is to be loved and genuinely valued.',
    strengths: ['Warm empathy', 'A gift for nurturing relationships', 'Generous devotion', 'Sensitivity to others’ feelings', 'A reassuring, caring presence'],
    weaknesses: ['Neglecting your own needs', 'An excessive need for appreciation', 'Taking on too much without boundaries'],
  },
  type3: {
    id: 'type3',
    name: 'Type 3 · The Achiever',
    tagline: 'A force of momentum racing toward success',
    description:
      'You draw your greatest energy from reaching goals and being recognized. You fear being seen as worthless, and what you most desire is to prove your value and earn admiration through achievement.',
    strengths: ['Strong goal-orientation and drive', 'Efficient execution', 'Remarkable adaptability', 'Motivating influence', 'Confident self-presentation'],
    weaknesses: ['Over-attachment to image', 'Postponing feelings for the sake of work', 'Impatience born of competition'],
  },
  type4: {
    id: 'type4',
    name: 'Type 4 · The Individualist',
    tagline: 'A deep soul searching for its own true color',
    description:
      'You prize your unique sensibility and originality above all. You fear being ordinary or without identity, and what you most desire is to find your authentic self and live a meaningful, genuine life.',
    strengths: ['Rich sensitivity and creativity', 'A pursuit of authenticity', 'Deep empathy and insight', 'A refined aesthetic sense', 'The courage to explore yourself'],
    weaknesses: ['Mood swings and melancholy', 'A sense of lack from comparing yourself to others', 'Self-absorption and avoidance of reality'],
  },
  type5: {
    id: 'type5',
    name: 'Type 5 · The Investigator',
    tagline: 'An observer who understands the world through depth of knowledge',
    description:
      'You feel most alive when you dig deeply and truly understand something on your own. You fear being incompetent or overwhelmed, and what you most desire is to be capable and self-sufficient through knowledge.',
    strengths: ['Deep analytical ability', 'An objective, clear-eyed perspective', 'Independence and self-sufficiency', 'Curiosity and expertise', 'Calm under pressure'],
    weaknesses: ['Detaching from emotions and relationships', 'Hoarding time and energy', 'Overprotecting your private world'],
  },
  type6: {
    id: 'type6',
    name: 'Type 6 · The Loyalist',
    tagline: 'A steadfast presence built on trust and responsibility',
    description:
      'You feel secure with trustworthy people and solid structures around you. You fear being without support and falling into anxiety, and what you most desire is safety and reliable backing.',
    strengths: ['Strong responsibility and loyalty', 'Prudent preparation for risks', 'Cooperation and faithfulness', 'A sharp eye for problems', 'Devotion to protecting the group'],
    weaknesses: ['Excessive worry and anxiety', 'Indecision when facing choices', 'Ambivalence toward authority'],
  },
  type7: {
    id: 'type7',
    name: 'Type 7 · The Enthusiast',
    tagline: 'An endless wellspring of energy who savors life',
    description:
      'You can’t stand boredom and are always chasing new stimulation and joy. You fear being trapped in pain or deprivation, and what you most desire is to be free, satisfied, and happy.',
    strengths: ['Bright energy and optimism', 'Abundant ideas and curiosity', 'Quick adaptability and versatility', 'A talent for energizing others', 'A hopeful outlook on the future'],
    weaknesses: ['Trouble with focus and follow-through', 'Escaping rather than facing pain', 'Impulsive overcommitment'],
  },
  type8: {
    id: 'type8',
    name: 'Type 8 · The Challenger',
    tagline: 'A leader who opens the way through sheer strength',
    description:
      'You want to take charge of situations and protect those who are weaker. You fear being controlled or harmed by others, and what you most desire is to protect yourself and stay in control of your own life.',
    strengths: ['Powerful decisiveness and drive', 'A sense of justice that defends the vulnerable', 'Honest, direct communication', 'Boldness in a crisis', 'Charisma that leads others'],
    weaknesses: ['A domineering, confrontational edge', 'Difficulty showing vulnerability', 'Stubbornness that resists compromise'],
  },
  type9: {
    id: 'type9',
    name: 'Type 9 · The Peacemaker',
    tagline: 'A generous mediator who embraces harmony',
    description:
      'You avoid conflict and feel most at ease when everyone is at peace. You fear loss of connection and being pulled into discord, and what you most desire is inner calm and harmony among people.',
    strengths: ['A grounding, inclusive steadiness', 'A talent for mediating conflict', 'Open, nonjudgmental acceptance', 'Patience and generosity', 'An easygoing, comforting presence'],
    weaknesses: ['Procrastination from avoiding conflict', 'A tendency to bury your own opinions', 'Passivity toward change'],
  },
};
