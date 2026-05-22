# DB Schema

Supabase (PostgreSQL) 기준. 모든 테이블에 RLS(Row Level Security) 적용.

## 테이블

### `questions` — IQ 문항 마스터
사람이 미리 작성한 30문항을 저장.

```sql
create table questions (
  id            uuid primary key default gen_random_uuid(),
  order_index   int not null,                    -- 출제 순서 (1-30)
  category      text not null,                   -- 'verbal' | 'numerical' | 'spatial' | 'logical'
  difficulty    int not null check (difficulty between 1 and 5),
  locale        text not null,                   -- 'ko' | 'en'
  question_text text not null,
  question_image_url text,                       -- 도형 문제는 이미지
  options       jsonb not null,                  -- [{ id: 'A', text: '...' }, ...]
  correct_id    text not null,                   -- 'A' | 'B' | 'C' | 'D'
  explanation   text,                            -- 리포트용 해설
  created_at    timestamptz default now()
);

create index on questions(locale, order_index);
```

RLS: SELECT 누구나 가능 (anon 포함). INSERT/UPDATE/DELETE는 service_role만.

### `test_sessions` — 테스트 응시 세션
익명 사용자도 응시 가능. session_id를 쿠키/URL로 추적.

```sql
create table test_sessions (
  id              uuid primary key default gen_random_uuid(),
  locale          text not null,
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  user_agent      text,
  ip_hash         text,                          -- 평문 IP 금지, 해시만
  answers         jsonb,                         -- [{ question_id, selected_id, time_ms }, ...]
  raw_score       int,                           -- 0-30
  estimated_iq    int,                           -- 70-145 범위
  percentile      numeric,                       -- 0-100
  category_scores jsonb,                         -- { verbal: 85, numerical: 90, ... }
  email           text,                          -- 결제 시점에 입력
  is_paid         boolean default false,
  paid_at         timestamptz
);

create index on test_sessions(email);
create index on test_sessions(started_at);
```

RLS:
- SELECT: 본인 session_id를 알고 있으면 가능 (URL의 sessionId로 조회)
- INSERT: anon 가능 (테스트 시작)
- UPDATE: service_role만 (서버에서만 점수 기록)

### `payments` — 결제 기록
Lemon Squeezy webhook 이벤트 기반.

```sql
create table payments (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid references test_sessions(id) not null,
  ls_event_id         text unique not null,      -- Idempotency key
  ls_order_id         text not null,
  ls_customer_id      text,
  email               text not null,
  amount_cents        int not null,              -- 990 (USD) or 990000 (KRW)
  currency            text not null,             -- 'USD' | 'KRW'
  status              text not null,             -- 'paid' | 'refunded' | 'failed'
  pdf_sent_at         timestamptz,
  capi_sent_at        timestamptz,               -- Meta Conversion API 전송 완료 시각
  raw_payload         jsonb,                     -- webhook 원본 (디버깅용)
  created_at          timestamptz default now()
);

create index on payments(session_id);
create index on payments(email);
```

RLS: 모두 service_role만. 클라이언트 직접 접근 차단.

### `email_logs` — 이메일 발송 로그
재발송, 디버깅용.

```sql
create table email_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references test_sessions(id),
  email       text not null,
  template    text not null,                     -- 'report' | 'receipt'
  resend_id   text,
  status      text not null,                     -- 'sent' | 'failed'
  error       text,
  created_at  timestamptz default now()
);
```

## 마이그레이션 파일 위치

```
supabase/migrations/
├── 0001_questions.sql
├── 0002_test_sessions.sql
├── 0003_payments.sql
└── 0004_email_logs.sql
```

## 초기 데이터 시딩

`scripts/seed.ts`에서 `docs/questions.md`의 30문항(한/영)을 `questions` 테이블에 자동 주입.

```bash
npm run seed
```
