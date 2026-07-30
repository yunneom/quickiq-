# @quickiq 인스타그램 프로필 세팅 가이드

글로벌(영어) 계정용. 프로필은 모든 게시글 캡션의 "link in bio" CTA가
착지하는 곳이므로, 아래 그대로 복사해 넣으면 됩니다.

## 이름 (Name 필드 — 검색에 걸리는 부분)

```
QuickIQ | IQ Test & Brain Teasers
```

Name 필드는 IG 검색 인덱스에 포함되므로 "IQ Test" 키워드를 반드시 포함.

## 소개 (Bio — 150자 제한)

```
🧠 Daily brain teasers that 99% fail
🎯 Can you score above 130?
⏱️ Free 30-question test · no sign-up · 7 min
👇 Take the test
```

## 링크 (Website 필드)

```
https://iq.dailyenterkr.com/en?utm_source=instagram&utm_medium=bio&utm_campaign=quickiq_ig
```

- UTM이 붙어 있어 funnel_events에서 IG 유입이 그대로 측정됩니다
  (utm_source=instagram으로 필터).
- `/en` 명시: IG 앱 내 브라우저는 Accept-Language가 기기 언어라서
  글로벌 팔로워는 어차피 /en에 떨어지지만, 링크에 박아두면 확실합니다.

## 카테고리 / 전환 버튼

- 카테고리: **Education** (또는 Entertainment)
- 프로페셔널 대시보드 → 카테고리 표시 ON

## 운영 루틴 (자동화가 하는 일 / 사람이 할 일)

자동 (이미 배포됨):
- **하루 3개 릴스** 자동 발행 — 09:00 KST 크론이 2개, 21:00 KST 크론이
  남은 1개(+실패분 재시도). Vercel Hobby가 크론을 하루 2회로 제한하므로
  한 번 실행에 최대 2개씩, 시간 예산 내에서만 발행하고 나머지는 다음
  실행이 이어받음
- 릴스 구성(30초): 문제 20초(상단 타이머 바가 실시간으로 줄어듦) →
  광고 6초(QUICK AD BREAK) → GOT IT? + LINK IN BIO 4초
- 문제마다 **그림 자동 생성**: 찻길+차량(속도/거리), 비교 막대(작업률·
  퍼센트), 숫자 타일(수열). 문제의 숫자에서 그려지므로 새 문제를
  추가하면 그림도 자동
- 영상 파이프라인이 실패하면 정사각 이미지 포스트로 자동 폴백 —
  일일 발행은 절대 죽지 않음
- 하루 구성: [베이트, 베이트, 실제 문항] — 베이트 풀 55개(속도·작업률·
  퍼센트·수열·트릭·스펠링)를 겹치지 않게 순회
- 모든 캡션에 IQ 테스트 홍보 블록 + 해시태그 자동 포함
- 정답은 카드/캡션에 절대 노출 안 됨 (코드에는 정답+해설이 저장돼 있어
  다음날 공개 댓글에 사용 가능)

수동 (하루 5분, 효과 큼):
1. **답 고정 댓글 금지** — 정답을 절대 댓글로 달지 말 것. 댓글창이
   토론장이 되는 게 알고리즘 연료입니다.
2. 발행 30분~1시간 후 댓글에 **"Answer in 24h 😏 — or find out now
   (link in bio)"** 하나만 남기고 고정(pin).
3. 다음날 전날 게시글에 정답 + 한 줄 해설 댓글 추가.
4. 좋아요/댓글에 하트 몇 개 (초기 계정 신뢰 신호).

## 스토리 하이라이트 (여유 있을 때)

- `START HERE` — 테스트 링크 스티커 붙인 스토리 1장 고정
- `ANSWERS` — 전날 정답 공개 스토리 아카이브

## 고정(Pin) 게시글 전략

베이트 게시글 중 댓글 반응이 가장 좋은 것 1~2개를 프로필 상단에
고정 — 신규 방문자가 바로 참여하게 만드는 훅 역할.


## 실사 사진 배경 넣기 (릴스 노출 개선)

코드로 그린 배경은 안전하지만 밋밋해서 스크롤을 못 멈춥니다. 씬별로
**실제 사진 1장**을 넣으면 켄번즈(천천히 밀고 들어가는 카메라 무브)가
붙어서 진짜 영상처럼 보입니다 — 기차 사진을 넣으면 20초 동안 기차가
실제로 다가옵니다.

