/**
 * Next-day answer reveal — the pure half.
 *
 * The puzzle goes out with no answer anywhere: not on the card, not in
 * the caption. The comment section arguing about it is the engagement
 * engine, and the seed comment promises "answer in 24h". This module is
 * how that promise gets kept: it turns a ledger row back into the post
 * it was, and the post into the one comment that reveals it.
 *
 * Safety over completeness. A reveal is only ever built from a plan that
 * was recomputed from the ledger key AND still carries the same key. The
 * planner is deterministic and its legacy branch is frozen, so a mismatch
 * means the content moved under a live post — and the safest answer to a
 * puzzle we can no longer identify is no answer.
 *
 * Kept free of Supabase and Instagram imports so it is reachable from a
 * unit test; the run loop lives in reveal-run.ts.
 */

import { plansForDay, type IgPostPlan } from './ig-content';
import { optionsAreFigureRefs } from './mural';

/** How many days back a missed reveal is still worth posting. */
export const REVEAL_WINDOW_DAYS = 3;
/** Instagram's comment length ceiling. */
export const IG_COMMENT_MAX = 2200;

export interface ParsedPostKey {
  day: number;
  slot: number;
  planKey: string;
  /** The `?test=` label, when the post was a test and must never be revealed. */
  test: string | null;
}

/**
 * Inverse of the cron's buildPostKey: `${day}:${slot}:${plan.key}` with an
 * optional `:test-<label>` suffix. Plan keys carry no colons.
 */
export function parsePostKey(postKey: string): ParsedPostKey | null {
  const parts = postKey.split(':');
  if (parts.length < 3) return null;
  const day = Number(parts[0]);
  const slot = Number(parts[1]);
  if (!Number.isInteger(day) || !Number.isInteger(slot) || day < 0 || slot < 0) return null;
  let rest = parts.slice(2);
  let test: string | null = null;
  const last = rest[rest.length - 1];
  if (rest.length > 1 && last.startsWith('test-')) {
    test = last.slice('test-'.length) || null;
    rest = rest.slice(0, -1);
  }
  const planKey = rest.join(':');
  if (!planKey) return null;
  return { day, slot, planKey, test };
}

/** The days whose posts are due a reveal: the last `window` days, never today. */
export function revealDueDays(today: number, window = REVEAL_WINDOW_DAYS): number[] {
  const out: number[] = [];
  for (let d = today - window; d <= today - 1; d++) if (d >= 0) out.push(d);
  return out;
}

/**
 * The post a ledger key was made from — or null when the recomputed plan
 * no longer carries the same key, in which case nothing is revealed.
 */
export function planForLedgerKey(parsed: ParsedPostKey): IgPostPlan | null {
  const plan = plansForDay(parsed.day)[parsed.slot];
  if (!plan || plan.key !== parsed.planKey) return null;
  return plan;
}

/**
 * The reveal comment for a post, or null when the plan carries no answer.
 * Names the option, repeats its text when that adds information (not for
 * "Shape B"-style figure references), gives the one-line explanation, and
 * closes with the bio CTA every other piece of copy uses.
 */
export function revealComment(plan: IgPostPlan): string | null {
  const answer = plan.answer?.trim();
  if (!answer) return null;
  const option = plan.card.options.find((o) => o.id === answer);
  const optionText = option?.text?.trim() ?? '';
  const showText =
    optionText.length > 0 &&
    optionText !== answer &&
    !optionsAreFigureRefs(plan.card.options);
  const lines = [showText ? `✅ Answer: ${answer} — ${optionText}` : `✅ Answer: ${answer}`];
  const explain = plan.explain?.trim();
  if (explain) lines.push(explain);
  lines.push('', 'Got it? The full 30-question IQ test is free — link in bio.');
  const text = lines.join('\n');
  return text.length > IG_COMMENT_MAX ? `${text.slice(0, IG_COMMENT_MAX - 1)}…` : text;
}
