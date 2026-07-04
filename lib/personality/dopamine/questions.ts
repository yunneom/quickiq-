import type { PersonalityQuestion } from '../types';

/**
 * 15 questions × 2 locales for the 도파민 중독 (dopamine addiction) test.
 * Single D axis; options grant 3 (full addict behavior) / 2 / 1 / 0
 * (monk mode). Total 0–45 mapped to 4 bands in ./index.ts.
 *
 * Content is entertainment-grade self-reflection — clearly labeled
 * "재미용 · 의학적 진단 아님" on the result page. No clinical claims.
 */

export const dopamineQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'dp-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '아침에 눈 뜨자마자 하는 일은?',
    options: [
      { id: 'A', text: '폰부터 집는다. 눈도 덜 떠졌는데 릴스 시청 중', scores: { D: 3 } },
      { id: 'B', text: '알림만 쓱 확인하고 일어난다', scores: { D: 2 } },
      { id: 'C', text: '스트레칭이나 물 한 잔이 먼저', scores: { D: 1 } },
      { id: 'D', text: '폰은 아예 침실에 안 둔다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '숏폼(릴스/쇼츠) "5분만 봐야지" 하고선:',
    options: [
      { id: 'A', text: '정신 차리면 새벽 2시', scores: { D: 3 } },
      { id: 'B', text: '30분~1시간은 기본으로 흘러간다', scores: { D: 2 } },
      { id: 'C', text: '진짜 10분 안에 끈다', scores: { D: 1 } },
      { id: 'D', text: '숏폼 앱 자체가 없다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '엘리베이터를 기다리는 15초 동안:',
    options: [
      { id: 'A', text: '이미 폰 보는 중', scores: { D: 3 } },
      { id: 'B', text: '습관적으로 폰을 꺼냈다가 넣는다', scores: { D: 2 } },
      { id: 'C', text: '그냥 멍 때린다', scores: { D: 1 } },
      { id: 'D', text: '주변 구경하거나 생각 정리', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '밥 먹을 때 나는:',
    options: [
      { id: 'A', text: '영상 없으면 밥이 안 넘어간다', scores: { D: 3 } },
      { id: 'B', text: '혼밥일 때는 영상 필수', scores: { D: 2 } },
      { id: 'C', text: '있으면 보고 없으면 만다', scores: { D: 1 } },
      { id: 'D', text: '밥은 밥, 폰은 폰', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '카톡 알림이 울리면:',
    options: [
      { id: 'A', text: '0.1초 만에 확인. 못 참는다', scores: { D: 3 } },
      { id: 'B', text: '하던 일만 마무리하고 바로 확인', scores: { D: 2 } },
      { id: 'C', text: '몰아서 확인하는 편', scores: { D: 1 } },
      { id: 'D', text: '알림 자체를 꺼놨다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '영상을 볼 때 나의 배속은:',
    options: [
      { id: 'A', text: '1.5배속도 답답해서 스킵 연타', scores: { D: 3 } },
      { id: 'B', text: '배속은 기본, 건너뛰기도 자주', scores: { D: 2 } },
      { id: 'C', text: '웬만하면 정속으로 본다', scores: { D: 1 } },
      { id: 'D', text: '영상 자체를 잘 안 본다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '새벽의 "한 판만 더 / 한 편만 더":',
    options: [
      { id: 'A', text: '매일 반복되는 나와의 싸움 (지는 중)', scores: { D: 3 } },
      { id: 'B', text: '주 2~3회 정도 진다', scores: { D: 2 } },
      { id: 'C', text: '가끔. 다음 날 후회한다', scores: { D: 1 } },
      { id: 'D', text: '잘 시간 되면 그냥 잔다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '폰 없이 화장실에 가면:',
    options: [
      { id: 'A', text: '상상 불가. 다시 가지러 나온다', scores: { D: 3 } },
      { id: 'B', text: '뭔가 허전하고 불안하다', scores: { D: 2 } },
      { id: 'C', text: '살짝 심심한 정도', scores: { D: 1 } },
      { id: 'D', text: '오히려 편하다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '하루 평균 스크린타임은:',
    options: [
      { id: 'A', text: '8시간 이상 (폰이 곧 나의 삶)', scores: { D: 3 } },
      { id: 'B', text: '5~8시간', scores: { D: 2 } },
      { id: 'C', text: '3~5시간', scores: { D: 1 } },
      { id: 'D', text: '3시간 미만', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: 'SNS에 게시물을 올린 후:',
    options: [
      { id: 'A', text: '5분마다 새로고침하며 반응 확인', scores: { D: 3 } },
      { id: 'B', text: '하루에 몇 번씩 들어가 확인', scores: { D: 2 } },
      { id: 'C', text: '알림 오면 보는 정도', scores: { D: 1 } },
      { id: 'D', text: 'SNS에 뭘 올리지 않는다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '맵고 달고 자극적인 음식:',
    options: [
      { id: 'A', text: '더 맵게, 더 달게, 더 자극적으로', scores: { D: 3 } },
      { id: 'B', text: '스트레스 받으면 자동으로 찾게 된다', scores: { D: 2 } },
      { id: 'C', text: '가끔 당길 때만', scores: { D: 1 } },
      { id: 'D', text: '담백한 게 최고다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '여행지에서 멋진 풍경을 만나면:',
    options: [
      { id: 'A', text: '스토리 올리고 반응 확인부터', scores: { D: 3 } },
      { id: 'B', text: '일단 사진 100장 찍고 나중에 본다', scores: { D: 2 } },
      { id: 'C', text: '몇 장 찍고 눈으로 감상', scores: { D: 1 } },
      { id: 'D', text: '사진보다 그 순간에 집중한다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '"심심하다"고 느끼는 순간은:',
    options: [
      { id: 'A', text: '자극이 3초만 끊겨도 심심하다', scores: { D: 3 } },
      { id: 'B', text: '할 일 없이 10분을 못 버틴다', scores: { D: 2 } },
      { id: 'C', text: '심심하면 심심한 대로 보낸다', scores: { D: 1 } },
      { id: 'D', text: '심심할 틈이 없다 (몰입 중)', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '쇼핑 앱을 열어보는 빈도는:',
    options: [
      { id: 'A', text: '매일 들어가서 뭐라도 장바구니에 담는다', scores: { D: 3 } },
      { id: 'B', text: '세일 알림이 오면 참기 힘들다', scores: { D: 2 } },
      { id: 'C', text: '필요할 때만 연다', scores: { D: 1 } },
      { id: 'D', text: '쇼핑 앱이 없다', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '솔직히, 지금 이 테스트를 하는 이유는:',
    options: [
      { id: 'A', text: '알고리즘에 이끌려서 (끝나면 또 뭐 하지?)', scores: { D: 3 } },
      { id: 'B', text: '재밌어 보여서 클릭을 못 참았다', scores: { D: 2 } },
      { id: 'C', text: '친구가 공유해줘서', scores: { D: 1 } },
      { id: 'D', text: '내 습관을 점검해보고 싶어서', scores: { D: 0 } },
    ],
  },
];

export const dopamineQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'dp-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'First thing after waking up:',
    options: [
      { id: 'A', text: 'Grab the phone. Watching reels before my eyes fully open', scores: { D: 3 } },
      { id: 'B', text: 'Quick notification check, then get up', scores: { D: 2 } },
      { id: 'C', text: 'Stretch or a glass of water first', scores: { D: 1 } },
      { id: 'D', text: 'My phone doesn\'t even sleep in my bedroom', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-02',
    order_index: 2,
    locale: 'en',
    question_text: '"Just 5 minutes of shorts," you said. Then:',
    options: [
      { id: 'A', text: 'Suddenly it\'s 2am', scores: { D: 3 } },
      { id: 'B', text: '30–60 minutes evaporate, minimum', scores: { D: 2 } },
      { id: 'C', text: 'Actually stop within 10 minutes', scores: { D: 1 } },
      { id: 'D', text: 'No short-form apps installed', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'During the 15 seconds waiting for an elevator:',
    options: [
      { id: 'A', text: 'Already on my phone', scores: { D: 3 } },
      { id: 'B', text: 'Pull it out by habit, put it back', scores: { D: 2 } },
      { id: 'C', text: 'Just zone out', scores: { D: 1 } },
      { id: 'D', text: 'Look around, organize my thoughts', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-04',
    order_index: 4,
    locale: 'en',
    question_text: 'When eating, I:',
    options: [
      { id: 'A', text: 'Can\'t swallow without a video playing', scores: { D: 3 } },
      { id: 'B', text: 'Need a video only when eating alone', scores: { D: 2 } },
      { id: 'C', text: 'Watch if something\'s on, fine if not', scores: { D: 1 } },
      { id: 'D', text: 'Food is food, phone is phone', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-05',
    order_index: 5,
    locale: 'en',
    question_text: 'A message notification pings:',
    options: [
      { id: 'A', text: 'Checked in 0.1 seconds. Can\'t resist', scores: { D: 3 } },
      { id: 'B', text: 'Finish the current thing, then check right away', scores: { D: 2 } },
      { id: 'C', text: 'Batch-check later', scores: { D: 1 } },
      { id: 'D', text: 'Notifications are off entirely', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'My video playback speed:',
    options: [
      { id: 'A', text: 'Even 1.5x feels slow — skip skip skip', scores: { D: 3 } },
      { id: 'B', text: 'Speed-up by default, frequent skips', scores: { D: 2 } },
      { id: 'C', text: 'Mostly watch at normal speed', scores: { D: 1 } },
      { id: 'D', text: 'Barely watch videos at all', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'The late-night "one more episode / one more game":',
    options: [
      { id: 'A', text: 'A nightly battle with myself (currently losing)', scores: { D: 3 } },
      { id: 'B', text: 'Lose 2–3 times a week', scores: { D: 2 } },
      { id: 'C', text: 'Occasionally — with next-day regret', scores: { D: 1 } },
      { id: 'D', text: 'Bedtime means bed', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'Going to the bathroom without your phone:',
    options: [
      { id: 'A', text: 'Unthinkable. I go back for it', scores: { D: 3 } },
      { id: 'B', text: 'Feels empty and restless', scores: { D: 2 } },
      { id: 'C', text: 'Slightly boring, that\'s all', scores: { D: 1 } },
      { id: 'D', text: 'Honestly, it\'s a relief', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'Average daily screen time:',
    options: [
      { id: 'A', text: '8+ hours (the phone IS my life)', scores: { D: 3 } },
      { id: 'B', text: '5–8 hours', scores: { D: 2 } },
      { id: 'C', text: '3–5 hours', scores: { D: 1 } },
      { id: 'D', text: 'Under 3 hours', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-10',
    order_index: 10,
    locale: 'en',
    question_text: 'After posting on social media:',
    options: [
      { id: 'A', text: 'Refresh every 5 minutes checking reactions', scores: { D: 3 } },
      { id: 'B', text: 'Check in several times a day', scores: { D: 2 } },
      { id: 'C', text: 'Only when a notification arrives', scores: { D: 1 } },
      { id: 'D', text: 'I don\'t post', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'Spicy, sweet, intense flavors:',
    options: [
      { id: 'A', text: 'Spicier, sweeter, more intense — always', scores: { D: 3 } },
      { id: 'B', text: 'Auto-craving them under stress', scores: { D: 2 } },
      { id: 'C', text: 'Only occasionally', scores: { D: 1 } },
      { id: 'D', text: 'Mild and clean wins', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-12',
    order_index: 12,
    locale: 'en',
    question_text: 'You reach a breathtaking view while traveling:',
    options: [
      { id: 'A', text: 'Post the story first, then monitor reactions', scores: { D: 3 } },
      { id: 'B', text: 'Take 100 photos now, look at them never', scores: { D: 2 } },
      { id: 'C', text: 'A few shots, then enjoy with my eyes', scores: { D: 1 } },
      { id: 'D', text: 'Stay in the moment over the camera', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'When do you feel "bored"?',
    options: [
      { id: 'A', text: '3 seconds without stimulation = bored', scores: { D: 3 } },
      { id: 'B', text: 'Can\'t survive 10 unoccupied minutes', scores: { D: 2 } },
      { id: 'C', text: 'Boredom is fine, I let it pass', scores: { D: 1 } },
      { id: 'D', text: 'No time to be bored (deep in flow)', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'How often do you open shopping apps?',
    options: [
      { id: 'A', text: 'Daily — always something lands in the cart', scores: { D: 3 } },
      { id: 'B', text: 'Sale notifications are hard to resist', scores: { D: 2 } },
      { id: 'C', text: 'Only when I need something', scores: { D: 1 } },
      { id: 'D', text: 'No shopping apps installed', scores: { D: 0 } },
    ],
  },
  {
    id: 'dp-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'Honestly — why are you taking this test right now?',
    options: [
      { id: 'A', text: 'The algorithm led me here (what\'s next after this?)', scores: { D: 3 } },
      { id: 'B', text: 'Looked fun, couldn\'t resist the click', scores: { D: 2 } },
      { id: 'C', text: 'A friend shared it', scores: { D: 1 } },
      { id: 'D', text: 'Genuinely auditing my habits', scores: { D: 0 } },
    ],
  },
];
