import type { IgPostPlan } from './ig-content';

/**
 * Threads-native copy for a post plan.
 *
 * The Instagram caption is the wrong shape for Threads, and it was being
 * sent there sliced to 500 characters:
 *   · Threads is a text-first feed — the first line IS the post, so it
 *     must be the hook, not Instagram's keyword-first search line.
 *   · Instagram's "link in bio" is dead weight here: a URL in a Threads
 *     post is clickable, so the post carries the link itself (tagged
 *     utm_source=threads so the funnel shows what Threads actually sends).
 *   · Threads reads ONE hashtag as the post's topic; Instagram's block of
 *     five was cut off by the 500-char slice anyway.
 *
 * Pure: no I/O, so it is unit-tested directly.
 */

/** Threads rejects text over 500 characters. */
export const THREADS_TEXT_MAX = 500;

/** One topic tag — Threads files the post under it. */
const TOPIC = '#IQTest';

export type ThreadsVariant = 'daily' | 'encore';

export function threadsLink(siteUrl: string, variant: ThreadsVariant): string {
  const campaign = variant === 'daily' ? 'quickiq_threads_daily' : 'quickiq_threads_encore';
  return `${siteUrl}/en?utm_source=threads&utm_medium=social&utm_campaign=${campaign}`;
}

/** Options that only point at a figure ("Shape A") add nothing in text. */
function optionLines(plan: IgPostPlan): string[] {
  const opts = plan.card.options;
  if (opts.length === 0) return [];
  if (opts.every((o) => /^shape\s+[a-z]$/i.test(o.text.trim()))) return [];
  return opts.map((o) => `${o.id}. ${o.text}`);
}

export function threadsPostText(
  plan: IgPostPlan,
  siteUrl: string,
  variant: ThreadsVariant,
): string {
  const hook = (plan.hook ?? plan.card.badge ?? '').trim();
  const prompt = (plan.prompt ?? plan.card.prompt).trim();
  // The daily post promises what the cron delivers: tomorrow's run
  // reveals the answer under the Instagram post. An encore re-runs an old
  // puzzle, so it promises nothing.
  const ask =
    variant === 'daily'
      ? 'Reply with your letter before you peek 👇'
      : 'Reply with your letter 👇 No googling.';
  const promo = `Free 30-question IQ test · no sign-up · 7 min → ${threadsLink(siteUrl, variant)}`;

  const build = (body: string[]): string =>
    [hook, '', ...body, '', ask, '', promo, TOPIC]
      .join('\n')
      .replace(/^\n+/, '');

  const full = build([prompt, ...(optionLines(plan).length ? ['', ...optionLines(plan)] : [])]);
  if (full.length <= THREADS_TEXT_MAX) return full;

  // Too long: the video/card shows the options, so they go first.
  const noOptions = build([prompt]);
  if (noOptions.length <= THREADS_TEXT_MAX) return noOptions;

  // Still too long: trim the prompt, never the link.
  const room = THREADS_TEXT_MAX - build(['']).length - 1;
  return build([`${prompt.slice(0, Math.max(0, room)).trimEnd()}…`]);
}
