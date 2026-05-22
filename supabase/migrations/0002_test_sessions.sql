-- test_sessions — 익명 테스트 응시 세션
create table if not exists test_sessions (
  id              uuid primary key default gen_random_uuid(),
  locale          text not null check (locale in ('ko','en')),
  started_at      timestamptz default now(),
  completed_at    timestamptz,
  user_agent      text,
  ip_hash         text,
  answers         jsonb,
  raw_score       int,
  estimated_iq    int,
  percentile      numeric,
  category_scores jsonb,
  email           text,
  is_paid         boolean default false,
  paid_at         timestamptz
);

create index if not exists test_sessions_email_idx on test_sessions(email);
create index if not exists test_sessions_started_at_idx on test_sessions(started_at);

alter table test_sessions enable row level security;

-- Anyone can insert a brand new session (anon test start).
drop policy if exists "sessions_insert_anon" on test_sessions;
create policy "sessions_insert_anon" on test_sessions
  for insert with check (true);

-- Anyone can select a session if they have the id (the URL acts as a capability token).
drop policy if exists "sessions_select_anon" on test_sessions;
create policy "sessions_select_anon" on test_sessions
  for select using (true);

-- Updates only via service_role.
