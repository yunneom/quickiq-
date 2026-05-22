# CLAUDE.md

이 파일은 Claude Code가 작업 시작 시 항상 먼저 읽는 컨텍스트 문서입니다.

## 프로젝트 개요

**서비스명**: (미정 — 도메인 정하면 업데이트)
**한 줄 설명**: 인스타 광고로 유입된 사용자에게 IQ 테스트를 제공하고, 상세 리포트를 9,900원에 판매하는 모바일 우선 웹 서비스.
**비즈니스 모델**: 광고 유입 → 무료 테스트 → 무료 요약 결과 → 9,900원 상세 리포트 (PDF 이메일 발송)

## 3대 원칙 (모든 의사결정의 기준)

1. **무료**: 운영 비용 0원 시작. 모든 외부 서비스는 무료 티어로 시작 가능해야 함.
2. **자동화**: 결제 → PDF 생성 → 이메일 발송까지 사람 개입 없이 완전 자동. 운영자는 잠자는 동안에도 돈이 들어와야 함.
3. **빠르게**: 주말 안에 실제 결제 가능한 상태로 배포. 과한 추상화 금지, YAGNI 원칙.

## 기술 스택 (확정)

- **프레임워크**: Next.js 14 (App Router) + TypeScript
- **스타일**: Tailwind CSS + shadcn/ui
- **DB + Auth**: Supabase (익명 세션 활용, 별도 로그인 없음)
- **결제**: Lemon Squeezy (사업자 등록 불필요, 글로벌 카드 지원)
- **이메일**: Resend (월 3,000건 무료)
- **PDF**: @react-pdf/renderer (서버 사이드 생성)
- **분석**: Vercel Analytics + Meta Pixel + Meta Conversion API
- **에러**: Sentry 무료 티어
- **배포**: Vercel (GitHub 연동, push → 자동 배포)
- **i18n**: next-intl (한국어/영어)

## 코딩 컨벤션

- **언어**: TypeScript strict mode. `any` 사용 금지 (불가피한 경우 주석으로 이유 명시).
- **컴포넌트**: 함수형, named export 선호. Server Component 기본, Client Component는 필요할 때만 `'use client'` 명시.
- **스타일링**: Tailwind 클래스만 사용. CSS 모듈/styled-components 금지.
- **상태 관리**: 가능하면 URL state(searchParams), 그 다음 React state. 전역 상태 라이브러리 도입 금지(현재 규모에선 불필요).
- **데이터 페칭**: Server Component에서 직접 Supabase 호출. SWR/React Query 도입 금지.
- **에러 처리**: 모든 API Route는 try-catch + Sentry 캡처. 사용자에게는 친근한 메시지만 노출.
- **i18n**: 하드코딩된 한국어/영어 문자열 금지. 무조건 `messages/ko.json`, `messages/en.json` 통과.

## 폴더 구조

```
app/
├── [locale]/              # i18n 라우팅
│   ├── page.tsx           # 랜딩 (광고 유입 페이지)
│   ├── test/              # 테스트 진행
│   ├── result/[id]/       # 결과 (무료 요약)
│   └── checkout/          # 결제
├── api/
│   ├── test/              # 테스트 세션 시작/제출
│   ├── checkout/          # Lemon Squeezy 체크아웃 URL 생성
│   └── webhooks/
│       └── lemon-squeezy/ # 결제 완료 → PDF 생성 → 이메일 발송
components/
├── ui/                    # shadcn 컴포넌트
└── test/                  # 테스트 관련 컴포넌트
lib/
├── supabase/              # DB 클라이언트
├── scoring/               # IQ 점수 계산 로직
├── pdf/                   # PDF 템플릿
└── analytics/             # Meta Pixel/CAPI
messages/
├── ko.json
└── en.json
docs/                      # 이 PRD 패키지
```

## 작업 시 주의사항

- **이 파일들을 항상 먼저 읽어라**: `PRD.md`, `docs/db-schema.md`, `docs/questions.md`
- **DB 스키마 변경 시**: `docs/db-schema.md` 먼저 업데이트한 후 마이그레이션 작성
- **새 페이지 추가 시**: `messages/ko.json`과 `messages/en.json` 동시에 업데이트
- **환경변수**: `.env.example` 항상 최신 유지. 실제 값은 절대 커밋 금지.
- **광고 유입 페이지 최적화**: LCP < 2.5s, 모바일 폰트는 16px 이상(iOS 자동 줌 방지)
- **결제 관련 코드**: 절대 클라이언트에서 가격 계산하지 마라. 서버에서만 가격 결정.

## 자주 쓰는 명령어

```bash
npm run dev              # 개발 서버
npm run build            # 프로덕션 빌드
npm run lint             # ESLint
npx supabase db push     # DB 마이그레이션 적용
```

## 절대 하지 말 것

- 사용자 이메일을 평문으로 로그에 남기기
- 클라이언트에서 결제 금액 결정
- 한국어/영어 외 언어 추가 (현재 단계 out of scope)
- 가입/로그인 기능 추가 (의도적으로 마찰 제거)
- IQ 점수를 "정확한 의학적 IQ"로 표현 (법적 리스크 — "추정 점수/Estimated Score"로 표기)
