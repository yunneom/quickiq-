-- 0010_ig_posts.sql
-- Instagram auto-post ledger. The cron claims a row BEFORE publishing, so
-- the unique post_key is what makes a retried/duplicated cron firing a
-- no-op instead of a double post (IG publishing quota is ~50/24h and a
-- duplicate post is user-visible).

create table if not exists ig_posts (
  id          bigint generated always as identity primary key,
  post_key    text not null unique,
  status      text not null default 'publishing'
                check (status in ('publishing', 'published', 'failed')),
  media_id    text,
  image_url   text,
  error       text,
  created_at  timestamptz default now()
);

create index if not exists ig_posts_created_idx on ig_posts(created_at);

alter table ig_posts enable row level security;
-- service_role only. No policies ⇒ anon/authenticated cannot read or write.
