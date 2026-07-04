-- 0008_gen_test_types.sql
-- Add the generation quizzes ('slang' = 신조어 능력고사, 'ajae' = 아재력
-- 테스트) to the test_type allowlist. Same drop-and-recreate pattern as
-- 0007 — the constraint name is stable.

alter table test_sessions
  drop constraint if exists test_sessions_test_type_check;

alter table test_sessions
  add constraint test_sessions_test_type_check
    check (test_type in (
      'iq', 'teto-egen', 'mbti', 'attachment', 'love-lang', 'enneagram',
      'tf', 'dopamine', 'slang', 'ajae'
    ));
