import type { PersonalityProfile } from '../types';

export const slangProfilesKo: Record<string, PersonalityProfile> = {
  grandpa: {
    id: 'grandpa',
    name: '70대 할배 판정 👴',
    tagline: '"라떼는 말이야…" 시전 직전',
    description:
      '충격적인 결과입니다. 신조어 이해도가 사실상 0에 수렴했어요. 실제 나이가 몇이든, 당신의 언어 나이는 70대로 판정되었습니다. 단톡방에서 조카들이 하는 말을 못 알아듣고 "ㅇㅋ" 하나 보내는 데 3분 걸리는 타입. 하지만 좌절 금지 — 유행어는 어차피 6개월이면 바뀝니다. 지금부터 외워도 늦지 않았…을까요?',
    strengths: [
      '유행에 휩쓸리지 않는 확고한 언어 세계관',
      '"바른말 고운말" 사용의 최후 보루',
      '신조어 모르는 게 오히려 힙할 수도 (역주행 노림수)',
      '세대 차이 밈의 살아있는 표본으로서 희소가치',
    ],
    weaknesses: [
      '조카/자녀와의 대화에서 통역이 필요하다',
      '단톡방 유머에 3박자 늦게 웃는다',
      '"어쩔티비"를 듣고 진짜 TV를 껐을 가능성',
      '이 결과를 부정하고 싶지만 점수가 팩트다',
    ],
  },
  ajae: {
    id: 'ajae',
    name: '아재 확정 🧔',
    tagline: '아는 척은 하는데 반은 틀리는',
    description:
      '신조어를 "들어는 봤는데" 정확한 뜻은 절반쯤 헛짚는 단계입니다. 회식 자리에서 "요즘 애들 말로 킹받네~"라고 했다가 정적이 흐른 경험, 있으시죠? 언어 나이 판정: 40대 후반. 아직 희망은 있습니다. 이 결과를 단톡방에 공유하면 젊은 친구들이 하나씩 가르쳐줄 거예요. 그게 그들의 도파민이니까요.',
    strengths: [
      '신조어를 배우려는 의지는 있다',
      '반쯤은 맞힌다 — 완전한 화석은 아니다',
      '아재개그와 신조어를 섞는 하이브리드 화법 가능',
      '틀려도 당당한 멘탈',
    ],
    weaknesses: [
      '신조어를 쓰는 순간 발음에서 아재 티가 난다',
      '유행이 끝난 신조어를 이제 막 쓰기 시작한다',
      '"요즘 애들 말로~"라는 서두를 꼭 붙인다',
      '조카에게 검수받지 않으면 오용 위험 높음',
    ],
  },
  'mz-passing': {
    id: 'mz-passing',
    name: '무늬만 어른 😎',
    tagline: '몸은 어른, 알고리즘은 10대',
    description:
      '훌륭합니다. 신조어의 뜻과 쓰임새를 대부분 정확히 알고 있어요. 언어 나이 판정: 20대. 숏폼 알고리즘이 잘 관리되고 있다는 증거입니다. 다만 아는 것과 자연스럽게 쓰는 건 다른 문제 — 실전 투입 전에 거울 보고 한 번 연습하는 걸 추천합니다. "폼 미쳤다"는 아무 데나 붙인다고 되는 게 아니거든요.',
    strengths: [
      '신조어 독해력 상위권 — 단톡방 유머 실시간 이해',
      '세대 간 통역사 역할 가능',
      '트렌드 감각이 살아있다',
      '밈의 유통기한을 판별할 줄 안다',
    ],
    weaknesses: [
      '아는 티를 내고 싶어서 근질근질하다',
      '가끔 한 박자 늦은 밈을 쓰다가 들킨다',
      '실사용 시도 시 60% 확률로 어색하다는 평가',
    ],
  },
  alpha: {
    id: 'alpha',
    name: '알파세대 만렙 🔥',
    tagline: '신조어가 모국어인 사람',
    description:
      '만점권 달성. 당신에게 신조어는 공부해서 아는 지식이 아니라 그냥 모국어입니다. 언어 나이 판정: 10대 (알파세대 인증). 유행어의 탄생부터 소멸까지 실시간으로 목격하는 밈 생태계의 원주민이시군요. 유일한 걱정은 — 이 테스트가 너무 쉬워서 킹받았을 수도 있다는 것. 어쩔티비.',
    strengths: [
      '신조어 네이티브 스피커 — 사전이 필요 없다',
      '밈의 탄생 현장을 실시간 목격하는 최전선 거주자',
      '어떤 단톡방에서도 유머 흐름을 주도한다',
      '유행어 유통기한 감지 센서 내장',
    ],
    weaknesses: [
      '표준어로 보고서 쓰는 게 더 어렵다',
      '부모님과의 대화에 통역 앱이 필요하다',
      '6개월 전 밈을 쓰는 사람을 보면 참기 힘들다',
      '이 테스트가 시시해서 이미 뒤로가기를 눌렀을 수도',
    ],
  },
};

