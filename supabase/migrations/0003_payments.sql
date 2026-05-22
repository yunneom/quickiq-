-- payments — Lemon Squeezy 결제 기록 (idempotency: ls_event_id unique)
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  session_id          uuid references test_sessions(id) not null,
  ls_event_id         text unique not null,
  ls_order_id         text not null,
  ls_customer_id      text,
  email               text not null,
  amount_cents        int not null,
  currency            text not null,
  status              text not null check (status in ('paid','refunded','failed')),
  pdf_sent_at         timestamptz,
  capi_sent_at        timestamptz,
  raw_payload         jsonb,
  created_at          timestamptz default now()
);

create index if not exists payments_session_id_idx on payments(session_id);
create index if not exists payments_email_idx on payments(email);

alter table payments enable row level security;
-- service_role only. No policies defined ⇒ anon/authenticated cannot read or write.
