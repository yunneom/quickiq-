# IQ Test MVP

인스타 광고 유입 → 무료 IQ 테스트 → 9,900원 상세 리포트(PDF 이메일) 자동화 서비스.
PRD: [docs/PRD.md](docs/PRD.md) · 컨벤션: [CLAUDE.md](CLAUDE.md)

## 도메인 전략 (무료/자동화/빠르게)

운영 비용 0원 컨셉을 유지하려면 **Vercel 기본 도메인 `xxx.vercel.app`** 을 그대로 쓰는 것이 정답입니다. 자동 SSL · 자동 배포 · 무제한 대역폭(취미 한도) · 글로벌 CDN 모두 무료.

신규 등록을 막고 있는 Freenom(.tk/.ml/.ga) 같은 사이트들은 더 이상 작동하지 않고, 진짜 무료 도메인(`.eu.org`)은 승인까지 2주~한 달 걸려 "빠르게" 컨셉에 맞지 않습니다.

### 서비스명 후보 (vercel.app 서브도메인)

광고 헤드라인과 입에 잘 붙는 후보:

| 후보 | URL 예시 | 톤 |
|------|----------|----|
| **quickiq** | quickiq.vercel.app | 직관적, 외우기 쉬움 ⭐ |
| **7iq** | 7iq.vercel.app | "7분에 IQ" 컨셉 강조 |
| **iqsnap** | iqsnap.vercel.app | 인스타 연관, 짧고 모던 |
| **순간iq** | sungan-iq.vercel.app | 한국어 직관 |
| **myiqkr** | myiqkr.vercel.app | 한국 시장 명시 |

Vercel 대시보드에서 "Project Settings → Domains → Edit"으로 1초 안에 변경 가능. 일단 자동 생성된 `iq-test-mvp-xxx.vercel.app`으로 운영 시작 → 광고 돌리면서 입에 가장 잘 붙는 이름으로 교체하는 흐름이 가장 빠릅니다.

### 이후 진짜 도메인 갖고 싶다면

흑자 전환 후 단계적 업그레이드:

1. **.com** (가장 안전, 1년 1.5~2만원) — Namecheap, Cloudflare Registrar (원가에 가까움)
2. **.kr / .co.kr** (한국 신뢰도, 1년 1.5~3만원) — 가비아, 후이즈
3. **.io** (테크 서비스 인상, 1년 3~5만원) — 굳이는 아님

#### 도메인 구입 후 마이그레이션 단계 (15분)

1. **Vercel 프로젝트 설정에서 도메인 추가**
   - `https://vercel.com/yybb-s-projects/quickiq/settings/domains`
   - **Add** → 본인 도메인(예: `quickiq.com`) 입력 → **Add**
   - Vercel이 DNS 레코드 2개 제공: `A` 레코드 (또는 `CNAME`) + 인증용 `TXT` 레코드

2. **도메인 등록업체에서 DNS 레코드 추가**
   - 가비아/후이즈/Cloudflare 등에서 본인 도메인 DNS 관리 페이지 접속
   - Vercel이 알려준 레코드 그대로 추가
   - 보통 Apex(`@`): A 레코드 `76.76.21.21`
   - WWW(`www`): CNAME 레코드 `cname.vercel-dns.com`
   - 인증 TXT: Vercel 지정값 그대로

3. **DNS 전파 + SSL 발급 대기** (5~30분, 최대 24시간)
   - Vercel Domains 페이지에서 ⏳ 표시 → ✅ 표시로 바뀌면 끝
   - 자동으로 Let's Encrypt SSL 발급됨

4. **`NEXT_PUBLIC_APP_URL` env 변경**
   - Vercel → Settings → Environment Variables
   - `NEXT_PUBLIC_APP_URL`을 `https://quickiq.com`(본인 도메인)으로 수정
   - 재배포 트리거 (빈 commit push 또는 Vercel 대시보드 Redeploy)

5. **Resend 도메인 인증 추가** (이메일 발신지 변경 시)
   - Resend → Domains → Add Domain → 본인 도메인
   - Resend가 제공하는 SPF/DKIM/DMARC TXT 레코드를 DNS에 추가
   - 인증 완료 후 `RESEND_FROM_EMAIL`을 `report@본인도메인` 으로 변경
   - 이제 광고 사용자 모두에게 PDF 메일 발송 가능 (sandbox 한계 해제)

