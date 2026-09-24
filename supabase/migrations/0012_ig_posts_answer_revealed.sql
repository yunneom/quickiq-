-- 0012_ig_posts_answer_revealed.sql
-- Next-day answer reveal. The puzzle goes out with no answer anywhere; the
-- seed comment promises it "in 24h", and the cron keeps that promise by
-- commenting the correct option + one-line explanation on the previous
-- days' posts. This stamp is what makes that idempotent across the two
-- daily runs and any retries: a row is revealed at most once.

alter table ig_posts add column if not exists answer_revealed_at timestamptz;
