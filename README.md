# IQ Test MVP

인스타 광고 유입 → 무료 IQ 테스트 → 9,900원 상세 리포트(PDF 이메일) 자동화 서비스.
PRD: [docs/PRD.md](docs/PRD.md) · 컨벤션: [CLAUDE.md](CLAUDE.md)

## 운영 시작까지 가장 빠른 경로 (사용자 직접)

코드는 완성됐고 외부 서비스 연결만 남았습니다. 우선순위 순서:

1. **GitHub repo 생성 + push** — 이미 로컬 git에 첫 commit이 있습니다. 새 repo 만든 후:
   ```bash
   git remote add origin git@github.com:YOU/iq-test-mvp.git
   git push -u origin main
   ```
   → 푸시 즉시 GitHub Actions CI(lint+typecheck+build+e2e)가 자동 실행됩니다.

2. **Vercel 연결** — Vercel 대시보드에서 "Import Git Repository". `vercel.json`이 알아서 region을 `icn1`(서울)로 설정합니다. 가입 시 `NEXT_PUBLIC_APP_URL` 만 등록하면 dev-mode 그대로 운영됩니다.

3. **Supabase 가입** → SQL Editor에서 `supabase/migrations/` 4개 차례로 실행 → 3개 키 Vercel에 등록 → `npm run seed`로 문항 시딩.

4. **Lemon Squeezy 가입** → 상품(Detailed IQ Report, 9,900원) 등록 → API key/Store ID/Variant ID/Webhook Secret 4개 Vercel에 등록 → Webhook URL `https://YOUR_DOMAIN/api/webhooks/lemon-squeezy`.

5. **Resend 가입** → 발신 도메인 인증 → API Key + `RESEND_FROM_EMAIL` Vercel에 등록.

6. **Meta Pixel + Conversion API** (선택, 광고 시작 시) → Pixel ID + access token 등록.

7. **콘텐츠 교체** — [lib/questions/dummy-ko.ts](lib/questions/dummy-ko.ts) / [dummy-en.ts](lib/questions/dummy-en.ts)의 더미를 실제 IQ 문항으로 교체. 가이드: [docs/questions.md](docs/questions.md).

8. **Sentry 가입** (선택) → DSN을 `NEXT_PUBLIC_SENTRY_DSN`에 등록.

9. **Kakao Developers** (선택, 한국 사용자 공유) → App Key를 `NEXT_PUBLIC_KAKAO_APP_KEY`에 등록.

자세한 외부 가입 단계는 아래 "프로덕션 모드로 가는 단계" 참고.



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
- 카카오톡 공유 SDK는 코드는 통합되어 있으나 `NEXT_PUBLIC_KAKAO_APP_KEY` 미입력 시 비활성 — 사용자가 Kakao Developers에서 키 발급 후 등록 필요.
- 결제 PG는 Lemon Squeezy 한 곳만 — 한국 사용자에게 토스페이먼츠/카카오페이 직결을 원한다면 별도 PG 연결 필요(별도 작업).

## 누적 구현 현황 (참고)

| 영역 | 상태 |
|------|------|
| 라우트 | 23개 (페이지 11 + API 6 + SEO 메타 6) |
| 더미 문항 | 한/영 각 30문항, 공간 6개 SVG |
| 빌드 | next build 통과, First Load JS 87KB shared |
| 타입 | tsc --noEmit 0 에러 |
| Lint | 0 경고 |
| E2E | Playwright 8개 시나리오 (smoke 3 + hardening 5) 통과 |
| 보안 헤더 | CSP, X-Frame-Options DENY 외 4개 |
| Rate limit | IP당 10회/시간, SHA-256 해시 |
| Sentry | client/server/edge 3개 config + 모든 critical API wrapping |
| Vercel | Analytics + Speed Insights + 프리뷰 배포 워크플로 |
| CI | lint/typecheck/build + Playwright 풀 실행, 시크릿 0개 필요 |
| Dependabot | npm + GH Actions 주 1회 |