### 넣는 방법

Vercel 배포본은 인터넷이 열려 있으므로, 사진 URL만 주면 서버가 직접
받아서 저장합니다. PowerShell에서:

```powershell
$h = @{ "x-admin-token" = "여기에_ADMIN_TOKEN"; "Content-Type" = "application/json" }
$body = '{"scene":"rails","url":"https://.../train-night.jpg","credit":"Photographer / Pexels","license":"Pexels License"}'
Invoke-RestMethod -Method Post -Headers $h -Body $body "https://iq.dailyenterkr.com/api/admin/footage"
```

씬 이름은 넷 중 하나: `rails`(기차·다리 문제) · `road`(차량 속도 문제) ·
`chalk`(수학·작업률·수열) · `slate`(스펠링).

현재 상태 확인:
```powershell
Invoke-RestMethod -Headers @{ "x-admin-token" = "여기에_ADMIN_TOKEN" } "https://iq.dailyenterkr.com/api/admin/footage"
```

사진이 없는 씬은 기존 코드 배경으로 자동 폴백되므로, 하나씩 채워도
발행은 계속됩니다.

### 사진 고를 때

- **세로 사진**(9:16에 가까울수록 좋음). 가로 사진은 가운데를 잘라 씁니다.
- **어두운 사진**이 좋습니다. 위에 어두운 스크림이 깔리지만, 원본이 밝으면
  질문 패널과 대비가 약해집니다.
- **화면 중앙이 비어 있는 구도** — 질문 패널이 가운데를 덮습니다.
- 상업적 이용이 허용된 라이선스만. 뉴스·다큐 영상 캡처는 **금지**
  (저작권 클레임 → 계정 정지 위험).


## 사운드트랙 넣기 (무음 페널티 해제)

무음 릴스는 구조적으로 도달이 깎입니다. API 발행은 인스타 음악
라이브러리를 못 쓰므로, **MP4 안에 오디오를 굽는 것**이 유일한 자동화
경로입니다.

### ⚠ 유명곡은 절대 금지

API로 올리는 영상에 유명곡을 넣으면 Rights Manager 매칭 →
음소거/삭제/계정 제재입니다. 인스타 라이선스 음악은 **앱에서 수동
게시할 때만** 적용됩니다. 유명곡 트렌드를 타고 싶으면 그 게시물만
수동으로 올리세요.

### 수노(Suno) 워크플로 — 권장

1. 수노 **유료 플랜**(Pro/Premier)으로 곡 생성 — 유료 플랜이어야 생성곡
   상업 이용권이 나옵니다. 무료 플랜 곡은 상업 사용 불가.
2. 프롬프트 예시: "upbeat quirky quiz show background music, playful
   pizzicato and light percussion, no vocals, loopable" — 보컬 없는
   BGM이 문제 텍스트와 안 싸웁니다. 3~5곡 뽑으세요.
3. 곡의 **공유 링크**(suno.com/s/...)를 그대로 복사 — 서버가 MP3를
   알아서 찾습니다. (cdn*.suno.ai 직링크도 그대로 동작)
4. 업로드:
```powershell
$h = @{ "x-admin-token" = "ADMIN_TOKEN"; "Content-Type" = "application/json" }
$body = '{"url":"https://suno.com/s/공유코드","id":"suno-quiz-1","title":"Quiz Bounce"}'
Invoke-RestMethod -Method Post -Headers $h -Body $body "https://iq.dailyenterkr.com/api/admin/audio"
```
   `id`는 생략하면 곡에서 자동 생성됩니다.
5. 라이브러리 확인: 같은 주소로 GET. 곡이 1개라도 있으면 다음 빌드부터
   모든 릴스에 음악이 들어가고, 여러 곡이면 (날짜×슬롯)마다 자동 로테이션.

### 유튜브 계정 아이디어에 대해

릴스에 쓰기 위해 유튜브에 올릴 필요는 없습니다(우리 스토리지에서 바로
뮤싱). 다만 별도로 유튜브 채널에 곡을 올려두면 ① 곡의 출처 증빙이 남고
② 나중에 YouTube Shorts 크로스포스팅 채널의 기반이 됩니다 — 원하면
채널만 만들어두세요. 코드 작업은 필요 없습니다.
