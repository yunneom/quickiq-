import type { PersonalityQuestion } from '../types';

/**
 * 15 questions × 2 locales for the "너 T야?" (Are you a T?) empathy-style
 * test. Each option grants +2 (strong) or +1 (mild) to the T (thinking/
 * fact-first) or F (feeling/empathy-first) axis. The T−F margin maps to
 * one of 4 meme-grade profiles (facts-t / soft-t / warm-f / tearful-f).
 *
 * Content is entertainment-grade pop psychology — clearly labeled
 * "재미용 · 과학적 검사 아님" on the result page. No clinical claims.
 */

export const tfQuestionsKo: PersonalityQuestion[] = [
  {
    id: 'tf-ko-01',
    order_index: 1,
    locale: 'ko',
    question_text: '친구: "나 오늘 회사에서 혼났어…" 당신의 첫 마디는?',
    options: [
      { id: 'A', text: '"왜 혼났는데? 뭘 잘못했어?"', scores: { T: 2 } },
      { id: 'B', text: '"팀장이 뭐라고 했는데? 상황 설명해봐"', scores: { T: 1 } },
      { id: 'C', text: '"헐 괜찮아? 기분 완전 상했겠다"', scores: { F: 1 } },
      { id: 'D', text: '"속상했겠다… 맛있는 거 먹으러 갈래? 내가 쏠게"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-02',
    order_index: 2,
    locale: 'ko',
    question_text: '연인이 "나 살찐 것 같아"라고 하면?',
    options: [
      { id: 'A', text: '"응, 요즘 야식을 많이 먹긴 했지"', scores: { T: 2 } },
      { id: 'B', text: '"체중계로 확인해보면 되잖아"', scores: { T: 1 } },
      { id: 'C', text: '"아니야 그대로인데? 왜 그렇게 느꼈어?"', scores: { F: 1 } },
      { id: 'D', text: '"무슨 소리야, 지금이 제일 보기 좋아"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-03',
    order_index: 3,
    locale: 'ko',
    question_text: '친구가 새벽에 이별했다고 연락이 왔다:',
    options: [
      { id: 'A', text: '"그 사람이랑은 어차피 안 맞았어. 잘된 거야"', scores: { T: 2 } },
      { id: 'B', text: '"헤어진 이유가 뭔데?" 원인 분석 시작', scores: { T: 1 } },
      { id: 'C', text: '"많이 힘들지… 얘기하고 싶으면 언제든 전화해"', scores: { F: 1 } },
      { id: 'D', text: '바로 달려간다. 같이 울어줄 준비 완료', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-04',
    order_index: 4,
    locale: 'ko',
    question_text: '영화의 슬픈 장면에서 당신은?',
    options: [
      { id: 'A', text: '"저건 설정이 좀 억지다" 분석 중', scores: { T: 2 } },
      { id: 'B', text: '슬프긴 한데 눈물은 안 난다', scores: { T: 1 } },
      { id: 'C', text: '코끝이 찡… 애써 참는 중', scores: { F: 1 } },
      { id: 'D', text: '이미 티슈 세 장째', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-05',
    order_index: 5,
    locale: 'ko',
    question_text: '"나 머리 잘랐어! 어때?" (사실 좀 별로다)',
    options: [
      { id: 'A', text: '"솔직히 전 머리가 나았어"', scores: { T: 2 } },
      { id: 'B', text: '"음… 좀 짧지 않아? 그래도 금방 자라"', scores: { T: 1 } },
      { id: 'C', text: '"오 새롭다! 분위기 달라졌는데?"', scores: { F: 1 } },
      { id: 'D', text: '"완전 잘 어울려! 어디서 잘랐어?"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-06',
    order_index: 6,
    locale: 'ko',
    question_text: '팀 프로젝트에서 팀원이 실수했을 때:',
    options: [
      { id: 'A', text: '"이 부분 틀렸어요. 이렇게 수정해주세요"', scores: { T: 2 } },
      { id: 'B', text: '실수 원인을 짚고 재발 방지책부터 논의', scores: { T: 1 } },
      { id: 'C', text: '"괜찮아요, 저도 자주 그래요. 같이 고쳐요"', scores: { F: 1 } },
      { id: 'D', text: '몰래 내가 고쳐놓고 아무 말 안 한다', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-07',
    order_index: 7,
    locale: 'ko',
    question_text: '내가 위로받고 싶을 때 나는:',
    options: [
      { id: 'A', text: '위로보다 해결책이 필요하다', scores: { T: 2 } },
      { id: 'B', text: '일단 혼자 정리한 다음에 이야기한다', scores: { T: 1 } },
      { id: 'C', text: '그냥 조용히 들어주는 사람이 좋다', scores: { F: 1 } },
      { id: 'D', text: '"고생했어" 한마디에 눈물이 난다', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-08',
    order_index: 8,
    locale: 'ko',
    question_text: '친구가 산 옷, 다른 곳에서 반값이던 걸 알았다:',
    options: [
      { id: 'A', text: '"그거 저기서 반값이던데" 바로 팩트 전달', scores: { T: 2 } },
      { id: 'B', text: '다음에 살 때 참고하라고 살짝 알려줌', scores: { T: 1 } },
      { id: 'C', text: '이미 산 거니까 굳이 말하지 않는다', scores: { F: 1 } },
      { id: 'D', text: '"진짜 잘 샀다! 너한테 딱이야"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-09',
    order_index: 9,
    locale: 'ko',
    question_text: '단톡방에서 친구가 고민 상담을 시작하면:',
    options: [
      { id: 'A', text: '요점 정리 후 선택지 A/B 제시', scores: { T: 2 } },
      { id: 'B', text: '질문을 던지며 상황 파악부터', scores: { T: 1 } },
      { id: 'C', text: '이모티콘 연타 + "헐 힘들었겠다"', scores: { F: 1 } },
      { id: 'D', text: '개인톡으로 옮겨 1:1 심층 상담 개시', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-10',
    order_index: 10,
    locale: 'ko',
    question_text: '"만약 내가 갑자기 사라지면 어떡할 거야?"라는 질문에:',
    options: [
      { id: 'A', text: '"왜 그런 비생산적인 상상을 해?"', scores: { T: 2 } },
      { id: 'B', text: '"확률적으로 그럴 일은 거의 없어"', scores: { T: 1 } },
      { id: 'C', text: '"그런 말 하지 마…"', scores: { F: 1 } },
      { id: 'D', text: '상상만 했는데 벌써 눈물이 고인다', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-11',
    order_index: 11,
    locale: 'ko',
    question_text: '길에서 혼자 울고 있는 사람을 봤다:',
    options: [
      { id: 'A', text: '무슨 사정이 있겠지, 그냥 지나간다', scores: { T: 2 } },
      { id: 'B', text: '도움이 필요한 상황인지 잠깐 살핀다', scores: { T: 1 } },
      { id: 'C', text: '신경 쓰여서 자꾸 뒤돌아본다', scores: { F: 1 } },
      { id: 'D', text: '휴지를 건네며 "괜찮으세요?"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-12',
    order_index: 12,
    locale: 'ko',
    question_text: '내가 하는 위로의 90%는:',
    options: [
      { id: 'A', text: '"그래서 앞으로 어떻게 할 건데?"', scores: { T: 2 } },
      { id: 'B', text: '"그건 네 잘못이 아니라 상황 문제야"', scores: { T: 1 } },
      { id: 'C', text: '"지금 그런 기분 드는 거 당연해"', scores: { F: 1 } },
      { id: 'D', text: '"내가 무조건 네 편이야"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-13',
    order_index: 13,
    locale: 'ko',
    question_text: '생일 선물을 고를 때 나는:',
    options: [
      { id: 'A', text: '필요하다고 말했던 실용템 구매', scores: { T: 2 } },
      { id: 'B', text: '위시리스트 링크 그대로 구매', scores: { T: 1 } },
      { id: 'C', text: '취향 저격 아이템 + 손편지', scores: { F: 1 } },
      { id: 'D', text: '몇 주 전부터 서프라이즈 기획', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-14',
    order_index: 14,
    locale: 'ko',
    question_text: '드라마 주인공이 답답한 선택을 하면:',
    options: [
      { id: 'A', text: '"아니 저기서 왜 저래?" 소리부터 나옴', scores: { T: 2 } },
      { id: 'B', text: '개연성 없다며 채널 돌림', scores: { T: 1 } },
      { id: 'C', text: '안타깝지만 그럴 수도 있다고 생각', scores: { F: 1 } },
      { id: 'D', text: '주인공 마음이 이해돼서 같이 괴로움', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-ko-15',
    order_index: 15,
    locale: 'ko',
    question_text: '"너 T야?"라는 말을 들으면:',
    options: [
      { id: 'A', text: '"응. 그게 뭐 어때서?"', scores: { T: 2 } },
      { id: 'B', text: '"MBTI로 사람 판단하지 마"', scores: { T: 1 } },
      { id: 'C', text: '"아냐! 나 공감 잘하거든?"', scores: { F: 1 } },
      { id: 'D', text: '그 말에 상처받아 밤에 다시 생각남', scores: { F: 2 } },
    ],
  },
];

export const tfQuestionsEn: PersonalityQuestion[] = [
  {
    id: 'tf-en-01',
    order_index: 1,
    locale: 'en',
    question_text: 'A friend texts: "I got chewed out at work today…" Your first reply?',
    options: [
      { id: 'A', text: '"Why? What did you do wrong?"', scores: { T: 2 } },
      { id: 'B', text: '"What exactly did your manager say? Walk me through it"', scores: { T: 1 } },
      { id: 'C', text: '"Oh no, are you okay? That must have stung"', scores: { F: 1 } },
      { id: 'D', text: '"You must feel awful… dinner on me tonight?"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-02',
    order_index: 2,
    locale: 'en',
    question_text: 'Your partner says "I think I gained weight."',
    options: [
      { id: 'A', text: '"Well, you have been snacking a lot lately"', scores: { T: 2 } },
      { id: 'B', text: '"Just check the scale and you\'ll know"', scores: { T: 1 } },
      { id: 'C', text: '"Really? You look the same to me. What made you feel that?"', scores: { F: 1 } },
      { id: 'D', text: '"What are you talking about — you look amazing"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-03',
    order_index: 3,
    locale: 'en',
    question_text: 'A friend calls at 2am — they just got dumped:',
    options: [
      { id: 'A', text: '"Honestly? You two never matched. It\'s for the best"', scores: { T: 2 } },
      { id: 'B', text: '"So what was the reason?" — analysis mode on', scores: { T: 1 } },
      { id: 'C', text: '"That\'s so hard… call me anytime you want to talk"', scores: { F: 1 } },
      { id: 'D', text: 'Already in a taxi, ready to cry together', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-04',
    order_index: 4,
    locale: 'en',
    question_text: 'During the sad scene of a movie, you are:',
    options: [
      { id: 'A', text: 'Analyzing: "this plot point is forced"', scores: { T: 2 } },
      { id: 'B', text: 'Sad, sure — but no tears', scores: { T: 1 } },
      { id: 'C', text: 'Nose tingling… fighting it', scores: { F: 1 } },
      { id: 'D', text: 'Third tissue already', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-05',
    order_index: 5,
    locale: 'en',
    question_text: '"I got a haircut! How do I look?" (honestly, not great)',
    options: [
      { id: 'A', text: '"Honestly, the old cut suited you better"', scores: { T: 2 } },
      { id: 'B', text: '"Hmm… bit short? It\'ll grow back fast though"', scores: { T: 1 } },
      { id: 'C', text: '"Ooh, fresh! Whole new vibe"', scores: { F: 1 } },
      { id: 'D', text: '"It totally suits you! Which salon?"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-06',
    order_index: 6,
    locale: 'en',
    question_text: 'A teammate makes a mistake on a group project:',
    options: [
      { id: 'A', text: '"This part is wrong. Please fix it like this"', scores: { T: 2 } },
      { id: 'B', text: 'Diagnose the root cause, discuss prevention', scores: { T: 1 } },
      { id: 'C', text: '"No worries, I do that all the time. Let\'s fix it together"', scores: { F: 1 } },
      { id: 'D', text: 'Quietly fix it yourself and never mention it', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-07',
    order_index: 7,
    locale: 'en',
    question_text: 'When I need comforting, I want:',
    options: [
      { id: 'A', text: 'Solutions, not sympathy', scores: { T: 2 } },
      { id: 'B', text: 'To process alone first, then talk', scores: { T: 1 } },
      { id: 'C', text: 'Someone who just listens quietly', scores: { F: 1 } },
      { id: 'D', text: 'One "you\'ve been through a lot" and I\'m crying', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-08',
    order_index: 8,
    locale: 'en',
    question_text: 'You find out your friend\'s new jacket is half price elsewhere:',
    options: [
      { id: 'A', text: '"That\'s half price over there" — instant facts', scores: { T: 2 } },
      { id: 'B', text: 'Mention it gently for next time', scores: { T: 1 } },
      { id: 'C', text: 'They already bought it — say nothing', scores: { F: 1 } },
      { id: 'D', text: '"Great buy! It\'s so you"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-09',
    order_index: 9,
    locale: 'en',
    question_text: 'A friend starts venting in the group chat:',
    options: [
      { id: 'A', text: 'Summarize the issue, present options A and B', scores: { T: 2 } },
      { id: 'B', text: 'Ask questions to map the situation first', scores: { T: 1 } },
      { id: 'C', text: 'Emoji barrage + "omg that\'s awful"', scores: { F: 1 } },
      { id: 'D', text: 'Move to DMs for a 1:1 deep-dive session', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-10',
    order_index: 10,
    locale: 'en',
    question_text: '"What would you do if I suddenly disappeared?"',
    options: [
      { id: 'A', text: '"Why imagine something so unproductive?"', scores: { T: 2 } },
      { id: 'B', text: '"Statistically, that\'s extremely unlikely"', scores: { T: 1 } },
      { id: 'C', text: '"Don\'t say things like that…"', scores: { F: 1 } },
      { id: 'D', text: 'Tearing up at the mere thought', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-11',
    order_index: 11,
    locale: 'en',
    question_text: 'You see a stranger crying alone on the street:',
    options: [
      { id: 'A', text: 'They have their reasons — keep walking', scores: { T: 2 } },
      { id: 'B', text: 'Briefly check if they need actual help', scores: { T: 1 } },
      { id: 'C', text: 'Keep glancing back, can\'t stop thinking about it', scores: { F: 1 } },
      { id: 'D', text: 'Offer a tissue: "are you okay?"', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-12',
    order_index: 12,
    locale: 'en',
    question_text: '90% of my comforting sounds like:',
    options: [
      { id: 'A', text: '"So what\'s your plan going forward?"', scores: { T: 2 } },
      { id: 'B', text: '"That\'s not your fault — it\'s the situation"', scores: { T: 1 } },
      { id: 'C', text: '"It makes total sense you feel that way"', scores: { F: 1 } },
      { id: 'D', text: '"I\'m on your side. Unconditionally."', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-13',
    order_index: 13,
    locale: 'en',
    question_text: 'Picking a birthday gift, I go for:',
    options: [
      { id: 'A', text: 'The practical thing they said they needed', scores: { T: 2 } },
      { id: 'B', text: 'Exactly what\'s on their wishlist link', scores: { T: 1 } },
      { id: 'C', text: 'Something personal + a handwritten note', scores: { F: 1 } },
      { id: 'D', text: 'A surprise planned weeks in advance', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-14',
    order_index: 14,
    locale: 'en',
    question_text: 'When a drama protagonist makes a frustrating choice:',
    options: [
      { id: 'A', text: '"WHY would you do that?!" — yelling at the screen', scores: { T: 2 } },
      { id: 'B', text: 'Change the channel over the plot hole', scores: { T: 1 } },
      { id: 'C', text: 'Frustrating, but people do that sometimes', scores: { F: 1 } },
      { id: 'D', text: 'Understand them so deeply it hurts', scores: { F: 2 } },
    ],
  },
  {
    id: 'tf-en-15',
    order_index: 15,
    locale: 'en',
    question_text: 'When someone says "you\'re such a T":',
    options: [
      { id: 'A', text: '"Yes. And? What\'s wrong with that?"', scores: { T: 2 } },
      { id: 'B', text: '"Stop judging people by MBTI"', scores: { T: 1 } },
      { id: 'C', text: '"No! I\'m actually really empathetic!"', scores: { F: 1 } },
      { id: 'D', text: 'Hurt by it, thinking about it again at midnight', scores: { F: 2 } },
    ],
  },
];