6. **Lemon Squeezy webhook URL 갱신**
   - Lemon Squeezy → Settings → Webhooks → 기존 webhook 편집
   - URL을 `https://본인도메인/api/webhooks/lemon-squeezy` 로 수정
   - 또는 새 도메인용 webhook을 추가하고 기존 거 비활성화

7. **이전 vercel.app 도메인은 자동 redirect**
   - Vercel이 자동으로 옛 URL을 새 도메인으로 308 리다이렉트
   - 광고에 옛 URL이 살아있는 경우도 안전

도메인 마이그레이션 총 소요: **DNS 추가 5분 + 전파 대기 5–30분 + Resend/LS 갱신 5분 = 약 30분**.

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

총 15개 시나리오 — `tests/e2e/smoke.spec.ts` (응시→결과→mock 결제) + `tests/e2e/hardening.spec.ts` (rate limit, 보안 헤더, 404, SEO 엔드포인트, /about, 로케일 스위처, FAQ JSON-LD, short URL miss, /api/health). iPhone 13 viewport(390×844) 기준, Chromium 단일 브라우저.

### Unit 테스트 (node:test, 추가 의존성 0개)
```bash
npm run test:unit
```
`tests/unit/` — `email-typo.ts` (typo suggester 7 케이스), `classify.ts` (IQ band/hook/strength-weakness/lead-size 8 케이스). 새 deps 없이 Node 20 내장 `node:test` + `tsx` ESM 로더로 실행.

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
- Cookie consent banner에서 "거부" 누르면 즉시 비활성화 (PIPA/GDPR)

### Claude GitHub Action (`@claude` 멘션)
`.github/workflows/claude.yml` — Issue / PR 코멘트에 `@claude ...` 멘션하면 자동으로 Claude가 응답합니다 (코드 변경 + PR 생성, 또는 리뷰 코멘트).

활성화에 필요한 2단계:
1. **Anthropic GitHub App 설치** — https://github.com/apps/claude → `Install` → `yunneom/quickiq-` 선택
2. **API Key 등록** — https://console.anthropic.com/settings/keys 에서 키 발급 → Repo Settings → Secrets and variables → Actions → `New repository secret` → Name `ANTHROPIC_API_KEY`, Value 방금 받은 키

설정 끝나면 GitHub에서 `@claude 이 코드 리뷰해줘` 같은 멘션이 트리거.

### Health endpoint
**GET `/api/health`** — 외부 모니터링 도구(Pingdom, UptimeRobot 등)용 무인증 liveness 체크.

응답 예시:
```json
{
  "status": "ok",
  "time": "2026-05-24T00:30:00.000Z",
  "commit": "ca4c710",
  "region": "icn1",
  "integrations": {
    "supabase": false,
    "lemonSqueezy": true,
    "resend": true,
    "sentry": true,
    "kakao": true,
    "metaPixel": false
  }
}
```

→ `integrations.*`가 모두 true일 때 모든 외부 서비스 연결됨. UptimeRobot 등에서 `/api/health`를 1분 간격으로 polling하면 서비스 다운 즉시 알림 받음.

### 운영자 endpoint 빠른 참조

| Endpoint | 용도 | 인증 |
|---|---|---|
| `GET /api/health` | 모니터링 liveness + 통합 상태 + uptime + branch + node 버전 | 무인증 |
| `GET /api/admin/stats` | 응시/결제/평균 IQ + by_locale + by_day + funnel | `x-admin-token` 헤더 |
| `GET /api/stats/public` | 랜딩 카드용 익명 통계 (응시자 수 + 평균 IQ) | 무인증 (60초 캐시) |
| `POST /api/funnel/track` body: `{event}` | 클라이언트 funnel beacon (allow-list 강제) | 무인증 |
| `GET /api/test/pdf?sessionId=…` | paid 사용자 PDF 직접 다운로드 | sessionId 보유 |
| `POST /api/email/resend` body: `{sessionId}` | paid 사용자 메일 재발송 | sessionId 보유 + 5회/시간 제한 |
| `POST /api/webhooks/lemon-squeezy` | LS 결제 webhook 수신 | HMAC-SHA256 서명 검증 |
| `GET /r/{code}` | 8자 short URL → 결과 페이지 redirect | 무인증 |

Admin 통계 사용 예시:
```bash
curl https://7iq.vercel.app/api/admin/stats \
  -H "x-admin-token: $ADMIN_TOKEN"
```

