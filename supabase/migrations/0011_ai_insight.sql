-- 0011_ai_insight.sql
-- AI 개인 해설 캐시. 성격 테스트 결과 페이지에서 세션(유형 + 축 점수)별로
-- 한 번만 생성해 저장한다 — 같은 결과 URL 을 다시 열거나 공유받은 사람이
-- 열 때 모델을 재호출하지 않도록(비용 0 에 수렴). IQ 세션은 NULL.
--   { "items": string[], "model": text, "locale": 'ko'|'en', "created_at": iso }

alter table test_sessions
  add column if not exists ai_insight jsonb;
