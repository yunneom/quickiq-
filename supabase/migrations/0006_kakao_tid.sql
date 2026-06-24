-- 0006_kakao_tid.sql
-- Kakao Pay returns a transaction id (`tid`) at /ready time that must be
-- preserved until the /approve call lands (the buyer comes back via a
-- separate redirect, possibly minutes later). We stash it on the
-- test_sessions row keyed by sessionId so the approve handler can look it
-- up without a separate table. NULL for sessions that paid via any other
-- processor (Toss, LS, mock).

alter table test_sessions
  add column if not exists kakao_tid text;