### SQL migration 검증
DB 마이그레이션 파일 정합성 정적 검증:
```bash
npm run verify:sql
```
괄호/따옴표 균형, 중복 테이블/정책 정의, 흔한 오타를 잡습니다. Supabase에 올리기 전 한 번 돌려두면 안전.

## 알려진 한계

- 공간 추론 문항 6개는 SVG 도형으로 구현 완료. 나머지 1개(주사위 합)는 텍스트 추론으로 유지.
- 더미 문항은 콘텐츠 빠른 검증용 — `docs/questions.md` 가이드대로 실제 문항을 작성해 교체하세요. 특히 verbal 5번 "고양이:동물 = 장미:?" 같은 모호한 답안은 운영 전 카피라이팅 필요.
- 카카오톡 공유 SDK는 코드는 통합되어 있으나 `NEXT_PUBLIC_KAKAO_APP_KEY` 미입력 시 비활성 — 사용자가 Kakao Developers에서 키 발급 후 등록 필요.
- 결제 PG는 Lemon Squeezy 한 곳만 — 한국 사용자에게 토스페이먼츠/카카오페이 직결을 원한다면 별도 PG 연결 필요(별도 작업).

## 누적 구현 현황 (참고)

| 영역 | 상태 |
|------|------|
| 라우트 | 35+ (페이지 14 + API 16 + SEO 메타 8) |
| 더미 문항 | 한/영 각 30문항 + 영역별 12개 풀, 공간 6개 SVG |
| 빌드 | next build 통과 |
| 타입 | tsc --noEmit 0 에러 |
| Lint | 0 경고 |
| Unit | node:test 44개 케이스 (`npm run test:unit`) — email-typo, classify, ab, pricing, speed, webhook-signature, duration |
| E2E | Playwright 16개 (smoke 11 + hardening 5) 통과 |
| 보안 헤더 | CSP, X-Frame-Options DENY 외 4개 |
| Rate limit | IP당 60회/시간, SHA-256 해시 |
| Sentry | client/server/edge 3개 config + 모든 critical API wrapping |
| Vercel | Analytics + Speed Insights + 프리뷰 배포 워크플로 |
| CI | lint/typecheck/unit/build + Playwright 풀 실행, 시크릿 0개 필요 |
| Dependabot | npm + GH Actions 주 1회 |
| Funnel | TestStart→PaymentSuccess + Q1/Q15/Q25 + ExitIntent (Meta trackCustom + in-memory) |

> ** 일부 smoke 카운트는 추가됨; 총 15-시나리오 풀 e2e.

### Round 13–28 추가 기능 요약

- **공유**: Web Share API native sheet, 8-char short URL `/r/{code}`, 1080×1080 IG feed + 1080×1920 story 이미지
- **전환**: free signature-strength tease (paywall 위), exit-intent modal (1회성), 미드테스트 응원 배너 (Q15/Q25), share-to-unlock bonus insight
- **결제 UX**: Levenshtein-기반 email typo 제안 (gmial.com → gmail.com), 환불 정책 카드 (체크아웃), text+html email
- **A/B**: `lib/ab.ts` SHA bucket assignment + paywall CTA copy 실험 (`paywall-cta-v1`) — `/admin → A/B experiments` 카드에서 variant별 conversion
- **가격**: `NEXT_PUBLIC_PRICE_KRW` A/B (per Vercel env), `NEXT_PUBLIC_USD_KRW_PEG` FX 조정, `/admin → By price` revenue 세그먼트
- **SEO**: FAQPage + Article JSON-LD, `/about` 페이지 (방법론+영역설명), hreflang sitemap, 전환 경로 noindex
- **a11y**: `:focus-visible` 키보드 ring, `prefers-reduced-motion` 존중, 로케일 스위처
- **성능**: IntersectionObserver-deferred mounts (QR + InstallPrompt + Retake + Explanations)
- **운영**: PWA install prompt + shortcuts, 24h retake CTA, 난이도 별표 (★), FAQ 10개, /admin funnel/locale/7-day 차트 + by-price + experiments, `/api/admin/sessions/[id]` lookup, `/api/admin/sessions.csv` export, `/api/admin/funnel/reset`
- **콘텐츠**: speed percentile (`fast/normal/slow`), duration percentile (faster-than-X%), paid 30-question accordion (PDF 대기 시간 흡수)
