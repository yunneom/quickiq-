-- questions — IQ 문항 마스터
create extension if not exists "pgcrypto";

create table if not exists questions (
  id            uuid primary key default gen_random_uuid(),
  order_index   int not null,
  category      text not null check (category in ('verbal','numerical','spatial','logical')),
  difficulty    int not null check (difficulty between 1 and 5),
  locale        text not null check (locale in ('ko','en')),
  question_text text not null,
  question_image_url text,
  options       jsonb not null,
  correct_id    text not null check (correct_id in ('A','B','C','D')),
  explanation   text,
  created_at    timestamptz default now()
);

create index if not exists questions_locale_order_idx on questions(locale, order_index);

alter table questions enable row level security;

-- Anyone (including anon) can read.
drop policy if exists "questions_read_all" on questions;
create policy "questions_read_all" on questions
  for select using (true);

-- Writes only via service_role (which bypasses RLS).
-- (We intentionally do not define any insert/update/delete policy here.)
