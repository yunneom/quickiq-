# IQ Test MVP

인스타 광고 유입 → 무료 IQ 테스트 → 9,900원 상세 리포트(PDF 이메일) 자동화 서비스.
PRD: [docs/PRD.md](docs/PRD.md) · 컨벤션: [CLAUDE.md](CLAUDE.md)

## 빠른 시작 (외부 키 없이)

```bash
npm install
npm run dev
# → http://localhost:3000  (자동으로 /ko 로 리다이렉트)
```

외부 서비스(Supabase / Lemon Squeezy / Resend / Meta) 키가 없어도 끝까지 동작합니다:

- **세션 저장**: 프로세스 메모리에 저장 (서버 재시작 시 사라짐)
- **결제**: `/api/checkout/mock` 으로 우회 — 즉시 "결제 완료" 처리
- **이메일**: 콘솔에 발송 로그 출력 (PDF 바이트 수 표시)
- **Meta Pixel/CAPI**: 발사하지 않음

전체 흐름을 한 번에 보려면: 랜딩 → "지금 무료로 테스트" → 30문항(또는 1문항씩 자동/수동 응답) → 결과 페이지 → "9,900원으로 상세 리포트 받기" → 결제하기(mock) → 감사 페이지.

## 프로덕션 모드로 가는 단계

`.env.local` 을 만들고 `.env.example` 의 값을 채워주세요. 키가 들어오는 즉시 자동으로 모드가 전환됩니다.

1. **Supabase**
   - 새 프로젝트 생성 → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `supabase/migrations/` 안의 SQL 4개를 SQL Editor에 차례로 실행
   - `npm run seed` 로 문항 60개(한/영) 시딩
2. **Lemon Squeezy**
   - Store + Variant 생성, API Key + Webhook Secret 발급
   - Webhook URL: `https://YOUR_DOMAIN/api/webhooks/lemon-squeezy`
   - 이벤트: `order_created` 만 구독해도 OK
3. **Resend**
   - API Key 발급, 발신 도메인 인증
   - `RESEND_FROM_EMAIL` 에 인증된 발신 주소 입력
4. **Meta Pixel + Conversion API**
   - Pixel ID, CAPI access token 발급 → `.env.local`

## 폴더 구조 (요약)

```
app/[locale]/        랜딩 / 테스트 / 결과 / 결제 / 감사 / 약관
app/api/             test/start, test/submit, test/result,
                     checkout, checkout/mock, webhooks/lemon-squeezy
components/          ui, test, analytics
lib/
  questions/         더미 문항 (ko/en) + 타입
  scoring/           원점수 → 추정 IQ → 상위 백분위
  supabase/          server/client 클라이언트
  payments/          Lemon Squeezy 래퍼
  pdf/               React PDF 리포트 템플릿
  email/             Resend 발송 + 로그
  analytics/         CAPI 서버 전송
messages/            ko.json, en.json
supabase/migrations/ 0001~0004 SQL
docs/                PRD.md, db-schema.md, questions.md, claude-code-prompts.md
```

## 점수 계산

`lib/scoring/index.ts` 참고. 핵심 가정:

- 평균 100, 표준편차 15
- 9 raw 정답 ≈ 1 SD (PRD §2.3 예시: 24/30 → IQ 115)
- IQ → 상위 백분위는 표준정규 분포의 1−CDF
- 결과는 70~145 로 캡

## 광고 운영 체크리스트

- Meta Pixel ID `.env.local` 에 입력했는가?
- Conversion API access token 있는가?
- Lemon Squeezy 상품 가격이 한국에서 9,900원으로 보이는가?
- Resend 발신 도메인이 인증되었는가?
- `vercel.json` (선택) — 환경변수 별도 등록
- `robots.txt` / `sitemap.xml` ✅ — `/robots.txt`, `/sitemap.xml` 자동 생성됨
- OG 이미지 ✅ — `/opengraph-image` 동적 생성 (1200×630 PNG)

## 운영 인프라

### CI (GitHub Actions)
`.github/workflows/ci.yml` — PR/main push 시 두 단계 실행:
1. **verify** — lint + typecheck + build
2. **e2e** — Playwright 스모크 (랜딩→30문항→결과, scoring math, 결제 잠금해제)

외부 시크릿 없이 실행 가능 (PRD §3.1 dev-mode 가드 덕분). 실패 시 Playwright 리포트가 artifact로 업로드됩니다.

### E2E 테스트 (Playwright)
```bash
npm run test:e2e:install   # 최초 1회 — Chromium 다운로드
npm run test:e2e           # 테스트 실행
```

`tests/e2e/smoke.spec.ts` 안의 3개 시나리오:
- 랜딩 → 30문항(모두 A 선택) → 결과 페이지
- API: PRD §2.3 점수 공식 검증 (30/30 → IQ 125, top <10%)
- mock 결제 → 결과 페이지 잠금해제

iPhone 13 viewport(390×844) 기준, Chromium 단일 브라우저.

### Vercel 프리뷰 배포
`.github/workflows/preview-deploy.yml` — PR마다 Vercel 프리뷰 URL 생성. 다음 시크릿 등록 시에만 동작 (없으면 자동 스킵):
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

```bash
# Vercel ORG / PROJECT ID 얻는 법
npx vercel link
cat .vercel/project.json
```

### Sentry
- `NEXT_PUBLIC_SENTRY_DSN` (필수) — 클라이언트/서버 에러 캡처 활성화
- `SENTRY_ORG` + `SENTRY_PROJECT` + `SENTRY_AUTH_TOKEN` (선택) — CI 빌드 시 소스맵 업로드용
- `NODE_ENV === 'production'` 일 때만 활성 (로컬 개발에선 노이즈 0)
- 캡처되는 경로: Lemon Squeezy webhook (Supabase 쓰기 실패), PDF 렌더 실패, Resend 발송 실패

### Vercel Analytics + Speed Insights
- `@vercel/analytics`, `@vercel/speed-insights` 가 layout에 자동 마운트됨
- Vercel에 배포된 환경에서만 데이터 수집 (로컬 dev에선 비활성)

## 알려진 한계

- 공간 추론 문항 6개는 SVG 도형으로 구현 완료. 나머지 1개(주사위 합)는 텍스트 추론으로 유지.
- 더미 문항은 콘텐츠 빠른 검증용 — `docs/questions.md` 가이드대로 실제 문항을 작성해 교체하세요. 특히 verbal 5번 "고양이:동물 = 장미:?" 같은 모호한 답안은 운영 전 카피라이팅 필요.
- 카카오톡 공유 SDK 미연동 — 운영 시 Kakao Developers 키 받아 추가 필요.
