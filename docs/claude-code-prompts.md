# Claude Code 시작 프롬프트

아래 내용을 Claude Code에 그대로 복붙해서 시작하세요.

---

## 첫 번째 메시지 (프로젝트 초기 셋업)

```
이 디렉토리에 있는 다음 파일들을 순서대로 읽어줘:
1. CLAUDE.md (전체 컨텍스트, 코딩 컨벤션, 금지 사항)
2. PRD.md (제품 요구사항)
3. docs/db-schema.md (DB 스키마)
4. docs/questions.md (콘텐츠 가이드)

읽은 후에 다음을 순서대로 실행해줘:

1. Next.js 14 + TypeScript + Tailwind + App Router로 프로젝트 초기화
2. shadcn/ui 설치 및 기본 컴포넌트(button, card, input, progress) 추가
3. Supabase 클라이언트 셋업 (서버용/클라이언트용 분리)
4. next-intl로 i18n 셋업 (ko/en, 라우팅 [locale])
5. 환경변수 템플릿 .env.example 작성
6. 폴더 구조를 CLAUDE.md 명세대로 생성 (빈 파일이라도)
7. supabase/migrations/ 에 db-schema.md 기반 SQL 마이그레이션 4개 작성
8. README.md에 로컬 개발 시작 가이드 작성

각 단계 끝나면 뭐 했는지 한 줄로 요약하고 다음으로 넘어가. 막히는 부분 있으면 멈추고 물어봐.
```

## 두 번째 메시지 (테스트 진행 화면)

```
이제 핵심 기능을 만들자.

1. app/[locale]/page.tsx — 랜딩 페이지
   - PRD.md 2.1절 참고
   - 헤드라인 + CTA + 면책 문구
   - Meta Pixel "PageView" 발사

2. app/[locale]/test/page.tsx — 테스트 진행
   - PRD.md 2.2절 참고
   - 진행률 바, 한 번에 한 문항
   - URL 쿼리에 세션 ID 유지
   - 60초 타임아웃

3. app/api/test/start/route.ts — 세션 생성 API
4. app/api/test/submit/route.ts — 답안 제출 API (점수 계산 포함)

5. lib/scoring/index.ts — 점수 계산 로직
   - PRD.md 2.3절 공식 그대로
   - 단위 테스트 함께 작성

진행 전에 docs/questions.md를 다시 읽고, 한국어 더미 문항 30개를 먼저 작성해서 seed-dummy.ts로 DB에 주입해줘 (개발용).
```

## 세 번째 메시지 (결제 + 자동화)

```
이제 결제와 자동화를 붙이자.

1. Lemon Squeezy 연동
   - app/api/checkout/route.ts: 체크아웃 URL 생성
   - app/api/webhooks/lemon-squeezy/route.ts: webhook 핸들러
   - 서명 검증, idempotency 처리 필수

2. PDF 리포트 자동 생성
   - lib/pdf/report-template.tsx (@react-pdf/renderer)
   - PRD.md 2.6절 참고

3. Resend 연동
   - lib/email/send-report.ts
   - PDF 첨부, 다국어 템플릿

4. Meta Conversion API
   - lib/analytics/capi.ts
   - Webhook 안에서 Purchase 이벤트 서버 전송

5. 결과 페이지 app/[locale]/result/[sessionId]/page.tsx
   - 무료 요약 + 블러된 상세 정보
   - 결제 CTA

테스트할 때는 Lemon Squeezy test mode + Resend test mode 사용.
```

## 네 번째 메시지 (배포 준비)

```
배포 전 마무리:

1. SEO 메타데이터 (Open Graph, Twitter Card 포함)
2. robots.txt, sitemap.xml
3. 개인정보처리방침/이용약관 페이지 (한/영)
4. 에러 페이지 (404, 500) 디자인
5. Sentry 셋업
6. Vercel 배포 설정 (vercel.json, 환경변수 가이드)
7. GitHub Actions: PR 시 lint + typecheck + build 자동 실행

마지막으로 README.md를 업데이트해서 다음을 포함해줘:
- 로컬 실행법
- 환경변수 설명
- 배포 가이드
- 광고 운영 시 체크리스트 (Meta Pixel ID 설정, Lemon Squeezy 상품 ID 등)
```

---

## 팁: Claude Code 효율적으로 쓰기

- **/init**: 프로젝트 시작 시 Claude Code가 자동으로 CLAUDE.md 분석
- **`/clear`**: 작업 단위가 바뀔 때마다 컨텍스트 정리 (토큰 절약)
- **계획 모드**: 복잡한 작업은 `--plan` 플래그로 먼저 계획 검토 후 실행
- **막힐 때**: 에러 메시지 그대로 붙여넣기 + "이거 왜 그래?"

## 사람이 직접 해야 하는 것 (Claude Code 못 함)

1. 계정 4개 가입 + 환경변수 받기:
   - Supabase 프로젝트 생성 → URL, anon key, service_role key
   - Lemon Squeezy 가입 → API key, store ID, product ID, webhook secret
   - Resend 가입 → API key
   - Vercel + GitHub 연동
2. IQ 문항 30개 직접 작성 (영어 버전 포함)
3. 도메인 구입 + Vercel 연결
4. Meta Business 계정 → Pixel ID, Conversion API access token
5. 광고 크리에이티브 (이미지/영상) 제작
