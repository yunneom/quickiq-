-- 0007_meme_test_types.sql
-- Add the two meme tests ('tf' = 너 T야?, 'dopamine' = 도파민 중독) to the
-- test_type allowlist. The check constraint from 0005 was created inline,
-- so Postgres auto-named it test_sessions_test_type_check — drop by that
-- name and recreate with the extended list.

alter table test_sessions
  drop constraint if exists test_sessions_test_type_check;

alter table test_sessions
  add constraint test_sessions_test_type_check
    check (test_type in (
      'iq', 'teto-egen', 'mbti', 'attachment', 'love-lang', 'enneagram',
      'tf', 'dopamine'
    ));
