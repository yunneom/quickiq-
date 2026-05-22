-- email_logs — Resend 이메일 발송 로그
create table if not exists email_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references test_sessions(id),
  email       text not null,
  template    text not null check (template in ('report','receipt')),
  resend_id   text,
  status      text not null check (status in ('sent','failed')),
  error       text,
  created_at  timestamptz default now()
);

create index if not exists email_logs_session_idx on email_logs(session_id);

alter table email_logs enable row level security;
-- service_role only.
