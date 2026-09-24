/**
 * Next-day answer reveal — the half that touches the ledger and Instagram.
 * See reveal.ts for the rules; this only walks the rows.
 */

import { createSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/server';
import { postComment } from './instagram';
import { parsePostKey, planForLedgerKey, revealComment, revealDueDays } from './reveal';

/** Rows examined per run — the ledger holds ≤1 post/day now, 3/day before. */
const REVEAL_BATCH = 12;

export interface RevealSummary {
  revealed: string[];
  notes: string[];
}

/**
 * Post the answer on every published post from the last few days that
 * has not had one yet, then stamp the row. Runs after today's publish so
 * it can never eat the publish budget; a whole batch is a few seconds.
 *
 * Rows from before this shipped are excluded by the created_at floor, so
 * enabling the feature does not suddenly comment on a week of old posts.
 */
export async function revealDueAnswers(args: {
  today: number;
  deadlineAt: number;
}): Promise<RevealSummary> {
  const revealed: string[] = [];
  const notes: string[] = [];
  if (!isSupabaseConfigured()) return { revealed, notes: ['supabase_not_configured'] };

  const due = new Set(revealDueDays(args.today));
  if (due.size === 0) return { revealed, notes };

  const admin = createSupabaseAdmin();
  // created_at is the claim time — the earliest the post could have gone
  // out. One extra day of slack covers a reclaimed row's refreshed stamp.
  const since = new Date((Math.min(...due) - 1) * 86_400_000).toISOString();
  const { data, error } = await admin
    .from('ig_posts')
    .select('post_key,media_id')
    .eq('status', 'published')
    .is('answer_revealed_at', null)
    .not('media_id', 'is', null)
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(REVEAL_BATCH);
  if (error) return { revealed, notes: [`ledger: ${error.message}`] };

  for (const row of data ?? []) {
    if (Date.now() > args.deadlineAt) {
      notes.push('stopped: out of time');
      break;
    }
    const parsed = parsePostKey(String(row.post_key));
    // Test posts never get a public reveal; today's post is not due yet;
    // anything older than the window is left alone.
    if (!parsed || parsed.test || !due.has(parsed.day)) continue;

    const plan = planForLedgerKey(parsed);
    if (!plan) {
      notes.push(`${row.post_key}: plan_mismatch`);
      continue;
    }
    const text = revealComment(plan);
    if (!text) {
      notes.push(`${row.post_key}: no_answer`);
      continue;
    }

    const result = await postComment(String(row.media_id), text);
    if (!result.ok) {
      notes.push(`${row.post_key}: ${result.reason}`);
      continue;
    }
    const { error: stampError } = await admin
      .from('ig_posts')
      .update({ answer_revealed_at: new Date().toISOString() })
      .eq('post_key', row.post_key);
    if (stampError) notes.push(`${row.post_key}: revealed_but_unstamped: ${stampError.message}`);
    revealed.push(String(row.post_key));
  }
  return { revealed, notes };
}