export const slangProfilesEn: Record<string, PersonalityProfile> = {
  grandpa: {
    id: 'grandpa',
    name: 'Certified 70-Year-Old 👴',
    tagline: 'One breath away from "back in my day…"',
    description:
      'Shocking result. Your K-slang comprehension is effectively zero. Whatever your real age, your language age is officially 70+. You\'re the type who takes three minutes to send a single "OK" in the group chat. But don\'t despair — slang turns over every six months anyway. It\'s not too late to start memorizing… probably.',
    strengths: [
      'A linguistic worldview unshaken by trends',
      'The last bastion of proper, dignified language',
      'Not knowing slang might loop back around to being cool',
      'Rare specimen value as a living generation-gap meme',
    ],
    weaknesses: [
      'Needs an interpreter to talk to nieces and nephews',
      'Laughs at group-chat jokes three beats late',
      'May have actually turned off the TV at "eo-jjeol-TV"',
      'Wants to deny this result, but the score is a fact',
    ],
  },
  ajae: {
    id: 'ajae',
    name: 'Confirmed Boomer-in-Training 🧔',
    tagline: 'Has heard the words, gets half of them wrong',
    description:
      'You\'ve "heard of" the slang but misfire on about half the meanings. Language age: late 40s. There\'s still hope — share this result in the group chat and the younger ones will teach you word by word. Watching you struggle IS their dopamine.',
    strengths: [
      'Genuine willingness to learn',
      'Gets half right — not a complete fossil',
      'Capable of hybrid dad-joke × slang delivery',
      'Unshakeable confidence even when wrong',
    ],
    weaknesses: [
      'The boomer accent shows the moment you use slang',
      'Adopts slang exactly when it goes out of fashion',
      'Always prefixes with "as the kids say…"',
      'High misuse risk without a niece/nephew review',
    ],
  },
  'mz-passing': {
    id: 'mz-passing',
    name: 'Adult on Paper Only 😎',
    tagline: 'Grown-up body, teenage algorithm',
    description:
      'Impressive. You know most of the slang accurately. Language age: 20s. Your short-form algorithm is clearly well maintained. But knowing and using naturally are different problems — rehearse in the mirror before field deployment. "Pom michyeotda" can\'t just be attached anywhere.',
    strengths: [
      'Top-tier slang literacy — real-time group chat comprehension',
      'Can serve as a cross-generation interpreter',
      'Trend radar fully operational',
      'Can judge a meme\'s expiration date',
    ],
    weaknesses: [
      'Itching to show off the knowledge',
      'Occasionally caught using a meme one beat late',
      '60% chance of sounding awkward in live usage',
    ],
  },
  alpha: {
    id: 'alpha',
    name: 'Gen Alpha Max Level 🔥',
    tagline: 'Slang is your native language',
    description:
      'Near-perfect score. Slang isn\'t studied knowledge for you — it\'s your mother tongue. Language age: teens (Gen Alpha certified). You\'re a native of the meme ecosystem, witnessing slang born and die in real time. Only concern: this test was so easy it might have made you king-level annoyed. Eo-jjeol-TV.',
    strengths: [
      'Native slang speaker — no dictionary needed',
      'Front-row resident of meme ground zero',
      'Leads the humor flow in any group chat',
      'Built-in slang expiration sensor',
    ],
    weaknesses: [
      'Writing a formal report is the harder task',
      'Needs a translation app to talk to parents',
      'Physically pained by people using 6-month-old memes',
      'May have already hit back because this quiz was too easy',
    ],
  },
};
