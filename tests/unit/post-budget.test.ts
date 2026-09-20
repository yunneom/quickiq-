import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FALLBACK_RESERVE_MS,
  MAX_DURATION_S,
  MAX_POST_WINDOW_MS,
  MIN_POST_MS,
  MIN_REEL_PUBLISH_MS,
  TOTAL_BUDGET_MS,
  reelBuildWindowMs,
  secondSlotCanStart,
} from '../../lib/social/post-budget';

const ROUTE = join(process.cwd(), 'app/api/cron/ig-post/route.ts');

describe('cron time budget', () => {
  it('matches the route segment config Next actually reads', () => {
    // maxDuration must stay a literal for Next's static analysis, so the
    // only way to keep it honest is to read it back out of the source.
    const src = readFileSync(ROUTE, 'utf8');
    const m = src.match(/^export const maxDuration = (\d+);$/m);
    assert.ok(m, 'route no longer exports a literal maxDuration');
    assert.equal(Number(m![1]), MAX_DURATION_S);
  });

  it('leaves the run a tail for the ledger write and the status snapshot', () => {
    assert.ok(TOTAL_BUDGET_MS < MAX_DURATION_S * 1000);
    // One post may not eat the whole window: the snapshot and the JSON
    // response come after it.
    assert.ok(
      MAX_POST_WINDOW_MS <= TOTAL_BUDGET_MS - 25_000,
      'a single post can run right up to the function timeout',
    );
  });

  it('gives the reel encoder enough wall clock for a heavy clip', () => {
    // Regression: at a 200s post window the build got 105s, and a large
    // background clip (download + ffmpeg extraction + 1080x1920 encode)
    // overran it — the post then went out as the still card instead.
    assert.equal(
      reelBuildWindowMs(),
      MAX_POST_WINDOW_MS - FALLBACK_RESERVE_MS - MIN_REEL_PUBLISH_MS,
    );
    assert.ok(
      reelBuildWindowMs() >= 150_000,
      `reel build window is only ${reelBuildWindowMs()}ms`,
    );
    assert.ok(reelBuildWindowMs(200_000) < 150_000, 'the old window was not the tight one');
  });

  it('the post window does not decide whether a second slot runs', () => {
    // The loop's own guard is elapsed <= TOTAL_BUDGET - MIN_POST_MS, so
    // widening MAX_POST_WINDOW_MS costs no second post that the narrower
    // cap would have allowed: a first post outlasting MIN_POST_MS already
    // ruled one out under either value.
    assert.ok(secondSlotCanStart(MIN_POST_MS - 1));
    assert.ok(!secondSlotCanStart(TOTAL_BUDGET_MS - MIN_POST_MS + 1));
    for (const cap of [200_000, MAX_POST_WINDOW_MS]) {
      assert.ok(
        !secondSlotCanStart(cap),
        `a post that used the full ${cap}ms window never left room for a second`,
      );
    }
  });
});
