-- 0009_measurement.sql
-- 측정 인프라: (1) test_sessions에 utm/ab 영속화 — 프로덕션 경로에서
-- UTM이 통째로 유실되어 캠페인별 ROI 계산이 불가능했다. (2) funnel_events
-- 테이블 — 인메모리 퍼널 카운터는 서버리스 인스턴스별로 증발/파편화됨.

alter table test_sessions
  add column if not exists utm jsonb;

alter table test_sessions
  add column if not exists ab jsonb;

create table if not exists funnel_events (
  id          bigint generated always as identity primary key,
  event       text not null,
  test_type   text,
  locale      text,
  session_id  uuid,
  utm         jsonb,
  created_at  timestamptz default now()
);

create index if not exists funnel_events_event_created_idx
  on funnel_events(event, created_at);

alter table funnel_events enable row level security;
-- service_role only. No policies ⇒ anon/authenticated cannot read or write.
