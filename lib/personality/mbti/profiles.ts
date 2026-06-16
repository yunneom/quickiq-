import type { PersonalityProfile } from '../types';

export const mbtiProfilesKo: Record<string, PersonalityProfile> = {
  intj: {
    id: 'intj',
    name: 'INTJ · 전략가',
    tagline: '머릿속에 이미 3수 앞의 그림이 그려져 있다.',
    description:
      '큰 그림을 그리고 그 그림을 향해 한 수 한 수 두는 사람. 비효율과 의미 없는 말을 견디지 못하고, 늘 "더 나은 방법"을 설계한다. 혼자 깊이 사고할 때 가장 빛난다.',
    strengths: ['장기적인 전략 수립', '독립적이고 자기주도적', '복잡한 문제 해결력', '높은 자기 기준과 추진력'],
    weaknesses: ['지나치게 비판적으로 보일 수 있음', '감정 표현이 서툼', '타인의 비효율을 못 참음'],
    compatibility: {
      enfp: '⭐ 최고 궁합 — 차가운 전략에 따뜻한 영감을 불어넣어 준다',
      entp: '🔥 토론 파트너 — 서로의 머리를 끝없이 자극한다',
    },
  },
  intp: {
    id: 'intp',
    name: 'INTP · 논리술사',
    tagline: '"왜?"라는 질문 하나로 우주를 분해한다.',
    description:
      '세상의 모든 것을 논리로 분해하고 재조립하는 사색가. 호기심이 끝이 없고, 정답보다 "왜 그런가"에 매혹된다. 머릿속 세계는 화려하지만 현실 정리는 종종 뒷전.',
    strengths: ['뛰어난 분석력과 통찰', '독창적인 아이디어', '편견 없는 사고', '깊은 집중력'],
    weaknesses: ['실행보다 생각에 머무름', '감정적 교류가 어색함', '디테일과 마감에 약함'],
    compatibility: {
      entj: '⭐ 최고 궁합 — 아이디어를 현실로 밀어붙여 준다',
      enfj: '🔥 따뜻한 균형 — 메마른 논리에 사람 냄새를 더한다',
    },
  },
  entj: {
    id: 'entj',
    name: 'ENTJ · 통솔자',
    tagline: '어디에 있든 결국 키를 잡게 되는 사람.',
    description:
      '목표를 정하면 사람과 자원을 끌어모아 기어이 이뤄내는 천생 리더. 결단이 빠르고 비효율을 싫어하며, 정상을 향한 길에서 멈추는 법이 없다.',
    strengths: ['강력한 리더십', '결단력과 추진력', '전략적 사고', '책임감과 효율 추구'],
    weaknesses: ['독단적으로 비칠 수 있음', '타인의 감정을 놓침', '참을성이 부족함'],
    compatibility: {
      intp: '⭐ 최고 궁합 — 비전을 정교한 논리로 받쳐 준다',
      infp: '🔥 의외의 조화 — 강한 추진력에 깊은 가치를 더한다',
    },
  },
  entp: {
    id: 'entp',
    name: 'ENTP · 변론가',
    tagline: '재미없는 정답보다 재미있는 반론을 택한다.',
    description:
      '아이디어가 샘솟고 토론을 즐기는 만능 토론가. 고정관념을 흔드는 걸 즐기며, 어떤 주제든 새로운 각도를 찾아낸다. 시작은 화려하나 마무리가 약점.',
    strengths: ['번뜩이는 창의력', '뛰어난 임기응변', '두려움 없는 도전', '활발한 토론 능력'],
    weaknesses: ['마무리가 약함', '논쟁을 즐기다 선을 넘음', '꾸준한 루틴을 싫어함'],
    compatibility: {
      intj: '⭐ 최고 궁합 — 흩어진 아이디어에 전략의 틀을 입힌다',
      infj: '🔥 깊은 끌림 — 가벼운 재치 뒤의 진심을 알아본다',
    },
  },
  infj: {
    id: 'infj',
    name: 'INFJ · 옹호자',
    tagline: '말하지 않아도 당신의 진심을 먼저 읽는다.',
    description:
      '깊은 통찰과 따뜻한 이상을 동시에 가진 드문 유형. 사람의 마음을 꿰뚫고, 더 나은 세상을 조용히 꿈꾼다. 겉은 부드럽지만 신념은 누구보다 단단하다.',
    strengths: ['뛰어난 공감과 통찰', '확고한 신념과 가치관', '깊이 있는 인간관계', '창의적 표현력'],
    weaknesses: ['혼자 너무 많이 끌어안음', '완벽주의로 지침', '갈등을 회피하려 함'],
    compatibility: {
      enfp: '⭐ 최고 궁합 — 닫힌 마음을 환하게 열어 준다',
      entp: '🔥 지적 자극 — 생각의 지평을 넓혀 주는 짝',
    },
  },
  infp: {
    id: 'infp',
    name: 'INFP · 중재자',
    tagline: '세상을 자기만의 색으로 다시 칠하는 몽상가.',
    description:
      '깊은 내면과 단단한 가치관을 품은 따뜻한 이상주의자. 진정성을 무엇보다 중시하고, 작은 것에서도 의미와 아름다움을 발견한다. 조용하지만 그 안엔 불꽃이 있다.',
    strengths: ['진심 어린 공감 능력', '풍부한 상상력과 감수성', '확고한 가치관', '유연하고 개방적인 태도'],
    weaknesses: ['비현실적으로 흐를 때가 있음', '비판에 쉽게 상처받음', '결정을 미루는 경향'],
    compatibility: {
      enfj: '⭐ 최고 궁합 — 흔들리는 마음을 든든히 지지해 준다',
      entj: '🔥 성장의 짝 — 이상을 현실로 끌어올려 준다',
    },
  },
  enfj: {
    id: 'enfj',
    name: 'ENFJ · 선도자',
    tagline: '사람들의 잠재력을 가장 먼저 알아보고 끌어올린다.',
    description:
      '타고난 카리스마와 따뜻함으로 사람을 이끄는 멘토형. 모두가 성장하고 어울리길 바라며, 그 마음을 행동으로 옮긴다. 주변을 환하게 만드는 사람.',
    strengths: ['뛰어난 소통과 설득력', '진심 어린 배려', '사람을 이끄는 리더십', '높은 공감 능력'],
    weaknesses: ['남을 챙기다 자신을 놓침', '인정받고 싶은 욕구가 큼', '비판에 예민함'],
    compatibility: {
      infp: '⭐ 최고 궁합 — 깊은 진심을 가장 잘 알아본다',
      intp: '🔥 보완의 짝 — 따뜻함과 논리가 균형을 이룬다',
    },
  },
  enfp: {
    id: 'enfp',
    name: 'ENFP · 활동가',
    tagline: '들어오는 순간 공간의 온도를 바꾸는 사람.',
    description:
      '에너지와 호기심이 넘치는 자유로운 영혼. 사람과 가능성에 매료되고, 어디서든 새로운 즐거움을 발견한다. 진심 어린 열정으로 주변을 끌어당긴다.',
    strengths: ['넘치는 열정과 에너지', '뛰어난 공감과 친화력', '창의적이고 호기심 많음', '사람을 북돋우는 긍정성'],
    weaknesses: ['집중과 마무리가 약함', '감정 기복이 있음', '지루한 루틴을 못 견딤'],
    compatibility: {
      intj: '⭐ 최고 궁합 — 흩날리는 열정에 단단한 방향을 준다',
      infj: '🔥 영혼의 짝 — 가벼움 뒤의 깊이를 알아본다',
    },
  },
  istj: {
    id: 'istj',
    name: 'ISTJ · 현실주의자',
    tagline: '한 번 한다고 하면 반드시 끝까지 해낸다.',
    description:
      '책임감과 성실함의 대명사. 약속을 지키고, 원칙을 따르며, 맡은 일을 빈틈없이 처리한다. 화려하진 않아도 가장 믿음직한 든든한 기둥.',
    strengths: ['철저한 책임감', '꼼꼼하고 정확함', '강한 인내와 끈기', '신뢰할 수 있는 일처리'],
    weaknesses: ['변화에 적응이 더딤', '융통성이 부족할 때가 있음', '감정 표현이 인색함'],
    compatibility: {
      esfp: '⭐ 최고 궁합 — 굳은 일상에 활력을 불어넣어 준다',
      estp: '🔥 든든한 균형 — 안정과 활동성이 맞물린다',
    },
  },
  isfj: {
    id: 'isfj',
    name: 'ISFJ · 수호자',
    tagline: '티 내지 않고 모두를 챙기는 조용한 버팀목.',
    description:
      '따뜻한 헌신과 성실함으로 주변을 돌보는 사람. 작은 것까지 기억하고 챙기며, 묵묵히 자기 자리를 지킨다. 겉은 부드러워도 책임감은 누구보다 강하다.',
    strengths: ['세심한 배려와 헌신', '강한 책임감', '꾸준하고 성실함', '따뜻한 공감 능력'],
    weaknesses: ['거절을 어려워함', '자기 희생이 지나침', '변화를 부담스러워함'],
    compatibility: {
      estp: '⭐ 최고 궁합 — 굳은 마음을 신나게 흔들어 준다',
      esfp: '🔥 따뜻한 활기 — 헌신에 즐거움을 더한다',
    },
  },
  estj: {
    id: 'estj',
    name: 'ESTJ · 경영자',
    tagline: '체계가 없으면 직접 만들어서라도 굴린다.',
    description:
      '질서와 효율을 사랑하는 타고난 관리자. 규칙을 세우고 일을 체계적으로 굴리며, 책임감 있게 결과를 만들어낸다. 든든하고 명확한 현실의 리더.',
    strengths: ['뛰어난 조직력과 추진력', '강한 책임감', '현실적인 판단력', '명확한 결단'],
    weaknesses: ['고집스러울 수 있음', '감정보다 효율을 앞세움', '변화에 보수적'],
    compatibility: {
      isfp: '⭐ 최고 궁합 — 딱딱함을 부드럽게 녹여 준다',
      istp: '🔥 실용의 짝 — 효율과 융통성이 맞물린다',
    },
  },
  esfj: {
    id: 'esfj',
    name: 'ESFJ · 집정관',
    tagline: '모임의 분위기를 책임지는 따뜻한 호스트.',
    description:
      '사람을 챙기고 조화를 만드는 데 천부적인 사교가. 주변의 필요를 먼저 알아채고 살뜰히 돌본다. 함께 있으면 누구나 환영받는 느낌을 받는다.',
    strengths: ['따뜻한 친화력', '세심한 배려', '책임감 있는 협력', '뛰어난 분위기 메이커'],
    weaknesses: ['타인 평가에 민감함', '갈등을 회피함', '인정받고 싶은 욕구가 큼'],
    compatibility: {
      isfp: '⭐ 최고 궁합 — 조용한 진심을 따뜻하게 품어 준다',
      istp: '🔥 보완의 짝 — 활기와 차분함이 균형을 이룬다',
    },
  },
  istp: {
    id: 'istp',
    name: 'ISTP · 장인',
    tagline: '말보다 손이 먼저 움직여 문제를 해결한다.',
    description:
      '냉철한 관찰력과 실용적 손재주를 가진 해결사. 위기에서도 침착하고, 직접 만지고 부딪치며 답을 찾는다. 군더더기 없이 효율적으로 움직인다.',
    strengths: ['뛰어난 위기 대처력', '실용적 문제 해결', '침착하고 독립적', '손재주와 응용력'],
    weaknesses: ['감정 표현에 무뚝뚝함', '장기 계획을 싫어함', '쉽게 지루해함'],
    compatibility: {
      esfj: '⭐ 최고 궁합 — 무심함을 따뜻하게 풀어 준다',
      estj: '🔥 실용의 짝 — 융통성과 체계가 맞물린다',
    },
  },
  isfp: {
    id: 'isfp',
    name: 'ISFP · 모험가',
    tagline: '말없이, 자기만의 방식으로 아름다움을 살아낸다.',
    description:
      '감각적이고 자유로운 예술가형. 순간의 아름다움을 느끼고 자기만의 방식으로 표현한다. 겉은 조용해도 내면엔 풍부한 감성과 단단한 가치가 흐른다.',
    strengths: ['뛰어난 미적 감각', '따뜻하고 진정성 있음', '유연하고 개방적', '현재를 충실히 즐김'],
    weaknesses: ['갈등을 회피함', '계획성이 부족함', '비판에 쉽게 위축됨'],
    compatibility: {
      estj: '⭐ 최고 궁합 — 흩어진 일상에 방향을 잡아 준다',
      esfj: '🔥 따뜻한 짝 — 조용한 마음을 환히 비춰 준다',
    },
  },
  estp: {
    id: 'estp',
    name: 'ESTP · 사업가',
    tagline: '망설일 시간에 일단 부딪혀 보는 행동파.',
    description:
      '에너지와 배짱으로 무장한 현장의 승부사. 위기를 기회로 바꾸고, 지금 이 순간을 누구보다 즐긴다. 머리보다 몸이 먼저 나가는 타고난 액션 히어로.',
    strengths: ['뛰어난 순발력과 배짱', '현실적인 추진력', '강한 사교성', '위기에서 빛나는 대응력'],
    weaknesses: ['충동적으로 행동함', '장기 계획에 약함', '인내심이 부족함'],
    compatibility: {
      isfj: '⭐ 최고 궁합 — 거친 질주에 따뜻한 균형을 준다',
      istj: '🔥 든든한 짝 — 즉흥성에 안정감을 더한다',
    },
  },
  esfp: {
    id: 'esfp',
    name: 'ESFP · 연예인',
    tagline: '인생은 무대, 매 순간을 즐길 줄 아는 스타.',
    description:
      '넘치는 활력과 매력으로 분위기를 사로잡는 자유로운 영혼. 사람들과 어울리며 지금을 마음껏 즐기고, 어디서든 즐거움을 만들어낸다. 함께 있으면 시간이 빨리 간다.',
    strengths: ['타고난 사교성과 매력', '넘치는 활력', '현재를 즐기는 긍정성', '뛰어난 분위기 메이커'],
    weaknesses: ['계획과 집중이 약함', '쉽게 지루해함', '비판에 민감함'],
    compatibility: {
      istj: '⭐ 최고 궁합 — 들뜬 발걸음에 단단한 땅을 깔아 준다',
      isfj: '🔥 따뜻한 짝 — 활기에 깊은 안정을 더한다',
    },
  },
};

