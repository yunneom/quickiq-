import type { PersonalityQuestion } from '../types';

/**
 * 15 questions × 2 locales for the 신조어 능력고사 (Gen Z/Alpha slang
 * quiz). Unlike the trait tests this is a CORRECT-ANSWER quiz reusing the
 * same option-scoring engine: the right option grants { Y: 1 }, wrong
 * options grant { Y: 0 }. Total correct (0–15) maps to 4 provocative
 * age-band profiles in ./index.ts — the lower you score, the older you
 * get roasted as.
 *
 * The EN version quizzes the same Korean slang with English descriptions
 * (positioned as a K-culture slang quiz for the EN audience).
 */

export const slangQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'sl-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '"억까"의 뜻은?',
    options: [
      { id: 'A', text: '억지로 까기 (무리한 비난)', scores: { Y: 1 } },
      { id: 'B', text: '억울하게 까먹기', scores: { Y: 0 } },
      { id: 'C', text: '억 소리 나게 까불기', scores: { Y: 0 } },
      { id: 'D', text: '1억을 까다 (돈을 날리다)', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '"킹받다"의 뜻은?',
    options: [
      { id: 'A', text: '왕 대접을 받다', scores: { Y: 0 } },
      { id: 'B', text: '몹시 열받다', scores: { Y: 1 } },
      { id: 'C', text: '킹스맨처럼 멋지다', scores: { Y: 0 } },
      { id: 'D', text: '체스에서 킹을 잡다', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '"구취"를 유튜버가 말했다면 그 뜻은?',
    options: [
      { id: 'A', text: '입냄새', scores: { Y: 0 } },
      { id: 'B', text: '구독 취소', scores: { Y: 1 } },
      { id: 'C', text: '구구절절 취소', scores: { Y: 0 } },
      { id: 'D', text: '오래된 취미', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '"쫌쫌따리"의 뜻은?',
    options: [
      { id: 'A', text: '쪼잔한 사람', scores: { Y: 0 } },
      { id: 'B', text: '아주 조금씩 모으는 모양', scores: { Y: 1 } },
      { id: 'C', text: '쫄딱 망한 상태', scores: { Y: 0 } },
      { id: 'D', text: '따라다니는 사람', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '"스불재"의 뜻은?',
    options: [
      { id: 'A', text: '스트레스로 불난 재수', scores: { Y: 0 } },
      { id: 'B', text: '스스로 불러온 재앙', scores: { Y: 1 } },
      { id: 'C', text: '스타일 불량 재판', scores: { Y: 0 } },
      { id: 'D', text: '스피드 불복 재경기', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '"좋댓구알"에 포함되지 않는 것은?',
    options: [
      { id: 'A', text: '좋아요', scores: { Y: 0 } },
      { id: 'B', text: '댓글', scores: { Y: 0 } },
      { id: 'C', text: '공유', scores: { Y: 1 } },
      { id: 'D', text: '알림설정', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '"어쩔티비"에 대한 올바른 응수는?',
    options: [
      { id: 'A', text: '"저쩔냉장고"', scores: { Y: 1 } },
      { id: 'B', text: '"그래서 어쩌라고"', scores: { Y: 0 } },
      { id: 'C', text: '"TV 꺼라"', scores: { Y: 0 } },
      { id: 'D', text: '정중히 사과한다', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '"갓생"의 뜻은?',
    options: [
      { id: 'A', text: '신을 믿는 삶', scores: { Y: 0 } },
      { id: 'B', text: '갓 태어난 인생 (새 출발)', scores: { Y: 0 } },
      { id: 'C', text: '부지런하고 모범적인 삶', scores: { Y: 1 } },
      { id: 'D', text: '갓 쓰고 사는 전통적 삶', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '"군싹"의 뜻은?',
    options: [
      { id: 'A', text: '군대 간 싹수', scores: { Y: 0 } },
      { id: 'B', text: '군침이 싹 도네', scores: { Y: 1 } },
      { id: 'C', text: '군것질 싹쓸이', scores: { Y: 0 } },
      { id: 'D', text: '군말 없이 싹싹하다', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '"점메추"의 뜻은?',
    options: [
      { id: 'A', text: '점심 메뉴 추천', scores: { Y: 1 } },
      { id: 'B', text: '점심 메뉴 추가', scores: { Y: 0 } },
      { id: 'C', text: '점집 메모 추첨', scores: { Y: 0 } },
      { id: 'D', text: '점수 매기고 추월', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '"만반잘부"의 뜻은?',
    options: [
      { id: 'A', text: '만두 반죽 잘 부친다', scores: { Y: 0 } },
      { id: 'B', text: '만나서 반가워 잘 부탁해', scores: { Y: 1 } },
      { id: 'C', text: '만사 반대 잘 버텨', scores: { Y: 0 } },
      { id: 'D', text: '만점 받고 잘 붙어라', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '"당모치"의 뜻은?',
    options: [
      { id: 'A', text: '당장 모여라 치킨집', scores: { Y: 0 } },
      { id: 'B', text: '당연히 모든 치킨은 옳다', scores: { Y: 1 } },
      { id: 'C', text: '당황한 모습 치우기', scores: { Y: 0 } },
      { id: 'D', text: '당일 모의고사 치르기', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '"꾸안꾸"의 뜻은?',
    options: [
      { id: 'A', text: '꾸준히 안 꾸미기', scores: { Y: 0 } },
      { id: 'B', text: '꾸민 듯 안 꾸민 듯', scores: { Y: 1 } },
      { id: 'C', text: '꾸역꾸역 안아주기', scores: { Y: 0 } },
      { id: 'D', text: '꿈에서 안 깨는 꾸러기', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '"폼 미쳤다"는 어떤 상황에서 쓰는 말?',
    options: [
      { id: 'A', text: '자세가 잘못됐다고 지적할 때', scores: { Y: 0 } },
      { id: 'B', text: '기량·상태가 최고라고 감탄할 때', scores: { Y: 1 } },
      { id: 'C', text: '거품(폼)이 많은 커피를 볼 때', scores: { Y: 0 } },
      { id: 'D', text: '서류 양식이 이상할 때', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '"중꺾마"의 뜻은?',
    options: [
      { id: 'A', text: '중간에 꺾인 마음', scores: { Y: 0 } },
      { id: 'B', text: '중요한 건 꺾이지 않는 마음', scores: { Y: 1 } },
      { id: 'C', text: '중국집 꺾어서 마라탕', scores: { Y: 0 } },
      { id: 'D', text: '중고 꺾쇠 마감세일', scores: { Y: 0 } },
    ],
  },
];

export const slangQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'sl-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'Korean slang "eok-kka (억까)" means:',
    options: [
      { id: 'A', text: 'Bashing someone unfairly / forced hate', scores: { Y: 1 } },
      { id: 'B', text: 'Forgetting something unfairly', scores: { Y: 0 } },
      { id: 'C', text: 'Showing off outrageously', scores: { Y: 0 } },
      { id: 'D', text: 'Losing 100 million won', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-02',
    order_index: 2,
    locale: 'en',
    question_text: '"King-batda (킹받다)" means:',
    options: [
      { id: 'A', text: 'Being treated like royalty', scores: { Y: 0 } },
      { id: 'B', text: 'Extremely irritated (KING-level annoyed)', scores: { Y: 1 } },
      { id: 'C', text: 'Looking cool like Kingsman', scores: { Y: 0 } },
      { id: 'D', text: 'Capturing the king in chess', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'When a YouTuber says "gu-chwi (구취)", they mean:',
    options: [
      { id: 'A', text: 'Bad breath', scores: { Y: 0 } },
      { id: 'B', text: 'Unsubscribing (구독 취소)', scores: { Y: 1 } },
      { id: 'C', text: 'Canceling a long story', scores: { Y: 0 } },
      { id: 'D', text: 'An old hobby', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-04',
    order_index: 4,
    locale: 'en',
    question_text: '"Jjom-jjom-ttari (쫌쫌따리)" describes:',
    options: [
      { id: 'A', text: 'A stingy person', scores: { Y: 0 } },
      { id: 'B', text: 'Collecting tiny bits little by little', scores: { Y: 1 } },
      { id: 'C', text: 'Going completely broke', scores: { Y: 0 } },
      { id: 'D', text: 'A clingy follower', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-05',
    order_index: 5,
    locale: 'en',
    question_text: '"Seu-bul-jae (스불재)" is short for:',
    options: [
      { id: 'A', text: 'Stress-induced bad luck', scores: { Y: 0 } },
      { id: 'B', text: 'A disaster you brought upon yourself', scores: { Y: 1 } },
      { id: 'C', text: 'Style violation trial', scores: { Y: 0 } },
      { id: 'D', text: 'Speed dispute rematch', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'Which is NOT part of "jo-daet-gu-al (좋댓구알)"?',
    options: [
      { id: 'A', text: 'Like', scores: { Y: 0 } },
      { id: 'B', text: 'Comment', scores: { Y: 0 } },
      { id: 'C', text: 'Share', scores: { Y: 1 } },
      { id: 'D', text: 'Notification bell', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'The correct comeback to "eo-jjeol-TV (어쩔티비)" is:',
    options: [
      { id: 'A', text: '"Jeo-jjeol-refrigerator (저쩔냉장고)"', scores: { Y: 1 } },
      { id: 'B', text: '"So what do you want me to do"', scores: { Y: 0 } },
      { id: 'C', text: '"Turn off the TV"', scores: { Y: 0 } },
      { id: 'D', text: 'Apologize politely', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-08',
    order_index: 8,
    locale: 'en',
    question_text: '"God-saeng (갓생)" means living:',
    options: [
      { id: 'A', text: 'A religious life', scores: { Y: 0 } },
      { id: 'B', text: 'A freshly restarted life', scores: { Y: 0 } },
      { id: 'C', text: 'A diligent, productive, exemplary life', scores: { Y: 1 } },
      { id: 'D', text: 'A traditional life wearing a gat (hat)', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-09',
    order_index: 9,
    locale: 'en',
    question_text: '"Gun-ssak (군싹)" is short for:',
    options: [
      { id: 'A', text: 'Army potential', scores: { Y: 0 } },
      { id: 'B', text: '"My mouth is watering"', scores: { Y: 1 } },
      { id: 'C', text: 'Sweeping up all the snacks', scores: { Y: 0 } },
      { id: 'D', text: 'Being obedient without complaint', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-10',
    order_index: 10,
    locale: 'en',
    question_text: '"Jeom-me-chu (점메추)" is asking for:',
    options: [
      { id: 'A', text: 'A lunch menu recommendation', scores: { Y: 1 } },
      { id: 'B', text: 'An extra lunch order', scores: { Y: 0 } },
      { id: 'C', text: 'A fortune-teller raffle', scores: { Y: 0 } },
      { id: 'D', text: 'Grading and overtaking', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-11',
    order_index: 11,
    locale: 'en',
    question_text: '"Man-ban-jal-bu (만반잘부)" means:',
    options: [
      { id: 'A', text: 'Frying dumpling batter well', scores: { Y: 0 } },
      { id: 'B', text: '"Nice to meet you, please take care of me"', scores: { Y: 1 } },
      { id: 'C', text: 'Enduring all opposition', scores: { Y: 0 } },
      { id: 'D', text: 'Get a perfect score and pass', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-12',
    order_index: 12,
    locale: 'en',
    question_text: '"Dang-mo-chi (당모치)" declares:',
    options: [
      { id: 'A', text: 'Assemble at the chicken place now', scores: { Y: 0 } },
      { id: 'B', text: 'Obviously, all chicken is righteous', scores: { Y: 1 } },
      { id: 'C', text: 'Clean up the embarrassment', scores: { Y: 0 } },
      { id: 'D', text: 'Take a mock exam today', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-13',
    order_index: 13,
    locale: 'en',
    question_text: '"Kku-an-kku (꾸안꾸)" is a style that looks:',
    options: [
      { id: 'A', text: 'Consistently unstyled', scores: { Y: 0 } },
      { id: 'B', text: 'Effortlessly styled — dressed up yet not', scores: { Y: 1 } },
      { id: 'C', text: 'Forcefully hugged', scores: { Y: 0 } },
      { id: 'D', text: 'Like a dreamer who won\'t wake up', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'You\'d say "pom michyeotda (폼 미쳤다)" when:',
    options: [
      { id: 'A', text: 'Correcting someone\'s bad posture', scores: { Y: 0 } },
      { id: 'B', text: 'Admiring peak form/performance', scores: { Y: 1 } },
      { id: 'C', text: 'Seeing extra-foamy coffee', scores: { Y: 0 } },
      { id: 'D', text: 'A document template looks broken', scores: { Y: 0 } },
    ],
  },
  {
    id: 'sl-en-15',
    order_index: 15,
    locale: 'en',
    question_text: '"Jung-kkeok-ma (중꺾마)" stands for:',
    options: [
      { id: 'A', text: 'A heart broken halfway', scores: { Y: 0 } },
      { id: 'B', text: '"What matters is an unbreakable heart"', scores: { Y: 1 } },
      { id: 'C', text: 'Turn at the Chinese place for malatang', scores: { Y: 0 } },
      { id: 'D', text: 'Used bracket clearance sale', scores: { Y: 0 } },
    ],
  },
];
