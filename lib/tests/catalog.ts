/**
 * Single source of truth for the 6-test catalog used by the hub page,
 * per-test OG images, sitemap, and (future) cross-test recommendations.
 * Keep this in sync with the actual route folders under app/[locale]/.
 */

export interface TestCatalogEntry {
  /** URL slug, e.g. 'iq', 'mbti'. Matches the route folder name. */
  slug: 'iq' | 'mbti' | 'attachment' | 'love-lang' | 'enneagram' | 'teto-egen' | 'tf' | 'dopamine';
  /** Eyebrow / brand label shown in cards and OG images. */
  eyebrow: string;
  /** Display title in cards. */
  title: { ko: string; en: string };
  /** One-line hook for cards + OG. */
  tagline: { ko: string; en: string };
  /** Total question count. */
  questions: number;
  /** Approx. minutes to complete (string for "분"/"min" handling per locale). */
  minutes: number;
  /** Tailwind classes for the card accent + OG gradient. */
  accentBg: string;
  accentText: string;
  /** Gradient stops for OG image background, hex pairs. */
  gradient: { from: string; to: string };
  /** Emoji icon shown in cards. */
  emoji: string;
  /** Long-tail FAQ entries rendered on the test landing + emitted as
   *  FaqPage JSON-LD. Optional because the IQ test sources its FAQ
   *  from messages/ko.json (legacy). */
  faqs?: { ko: { q: string; a: string }[]; en: { q: string; a: string }[] };
}