export const mbtiProfilesEn: Record<string, PersonalityProfile> = {
  intj: {
    id: 'intj',
    name: 'INTJ · The Strategist',
    tagline: 'Already playing three moves ahead in their head.',
    description:
      'A long-game thinker who designs the big picture and works toward it one calculated move at a time. Allergic to inefficiency and small talk, always engineering a better way. Sharpest when thinking deeply alone.',
    strengths: ['Long-term strategic vision', 'Independent and self-driven', 'Solves complex problems', 'High standards and follow-through'],
    weaknesses: ['Can come across as overly critical', 'Awkward with emotions', 'Impatient with inefficiency'],
    compatibility: {
      enfp: '⭐ Best match — warms up cold strategy with bright inspiration',
      entp: '🔥 Debate partner — endlessly sharpens each other\'s minds',
    },
  },
  intp: {
    id: 'intp',
    name: 'INTP · The Logician',
    tagline: 'Will take apart the universe with a single "Why?"',
    description:
      'A thinker who disassembles and rebuilds the world through logic. Endlessly curious, more enchanted by "why" than by the answer itself. The inner world is dazzling; tidying up real life, less so.',
    strengths: ['Sharp analysis and insight', 'Original ideas', 'Unbiased thinking', 'Deep focus'],
    weaknesses: ['Gets stuck thinking instead of doing', 'Awkward with emotional exchange', 'Weak on details and deadlines'],
    compatibility: {
      entj: '⭐ Best match — pushes ideas into reality',
      enfj: '🔥 Warm balance — adds a human touch to dry logic',
    },
  },
  entj: {
    id: 'entj',
    name: 'ENTJ · The Commander',
    tagline: 'Somehow always ends up holding the wheel.',
    description:
      'A born leader who rallies people and resources to make goals happen. Decisive, intolerant of waste, and relentless on the climb to the top.',
    strengths: ['Powerful leadership', 'Decisive and driven', 'Strategic thinking', 'Responsible and efficient'],
    weaknesses: ['Can seem domineering', 'Misses others\' feelings', 'Short on patience'],
    compatibility: {
      intp: '⭐ Best match — backs the vision with precise logic',
      infp: '🔥 Surprising harmony — adds deep values to raw drive',
    },
  },
  entp: {
    id: 'entp',
    name: 'ENTP · The Debater',
    tagline: 'Prefers a fun counterargument to a boring right answer.',
    description:
      'An idea machine who lives for a good debate. Loves shaking up assumptions and finding a fresh angle on anything. Brilliant at starting; finishing is the weak spot.',
    strengths: ['Flashes of creativity', 'Quick on their feet', 'Fearless about new challenges', 'Lively at debate'],
    weaknesses: ['Struggles to finish', 'Can push an argument too far', 'Hates steady routine'],
    compatibility: {
      intj: '⭐ Best match — gives scattered ideas a strategic frame',
      infj: '🔥 Deep pull — sees the sincerity behind the wit',
    },
  },
  infj: {
    id: 'infj',
    name: 'INFJ · The Advocate',
    tagline: 'Reads your heart before you say a word.',
    description:
      'A rare blend of deep insight and warm idealism. Sees straight through people and quietly dreams of a better world. Soft on the surface, but few hold convictions as firm.',
    strengths: ['Deep empathy and insight', 'Firm values and conviction', 'Meaningful relationships', 'Creative expression'],
    weaknesses: ['Carries too much alone', 'Burns out on perfectionism', 'Avoids conflict'],
    compatibility: {
      enfp: '⭐ Best match — throws open a guarded heart',
      entp: '🔥 Intellectual spark — widens their horizons',
    },
  },
  infp: {
    id: 'infp',
    name: 'INFP · The Mediator',
    tagline: 'A dreamer who repaints the world in their own colors.',
    description:
      'A warm idealist with a rich inner life and firm values. Prizes authenticity above all and finds meaning and beauty in the smallest things. Quiet, but there\'s a fire inside.',
    strengths: ['Genuine empathy', 'Vivid imagination and sensitivity', 'Strong personal values', 'Flexible and open-minded'],
    weaknesses: ['Can drift into the unrealistic', 'Wounded easily by criticism', 'Tends to put off decisions'],
    compatibility: {
      enfj: '⭐ Best match — steadies a wavering heart',
      entj: '🔥 Growth match — lifts ideals into reality',
    },
  },
  enfj: {
    id: 'enfj',
    name: 'ENFJ · The Protagonist',
    tagline: 'Spots your potential before you do — and draws it out.',
    description:
      'A natural mentor who leads with charisma and warmth. Wants everyone to grow and belong, and turns that wish into action. Lights up the room around them.',
    strengths: ['Great communicator and persuader', 'Genuine care for others', 'Inspiring leadership', 'High empathy'],
    weaknesses: ['Loses self while caring for others', 'Craves approval', 'Sensitive to criticism'],
    compatibility: {
      infp: '⭐ Best match — sees their deep sincerity clearest',
      intp: '🔥 Complement — warmth and logic in balance',
    },
  },
  enfp: {
    id: 'enfp',
    name: 'ENFP · The Campaigner',
    tagline: 'Changes the temperature of a room just by walking in.',
    description:
      'A free spirit overflowing with energy and curiosity. Captivated by people and possibilities, finding new joy everywhere. Pulls others in with genuine enthusiasm.',
    strengths: ['Boundless energy and passion', 'Warm and empathetic', 'Creative and curious', 'Uplifting positivity'],
    weaknesses: ['Weak on focus and finishing', 'Emotional ups and downs', 'Can\'t stand dull routine'],
    compatibility: {
      intj: '⭐ Best match — gives scattered passion a firm direction',
      infj: '🔥 Soulmate — sees the depth behind the lightness',
    },
  },
  istj: {
    id: 'istj',
    name: 'ISTJ · The Logistician',
    tagline: 'If they say they\'ll do it, consider it done.',
    description:
      'The very definition of responsibility and diligence. Keeps their word, follows the rules, and handles every task without a gap. Not flashy, but the most dependable pillar around.',
    strengths: ['Rock-solid responsibility', 'Thorough and accurate', 'Patience and persistence', 'Reliable execution'],
    weaknesses: ['Slow to adapt to change', 'Can lack flexibility', 'Sparing with emotion'],
    compatibility: {
      esfp: '⭐ Best match — brings spark to a rigid routine',
      estp: '🔥 Solid balance — stability meets liveliness',
    },
  },
  isfj: {
    id: 'isfj',
    name: 'ISFJ · The Defender',
    tagline: 'The quiet backbone who takes care of everyone without fanfare.',
    description:
      'A warm, devoted soul who looks after those around them. Remembers the little things and holds their post without complaint. Gentle on the outside, but with a fierce sense of duty.',
    strengths: ['Thoughtful and devoted', 'Strong sense of responsibility', 'Steady and diligent', 'Warm empathy'],
    weaknesses: ['Finds it hard to say no', 'Self-sacrifices too much', 'Uneasy with change'],
    compatibility: {
      estp: '⭐ Best match — shakes up a steady heart in the best way',
      esfp: '🔥 Warm energy — adds joy to devotion',
    },
  },
  estj: {
    id: 'estj',
    name: 'ESTJ · The Executive',
    tagline: 'No system? They\'ll build one and run it themselves.',
    description:
      'A born manager who loves order and efficiency. Sets the rules, keeps things running, and delivers results with accountability. A clear, dependable leader of the real world.',
    strengths: ['Great at organizing and driving', 'Strong sense of duty', 'Practical judgment', 'Clear decisions'],
    weaknesses: ['Can be stubborn', 'Puts efficiency over feelings', 'Conservative about change'],
    compatibility: {
      isfp: '⭐ Best match — softens the hard edges',
      istp: '🔥 Practical match — efficiency meets flexibility',
    },
  },
  esfj: {
    id: 'esfj',
    name: 'ESFJ · The Consul',
    tagline: 'The warm host who owns the vibe of any gathering.',
    description:
      'A natural at caring for people and creating harmony. Senses what others need and tends to it generously. Around them, everyone feels welcome.',
    strengths: ['Warm and sociable', 'Thoughtful and caring', 'Responsible team player', 'Excellent at setting the mood'],
    weaknesses: ['Sensitive to others\' opinions', 'Avoids conflict', 'Craves recognition'],
    compatibility: {
      isfp: '⭐ Best match — warmly embraces their quiet sincerity',
      istp: '🔥 Complement — liveliness meets calm',
    },
  },
  istp: {
    id: 'istp',
    name: 'ISTP · The Virtuoso',
    tagline: 'Their hands solve the problem before words even start.',
    description:
      'A cool-headed troubleshooter with practical, hands-on skill. Calm in a crisis, finding answers by getting in and tinkering. Moves with lean, no-nonsense efficiency.',
    strengths: ['Great in a crisis', 'Practical problem-solving', 'Calm and independent', 'Hands-on adaptability'],
    weaknesses: ['Blunt with emotions', 'Dislikes long-term planning', 'Gets bored easily'],
    compatibility: {
      esfj: '⭐ Best match — warms up their cool detachment',
      estj: '🔥 Practical match — flexibility meets structure',
    },
  },
  isfp: {
    id: 'isfp',
    name: 'ISFP · The Adventurer',
    tagline: 'Lives out beauty quietly, in their own way.',
    description:
      'A sensory, free-spirited artist type. Feels the beauty of the moment and expresses it their own way. Quiet outside, but rich emotion and firm values run beneath.',
    strengths: ['Strong aesthetic sense', 'Warm and authentic', 'Flexible and open', 'Fully enjoys the present'],
    weaknesses: ['Avoids conflict', 'Short on planning', 'Easily shaken by criticism'],
    compatibility: {
      estj: '⭐ Best match — gives a drifting routine direction',
      esfj: '🔥 Warm match — brightens a quiet heart',
    },
  },
  estp: {
    id: 'estp',
    name: 'ESTP · The Entrepreneur',
    tagline: 'Why hesitate when you can just dive in?',
    description:
      'A field-tested competitor armed with energy and nerve. Turns crises into chances and lives in the moment like no one else. A born action hero whose body moves before the mind does.',
    strengths: ['Quick reflexes and guts', 'Practical drive', 'Highly sociable', 'Shines under pressure'],
    weaknesses: ['Acts impulsively', 'Weak on long-term plans', 'Short on patience'],
    compatibility: {
      isfj: '⭐ Best match — brings warm balance to the wild ride',
      istj: '🔥 Solid match — adds stability to spontaneity',
    },
  },
  esfp: {
    id: 'esfp',
    name: 'ESFP · The Entertainer',
    tagline: 'Life\'s a stage, and they know how to enjoy every scene.',
    description:
      'A free spirit who captivates the room with energy and charm. Lives in the now, mingling with people and making fun wherever they go. Time flies when they\'re around.',
    strengths: ['Natural charm and sociability', 'Boundless energy', 'Lives joyfully in the present', 'Great at setting the mood'],
    weaknesses: ['Weak on planning and focus', 'Gets bored easily', 'Sensitive to criticism'],
    compatibility: {
      istj: '⭐ Best match — lays solid ground under restless feet',
      isfj: '🔥 Warm match — adds deep steadiness to the energy',
    },
  },
};
