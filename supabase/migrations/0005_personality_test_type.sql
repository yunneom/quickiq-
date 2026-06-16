-- 0005_personality_test_type.sql
-- Extend test_sessions to host personality tests (테토/에겐, MBTI, 애착 유형,
-- 사랑의 언어, 에니어그램) alongside the existing IQ test. The IQ-specific
-- columns (raw_score, estimated_iq, percentile, category_scores) stay
-- NULL for personality sessions; personality-specific columns
-- (profile_id, axis_scores) stay NULL for IQ sessions. Single table
-- keeps the funnel/admin queries unified.

alter table test_sessions
  add column if not exists test_type text not null default 'iq'
    check (test_type in ('iq', 'teto-egen', 'mbti', 'attachment', 'love-lang', 'enneagram'));

alter table test_sessions
  add column if not exists profile_id text;

alter table test_sessions
  add column if not exists axis_scores jsonb;

create index if not exists test_sessions_test_type_idx on test_sessions(test_type);