export const TEST_CATALOG: TestCatalogEntry[] = [
  {
    slug: 'mbti',
    eyebrow: '16 PERSONALITIES',
    title: { ko: '16 성격 유형', en: '16 Personalities' },
    tagline: {
      ko: '진짜 내 성격은 16유형 중 무엇?',
      en: 'Which of the 16 types are you?',
    },
    questions: 20,
    minutes: 3,
    accentBg: 'bg-violet-100',
    accentText: 'text-violet-700',
    gradient: { from: '#7c3aed', to: '#4338ca' },
    emoji: '💜',
    faqs: {
      ko: [
        {
          q: '16가지 성격 유형 테스트가 정확한가요?',
          a: '20개 문항으로 4가지 차원(E/I·S/N·T/F·J/P) 각 5문항씩 측정해 16유형으로 분류합니다. 학술 MBTI보다 단순화된 자기 보고식 추정치이며, 임상 진단 도구가 아닙니다.',
        },
        {
          q: '결과는 평생 같은가요?',
          a: '아니요. 성격 유형은 인생 단계·상황에 따라 변할 수 있어요. 3개월·6개월 간격으로 다시 응시하면서 본인 변화를 추적해 보세요.',
        },
        {
          q: '내 유형에 맞는 직업이 궁금해요',
          a: '결과 페이지에서 본인 유형을 클릭하면 강점·약점·궁합·추천 활동까지 상세 분석을 볼 수 있어요.',
        },
        {
          q: '연인과 궁합도 볼 수 있나요?',
          a: '결과 페이지의 궁합 섹션에서 16유형 중 어떤 유형과 잘 맞는지 한눈에 확인할 수 있어요. 연인에게 링크 공유 → 두 결과 비교가 가장 재미있어요.',
        },
        {
          q: '익명으로 응시되나요?',
          a: '네. 로그인·이메일 입력 없이 익명 세션으로 진행됩니다. 응답은 통계 목적으로만 저장돼요.',
        },
      ],
      en: [
        {
          q: 'Is the 16-type personality test accurate?',
          a: '20 questions measure 4 dichotomies (E/I, S/N, T/F, J/P) with 5 items each, mapping to 16 types. It is a simplified self-report estimate, not a clinical diagnostic tool.',
        },
        {
          q: 'Will my result stay the same forever?',
          a: 'No. Personality types can shift across life stages and contexts. Retake every 3–6 months to track how you change.',
        },
        {
          q: 'How do I see careers that match my type?',
          a: 'Click your type on the result page for the full breakdown — strengths, weaknesses, compatibility, and recommended activities.',
        },
        {
          q: 'Can I check compatibility with my partner?',
          a: 'The compatibility section on each result shows which of the 16 types fit best. Share the link and compare two results — that is where it gets fun.',
        },
        {
          q: 'Is it anonymous?',
          a: 'Yes. No login, no email — runs as an anonymous session. Responses are stored only for aggregate statistics.',
        },
      ],
    },
  },
  {
    slug: 'teto-egen',
    eyebrow: 'TETO · EGEN',
    title: { ko: '테토 vs 에겐', en: 'Teto vs Egen' },
    tagline: {
      ko: '당신은 테토? 에겐? 호르몬 유형',
      en: 'Are you Teto or Egen? Hormone type',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-pink-100',
    accentText: 'text-pink-700',
    gradient: { from: '#ec4899', to: '#f97316' },
    emoji: '🔥',
    faqs: {
      ko: [
        {
          q: '테토남 / 에겐녀가 뭐예요?',
          a: '테토는 테스토스테론(추진력·직진형) 우세, 에겐은 에스트로겐(공감·관계형) 우세를 비유적으로 표현한 호르몬 유형 분류예요. 성별을 곱해 테토남·테토녀·에겐남·에겐녀 4유형으로 나뉩니다.',
        },
        {
          q: '의학적 호르몬 검사인가요?',
          a: '아니요. 행동·성향 시나리오 기반의 자가 진단 재미 테스트입니다. 실제 호르몬 수치와는 관련이 없어요.',
        },
        {
          q: '연인과 궁합도 볼 수 있나요?',
          a: '4유형 매트릭스로 베스트 매치까지 한눈에 확인 가능해요. 결과 페이지 하단의 궁합 섹션 참고.',
        },
        {
          q: '몇 분이면 끝나요?',
          a: '15문항 · 약 2분이면 끝납니다. 응시 → 결과 → 친구 공유까지 5분 안에 가능.',
        },
        {
          q: '내 결과를 다른 사람과 비교할 수 있어요?',
          a: '결과 페이지의 공유 버튼으로 친구·연인에게 링크 보내고 각자 결과를 비교해 보세요.',
        },
      ],
      en: [
        {
          q: 'What are Teto and Egen?',
          a: 'A pop-psych framing: Teto = testosterone-leaning (driven, direct), Egen = estrogen-leaning (empathic, relational). Combined with gender, you get four types: Teto Guy, Teto Girl, Egen Guy, Egen Girl.',
        },
        {
          q: 'Is this a medical hormone test?',
          a: 'No. It is a self-report entertainment quiz based on behavior and preference scenarios. Not related to actual hormone levels.',
        },
        {
          q: 'Can I check compatibility with my partner?',
          a: 'The 4-type matrix on the result page shows your best matches at a glance.',
        },
        {
          q: 'How long does it take?',
          a: '15 questions, about 2 minutes. Quiz → result → share with a friend in under 5.',
        },
        {
          q: 'Can I compare my result with others?',
          a: 'Use the share button on the result page to send the link to a friend or partner and compare results.',
        },
      ],
    },
  },
  {
    slug: 'attachment',
    eyebrow: 'ATTACHMENT STYLE',
    title: { ko: '애착 유형', en: 'Attachment Style' },
    tagline: {
      ko: '왜 나는 늘 비슷한 연애를 할까?',
      en: 'Why do I keep dating the same way?',
    },
    questions: 16,
    minutes: 3,
    accentBg: 'bg-rose-100',
    accentText: 'text-rose-700',
    gradient: { from: '#f43f5e', to: '#db2777' },
    emoji: '💗',
    faqs: {
      ko: [
        {
          q: '4가지 애착 유형이 뭐예요?',
          a: '심리학자 Hazan & Shaver가 정리한 성인 애착 4유형: 안정형(친밀+독립 균형), 불안형(친밀 욕구↑·버려질 두려움), 회피형(독립↑·친밀 회피), 혼란형(두 가지 다 강함).',
        },
        {
          q: '내 애착 유형은 바꿀 수 있나요?',
          a: '네. 안정형 파트너와의 관계·자기인식·상담 등으로 점진적으로 안정형으로 이동하는 사례가 많아요. 결과를 출발점으로 활용하세요.',
        },
        {
          q: '연인과 궁합을 같이 볼 수 있나요?',
          a: '두 사람이 각각 응시 → 결과 공유 → 4×4 궁합 매트릭스에서 패턴 확인. 가장 흔한 폭발 조합(불안형×회피형) 같은 것도 한눈에 보여요.',
        },
        {
          q: '학술 검사와 같나요?',
          a: '학술 ECR-R(체험형 친밀관계 척도)를 단축한 자기 보고식 추정 도구입니다. 임상 진단이 아니에요.',
        },
        {
          q: '솔로도 의미 있나요?',
          a: '있어요. 과거 연애 패턴을 객관화하고, 다음 관계에서 주의할 점을 미리 알 수 있어요.',
        },
      ],
      en: [
        {
          q: 'What are the four attachment styles?',
          a: 'Hazan & Shaver\'s adult attachment model: Secure (balanced intimacy + independence), Anxious (high need for closeness, fear of abandonment), Avoidant (high independence, avoids intimacy), Fearful (both high).',
        },
        {
          q: 'Can my attachment style change?',
          a: 'Yes. Many people gradually shift toward secure through secure-partner relationships, self-awareness, or therapy. Use this result as a starting point.',
        },
        {
          q: 'Can I compare with my partner?',
          a: 'Both take it, share results, and check the 4×4 compatibility matrix — even classic patterns like anxious × avoidant become visible at a glance.',
        },
        {
          q: 'Is it the same as the academic test?',
          a: 'It is a shortened self-report estimate inspired by ECR-R. Not a clinical diagnostic tool.',
        },
        {
          q: 'Is it useful if I am single?',
          a: 'Yes — surfaces patterns from past relationships and flags what to watch for in the next one.',
        },
      ],
    },
  },
  {
    slug: 'love-lang',
    eyebrow: '5 LOVE LANGUAGES',
    title: { ko: '사랑의 5가지 언어', en: '5 Love Languages' },
    tagline: {
      ko: '당신은 어떻게 사랑받고 싶나요?',
      en: 'How do you want to be loved?',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-red-100',
    accentText: 'text-red-600',
    gradient: { from: '#ef4444', to: '#e11d48' },
    emoji: '❤️',
    faqs: {
      ko: [
        {
          q: '5가지 사랑의 언어가 뭐예요?',
          a: '인정의 말 · 함께하는 시간 · 선물 · 봉사 · 스킨십 — 5가지 방식 중 본인이 사랑받았다고 가장 강하게 느끼는 채널을 찾아 줍니다.',
        },
        {
          q: '내 1순위 사랑의 언어는 평생 같나요?',
          a: '대체로 일관되지만 인생 단계(연애 초·동거·자녀 출산 후 등)에 따라 순위가 바뀌기도 합니다. 6개월 단위로 다시 응시해 보세요.',
        },
        {
          q: '연인의 언어도 같이 확인할 수 있나요?',
          a: '두 사람이 각자 응시해 1순위를 공유하세요. 서로의 언어를 알면 "왜 내가 노력해도 안 통하지?" 패턴이 풀려요.',
        },
        {
          q: '결과는 정확한가요?',
          a: '15개 양자택일 질문으로 5가지 언어 점수를 매겨 순위를 매깁니다. 자기 보고식이라 솔직하게 응답할수록 정확도가 올라요.',
        },
        {
          q: '결제·이메일 입력 필요한가요?',
          a: '아니요. 무료 + 익명. 결과 즉시 공유 가능합니다.',
        },
      ],
      en: [
        {
          q: 'What are the 5 love languages?',
          a: 'Words of Affirmation, Quality Time, Gifts, Acts of Service, Physical Touch — five channels through which people feel most loved. The test ranks all five for you.',
        },
        {
          q: 'Does my #1 love language stay the same forever?',
          a: 'Usually consistent, but rankings can shift across life stages (early dating, moving in, after kids). Retake every 6 months to track.',
        },
        {
          q: 'Can my partner check theirs too?',
          a: 'Both take it and share your #1. Knowing each other\'s language unblocks the "why is my effort not landing?" loop.',
        },
        {
          q: 'How accurate is it?',
          a: '15 forced-choice questions score and rank the five languages. Being honest with answers improves accuracy.',
        },
        {
          q: 'Do I need to pay or sign up?',
          a: 'No. Free and anonymous. Share your result instantly.',
        },
      ],
    },
  },
  {
    slug: 'enneagram',
    eyebrow: 'ENNEAGRAM',
    title: { ko: '에니어그램 9유형', en: 'Enneagram' },
    tagline: {
      ko: '당신의 본질은 9유형 중 무엇?',
      en: 'Which of the 9 types drives you?',
    },
    questions: 18,
    minutes: 3,
    accentBg: 'bg-teal-100',
    accentText: 'text-teal-700',
    gradient: { from: '#14b8a6', to: '#059669' },
    emoji: '🌿',
    faqs: {
      ko: [
        {
          q: '에니어그램이 MBTI와 뭐가 달라요?',
          a: 'MBTI는 "어떻게 행동하느냐"(외향/내향 등 선호) 중심, 에니어그램은 "왜 행동하느냐"(핵심 동기·두려움·욕구) 중심이에요. 깊이가 다른 두 도구라 같이 보면 더 입체적입니다.',
        },
        {
          q: '9유형 다 외워야 하나요?',
          a: '아니요. 결과 페이지에서 본인 유형 + 상위 3유형 그래프가 자동으로 나와요. 가장 강한 1유형부터 천천히 읽어 보세요.',
        },
        {
          q: '에니어그램은 과학적으로 검증된 도구인가요?',
          a: '학계 내 의견이 갈리는 영역이에요. 자기 탐구·코칭에 널리 쓰이지만, 임상 진단 도구는 아닙니다. 본 결과도 추정·재미용입니다.',
        },
        {
          q: '윙(Wing)도 알려주나요?',
          a: '본 무료 테스트는 9유형 중 1순위만 확정합니다. 상위 3유형 그래프로 윙 후보(인접 유형) 가늠은 가능해요.',
        },
        {
          q: '같은 유형끼리 모이면 잘 맞나요?',
          a: '꼭 그렇진 않아요. 유형 간 역동(reinforcing vs balancing)이 따로 있어요. 결과 페이지에서 본인 유형 클릭 → 상세에서 확인.',
        },
      ],
      en: [
        {
          q: 'How is Enneagram different from MBTI?',
          a: 'MBTI focuses on HOW you act (preferences like E/I). Enneagram focuses on WHY (core motivation, fear, desire). Different layers — they complement each other.',
        },
        {
          q: 'Do I have to memorize all 9 types?',
          a: 'No. The result page shows your dominant type plus a top-3 graph. Start with #1 and read deeper.',
        },
        {
          q: 'Is Enneagram scientifically validated?',
          a: 'Mixed opinion in academia. Widely used in self-discovery and coaching, but not a clinical diagnostic tool. This result is also for estimation and entertainment.',
        },
        {
          q: 'Does it tell me my wing?',
          a: 'This free test confirms only your dominant type, but the top-3 graph gives a rough hint at wing candidates (adjacent types).',
        },
        {
          q: 'Do people with the same type get along?',
          a: 'Not always — Enneagram dynamics can be reinforcing or balancing. Click your type on the result page for details.',
        },
      ],
    },
  },
  {
    slug: 'tf',
    eyebrow: 'T or F',
    title: { ko: '너 T야? 테스트', en: 'Are You a T?' },
    tagline: {
      ko: '"너 T야?" 소리 들어봤다면 필수',
      en: 'How T are you, really?',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-sky-100',
    accentText: 'text-sky-700',
    gradient: { from: '#0ea5e9', to: '#6366f1' },
    emoji: '🤖',
    faqs: {
      ko: [
        {
          q: '"너 T야?"가 무슨 뜻이에요?',
          a: 'MBTI의 T(사고형)에서 나온 밈으로, 공감 대신 팩트·해결책부터 내놓는 사람에게 던지는 말이에요. 이 테스트는 15개 상황 문항으로 당신의 팩폭력(T)과 공감력(F)을 측정해 4가지 유형으로 알려줍니다.',
        },
        {
          q: 'MBTI 검사와 같은 건가요?',
          a: '아니요. MBTI의 T/F 개념을 빌린 재미용 상황 반응 테스트입니다. 16유형 전체가 궁금하면 같은 사이트의 16 성격 유형 테스트를 응시해 보세요.',
        },
        {
          q: 'T면 공감 능력이 없는 건가요?',
          a: '전혀요. T는 해결책 제시가 곷 애정 표현인 사람들이에요. 표현 방식이 다를 뿐, 위하는 마음의 크기는 같습니다.',
        },
        {
          q: '몇 분이면 끝나요?',
          a: '15문항, 약 2분이면 충분해요. 결과 공유 카드까지 바로 만들 수 있습니다.',
        },
        {
          q: '연인/친구와 비교할 수 있나요?',
          a: '결과 페이지의 공유 버튼으로 링크를 보내고 서로의 유형과 궁합 코멘트를 비교해 보세요. T×F 조합이 제일 재밌게 나옵니다.',
        },
      ],
      en: [
        {
          q: 'What does "you\'re such a T" mean?',
          a: 'A meme from MBTI\'s T (Thinking) type — thrown at people who lead with facts and solutions instead of empathy. This test measures your fact-power (T) vs empathy-power (F) across 15 scenarios and maps you to 4 types.',
        },
        {
          q: 'Is this the same as an MBTI test?',
          a: 'No. It borrows the T/F concept for an entertainment-grade scenario test. For all 16 types, try the 16 Personalities test on this site.',
        },
        {
          q: 'Does being a T mean I lack empathy?',
          a: 'Not at all. For Ts, offering solutions IS the love language. The care is equal — only the delivery differs.',
        },
        {
          q: 'How long does it take?',
          a: '15 questions, about 2 minutes. Share cards are generated instantly.',
        },
        {
          q: 'Can I compare with my partner or friends?',
          a: 'Use the share button to send your result link and compare types and compatibility notes. T×F pairs are the most fun.',
        },
      ],
    },
  },
  {
    slug: 'dopamine',
    eyebrow: 'DOPAMINE',
    title: { ko: '도파민 중독 테스트', en: 'Dopamine Addiction Test' },
    tagline: {
      ko: '숏폼 끈기 가능? 내 도파민 레벨 확인',
      en: 'Could you quit short-form? Check your level',
    },
    questions: 15,
    minutes: 2,
    accentBg: 'bg-orange-100',
    accentText: 'text-orange-700',
    gradient: { from: '#f97316', to: '#ef4444' },
    emoji: '⚡',
    faqs: {
      ko: [
        {
          q: '도파민 중독이 진짜 있는 병인가요?',
          a: '"도파민 중독"은 의학적 진단명이 아니라, 숏폼·SNS·자극적 콘텐츠에 과의존하는 생활 패턴을 가리키는 유행어예요. 이 테스트는 재미로 점검하는 용도이며 의학적 진단이 아닙니다.',
        },
        {
          q: '점수는 어떻게 계산되나요?',
          a: '문항마다 0~3점, 총 0~45점. 구간에 따라 도파민 수도승 → 밸런스 장인 → 도파민 헌터 → 도파민 노예 4단계로 나뉩니다.',
        },
        {
          q: '도파민 노예가 나왔어요. 어떡하죠?',
          a: '결과 페이지에 단계별 현실적인 개선 팁이 있어요. 시작은 딱 하나 — 오늘 밤 폰을 침실 밖에 두는 것부터. 첫 3일이 고비입니다.',
        },
        {
          q: '몇 분이면 끝나요?',
          a: '15문항 · 약 2분. 스크린타임 확인하는 것보다 덜 무서워요.',
        },
        {
          q: '친구와 비교할 수 있나요?',
          a: '결과 공유 버튼으로 링크를 보내 보세요. 단톡방에서 서로의 등급을 공개하는 순간이 이 테스트의 하이라이트입니다.',
        },
      ],
      en: [
        {
          q: 'Is dopamine addiction a real medical condition?',
          a: '"Dopamine addiction" is a pop term for over-reliance on short-form video, social media, and hyper-stimulation — not a medical diagnosis. This test playfully audits your habits; it is not a medical assessment.',
        },
        {
          q: 'How is the score calculated?',
          a: '0–3 points per question, 0–45 total, banded into 4 levels: Dopamine Monk → Balance Artisan → Dopamine Hunter → Dopamine Goblin.',
        },
        {
          q: 'I got Dopamine Goblin. Now what?',
          a: 'The result page has realistic per-level tips. Start with exactly one change: tonight, your phone sleeps outside the bedroom. The first three days are the hard part.',
        },
        {
          q: 'How long does it take?',
          a: '15 questions, about 2 minutes. Less scary than opening your screen-time report.',
        },
        {
          q: 'Can I compare with friends?',
          a: 'Send your result link with the share button. The moment everyone reveals their level in the group chat is the highlight of this test.',
        },
      ],
    },
  },
  {
    slug: 'iq',
    eyebrow: 'IQ TEST',
    title: { ko: 'IQ 테스트', en: 'IQ Test' },
    tagline: {
      ko: '당신의 추정 IQ는 상위 몇 %?',
      en: 'What percentile is your estimated IQ?',
    },
    questions: 30,
    minutes: 7,
    accentBg: 'bg-brand-100',
    accentText: 'text-brand-700',
    gradient: { from: '#2554e6', to: '#15308f' },
    emoji: '🧠',
  },
];

export function getTestEntry(slug: TestCatalogEntry['slug']): TestCatalogEntry {
  const entry = TEST_CATALOG.find((t) => t.slug === slug);
  if (!entry) throw new Error(`Unknown test slug: ${slug}`);
  return entry;
}
