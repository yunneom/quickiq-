import type { PersonalityQuestion } from '../types';

/**
 * 15 questions × 2 locales for the 아재력 테스트 (Ajae-power quiz).
 * The mirror image of the slang quiz: it tests knowledge of 80s–00s
 * Korean culture, and the MORE you know, the more of an 아재 you're
 * certified as. Correct option grants { A: 1 }.
 *
 * The EN version quizzes retro Korean culture with context so overseas
 * K-culture fans can play too.
 */

export const ajaeQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'aj-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '삐삐(호출기)에 찍힌 "8282"의 뜻은?',
    options: [
      { id: 'A', text: '빨리빨리', scores: { A: 1 } },
      { id: 'B', text: '바이바이', scores: { A: 0 } },
      { id: 'C', text: '팔이 아프다', scores: { A: 0 } },
      { id: 'D', text: '야근 확정', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '천리안·하이텔·나우누리의 공통점은?',
    options: [
      { id: 'A', text: '90년대 PC통신 서비스', scores: { A: 1 } },
      { id: 'B', text: '옛날 안경 브랜드', scores: { A: 0 } },
      { id: 'C', text: '무협지 제목', scores: { A: 0 } },
      { id: 'D', text: '고속버스 회사', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '"따봉"이 대유행하게 된 원조 출처는?',
    options: [
      { id: 'A', text: '오렌지 주스 광고', scores: { A: 1 } },
      { id: 'B', text: '축구 중계 유행어', scores: { A: 0 } },
      { id: 'C', text: '개그콘서트 코너', scores: { A: 0 } },
      { id: 'D', text: '만화 슬램덩크 대사', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '카세트 테이프가 늘어졌을 때의 응급처치는?',
    options: [
      { id: 'A', text: '연필을 꽂아 되감는다', scores: { A: 1 } },
      { id: 'B', text: '전자레인지에 10초 돌린다', scores: { A: 0 } },
      { id: 'C', text: '물에 헹궈 말린다', scores: { A: 0 } },
      { id: 'D', text: '냉동실에 하루 넣어둔다', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '"국민학교"는 지금의 무엇인가?',
    options: [
      { id: 'A', text: '초등학교', scores: { A: 1 } },
      { id: 'B', text: '유치원', scores: { A: 0 } },
      { id: 'C', text: '중학교', scores: { A: 0 } },
      { id: 'D', text: '방송통신대학교', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '비디오 대여점에서 테이프 반납 전 매너는?',
    options: [
      { id: 'A', text: '끝까지 본 후 되감기 해서 반납', scores: { A: 1 } },
      { id: 'B', text: '테이프를 닦아서 반납', scores: { A: 0 } },
      { id: 'C', text: '명장면에 책갈피 끼우기', scores: { A: 0 } },
      { id: 'D', text: '감상평 메모 붙이기', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '서태지와 아이들의 데뷔곡은?',
    options: [
      { id: 'A', text: '난 알아요', scores: { A: 1 } },
      { id: 'B', text: '컴백홈', scores: { A: 0 } },
      { id: 'C', text: '교실 이데아', scores: { A: 0 } },
      { id: 'D', text: '하여가', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '오락실 스트리트 파이터에서 "류"의 장풍 기술명은?',
    options: [
      { id: 'A', text: '아도겐(하도켄)', scores: { A: 1 } },
      { id: 'B', text: '에네르기파', scores: { A: 0 } },
      { id: 'C', text: '아수라발발타', scores: { A: 0 } },
      { id: 'D', text: '소닉붐', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '버디버디·세이클럽의 공통점은?',
    options: [
      { id: 'A', text: '2000년대 초 메신저/채팅 서비스', scores: { A: 1 } },
      { id: 'B', text: '문방구 앞 뽑기 기계', scores: { A: 0 } },
      { id: 'C', text: '어린이 잡지', scores: { A: 0 } },
      { id: 'D', text: '롤러장 이름', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '"하이루~ 방가방가"를 쓰던 곳은?',
    options: [
      { id: 'A', text: 'PC통신·초기 인터넷 채팅방', scores: { A: 1 } },
      { id: 'B', text: '군대 관등성명', scores: { A: 0 } },
      { id: 'C', text: '수학여행 장기자랑', scores: { A: 0 } },
      { id: 'D', text: '아침 라디오 오프닝', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '"손이 가요 손이 가~" 다음 가사는?',
    options: [
      { id: 'A', text: '새우깡에 손이 가요', scores: { A: 1 } },
      { id: 'B', text: '자꾸만 손이 가요', scores: { A: 0 } },
      { id: 'C', text: '너에게로 손이 가요', scores: { A: 0 } },
      { id: 'D', text: '멈출 수 없는 손이 가요', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '브라운관 TV 화면이 지지직거릴 때 국룰 대처법은?',
    options: [
      { id: 'A', text: 'TV 옆통수를 손바닥으로 친다', scores: { A: 1 } },
      { id: 'B', text: '리모컨 배터리를 뺐다 끼운다', scores: { A: 0 } },
      { id: 'C', text: '와이파이 공유기를 재부팅한다', scores: { A: 0 } },
      { id: 'D', text: 'HDMI 케이블을 갈아 끼운다', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '학창 시절 "옥떨메"의 뜻은?',
    options: [
      { id: 'A', text: '옥상에서 떨어진 메주 (못생겼다는 놀림)', scores: { A: 1 } },
      { id: 'B', text: '옥수수 떡 메밀전 (분식 세트)', scores: { A: 0 } },
      { id: 'C', text: '옥탑방 떨이 메뉴', scores: { A: 0 } },
      { id: 'D', text: '옥구슬 떨어지는 메아리', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '2002 월드컵 4강 신화 당시 대표팀 감독은?',
    options: [
      { id: 'A', text: '거스 히딩크', scores: { A: 1 } },
      { id: 'B', text: '딕 아드보카트', scores: { A: 0 } },
      { id: 'C', text: '핌 베어벡', scores: { A: 0 } },
      { id: 'D', text: '위르겐 클린스만', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '문방구 앞 "달고나(뽑기)"에서 모양 뽑기에 성공하면?',
    options: [
      { id: 'A', text: '하나 더 공짜로 준다', scores: { A: 1 } },
      { id: 'B', text: '현금으로 바꿔준다', scores: { A: 0 } },
      { id: 'C', text: '문방구 상품권을 준다', scores: { A: 0 } },
      { id: 'D', text: '명예의 전당에 이름을 올린다', scores: { A: 0 } },
    ],
  },
];

export const ajaeQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'aj-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'On a 90s Korean pager, "8282" meant:',
    options: [
      { id: 'A', text: '"Hurry hurry" (ppalli-ppalli)', scores: { A: 1 } },
      { id: 'B', text: '"Bye bye"', scores: { A: 0 } },
      { id: 'C', text: '"My arm hurts"', scores: { A: 0 } },
      { id: 'D', text: '"Overtime confirmed"', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-02',
    order_index: 2,
    locale: 'en',
    question_text: 'Chollian, HiTEL, and Nownuri were all:',
    options: [
      { id: 'A', text: '90s Korean PC-communication (dial-up BBS) services', scores: { A: 1 } },
      { id: 'B', text: 'Vintage eyewear brands', scores: { A: 0 } },
      { id: 'C', text: 'Martial-arts novel titles', scores: { A: 0 } },
      { id: 'D', text: 'Express bus companies', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'The thumbs-up word "ttabong (따봉)" exploded in Korea from:',
    options: [
      { id: 'A', text: 'An orange juice TV commercial', scores: { A: 1 } },
      { id: 'B', text: 'A football commentator\'s catchphrase', scores: { A: 0 } },
      { id: 'C', text: 'A comedy show segment', scores: { A: 0 } },
      { id: 'D', text: 'A Slam Dunk manga line', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-04',
    order_index: 4,
    locale: 'en',
    question_text: 'First aid for a stretched cassette tape:',
    options: [
      { id: 'A', text: 'Stick a pencil in the reel and wind it back', scores: { A: 1 } },
      { id: 'B', text: 'Microwave it for 10 seconds', scores: { A: 0 } },
      { id: 'C', text: 'Rinse with water and dry', scores: { A: 0 } },
      { id: 'D', text: 'Freeze it overnight', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-05',
    order_index: 5,
    locale: 'en',
    question_text: '"Gukmin hakgyo (국민학교)" is the old name for:',
    options: [
      { id: 'A', text: 'Elementary school', scores: { A: 1 } },
      { id: 'B', text: 'Kindergarten', scores: { A: 0 } },
      { id: 'C', text: 'Middle school', scores: { A: 0 } },
      { id: 'D', text: 'Open university', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'Video rental store etiquette before returning a tape:',
    options: [
      { id: 'A', text: 'Rewind it to the beginning', scores: { A: 1 } },
      { id: 'B', text: 'Wipe the tape clean', scores: { A: 0 } },
      { id: 'C', text: 'Bookmark the best scene', scores: { A: 0 } },
      { id: 'D', text: 'Attach a written review', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'Seo Taiji and Boys\' legendary 1992 debut song:',
    options: [
      { id: 'A', text: '"Nan Arayo (I Know)"', scores: { A: 1 } },
      { id: 'B', text: '"Come Back Home"', scores: { A: 0 } },
      { id: 'C', text: '"Classroom Idea"', scores: { A: 0 } },
      { id: 'D', text: '"Hayeoga"', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'In Korean arcades, Ryu\'s fireball was shouted as:',
    options: [
      { id: 'A', text: '"Adogen!" (the Korean-arcade Hadouken)', scores: { A: 1 } },
      { id: 'B', text: '"Energy wave!"', scores: { A: 0 } },
      { id: 'C', text: '"Asura-balbalta!"', scores: { A: 0 } },
      { id: 'D', text: '"Sonic boom!"', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'BuddyBuddy and SayClub were:',
    options: [
      { id: 'A', text: 'Early-2000s Korean messengers/chat services', scores: { A: 1 } },
      { id: 'B', text: 'Capsule-toy machines outside stationery stores', scores: { A: 0 } },
      { id: 'C', text: 'Children\'s magazines', scores: { A: 0 } },
      { id: 'D', text: 'Roller rink franchises', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-10',
    order_index: 10,
    locale: 'en',
    question_text: '"Hairu~ bangga-bangga (하이루~ 방가방가)" was the signature greeting of:',
    options: [
      { id: 'A', text: 'PC-communication and early internet chatrooms', scores: { A: 1 } },
      { id: 'B', text: 'Military roll call', scores: { A: 0 } },
      { id: 'C', text: 'School-trip talent shows', scores: { A: 0 } },
      { id: 'D', text: 'Morning radio openings', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'The iconic snack jingle "soni gayo soni ga~" continues with:',
    options: [
      { id: 'A', text: '"…to Saewookkang" (the shrimp cracker)', scores: { A: 1 } },
      { id: 'B', text: '"…again and again"', scores: { A: 0 } },
      { id: 'C', text: '"…toward you"', scores: { A: 0 } },
      { id: 'D', text: '"…and it cannot stop"', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-12',
    order_index: 12,
    locale: 'en',
    question_text: 'The universal fix for a static-filled CRT TV was:',
    options: [
      { id: 'A', text: 'Slap the side of the TV', scores: { A: 1 } },
      { id: 'B', text: 'Reseat the remote batteries', scores: { A: 0 } },
      { id: 'C', text: 'Reboot the Wi-Fi router', scores: { A: 0 } },
      { id: 'D', text: 'Swap the HDMI cable', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'The old schoolyard insult "okddeolme (옥떨메)" is short for:',
    options: [
      { id: 'A', text: '"A meju block dropped off the rooftop" (= ugly)', scores: { A: 1 } },
      { id: 'B', text: 'A corn-rice-cake-buckwheat snack set', scores: { A: 0 } },
      { id: 'C', text: 'Rooftop-room clearance menu', scores: { A: 0 } },
      { id: 'D', text: 'The echo of a falling jade marble', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'Korea\'s 2002 World Cup semifinal squad was coached by:',
    options: [
      { id: 'A', text: 'Guus Hiddink', scores: { A: 1 } },
      { id: 'B', text: 'Dick Advocaat', scores: { A: 0 } },
      { id: 'C', text: 'Pim Verbeek', scores: { A: 0 } },
      { id: 'D', text: 'Jürgen Klinsmann', scores: { A: 0 } },
    ],
  },
  {
    id: 'aj-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'Winning the shape-carving challenge in dalgona (뽑기) got you:',
    options: [
      { id: 'A', text: 'A free extra dalgona', scores: { A: 1 } },
      { id: 'B', text: 'A cash prize', scores: { A: 0 } },
      { id: 'C', text: 'A stationery-store voucher', scores: { A: 0 } },
      { id: 'D', text: 'Your name in the hall of fame', scores: { A: 0 } },
    ],
  },
];
