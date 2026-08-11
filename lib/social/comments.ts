/**
 * First-party seed comments.
 *
 * A brand-new account's posts sit at 0 comments. An empty comment
 * section is itself a reach penalty — it reads as "nobody engages here"
 * to both a scrolling viewer and Instagram's ranking, and it removes the
 * social proof that gets a REAL viewer to type a reply. The fix used by
 * essentially every new brand account: the account itself seeds 1-2
 * comments the moment it publishes, openly (never impersonating a
 * follower), nudging the exact behavior we want from real viewers.
 *
 * Never leaks an answer — these are pure engagement/CTA lines, generic
 * enough to fit any bait/shape/question post.
 */

/** First comment: a direct call to action. */
const CTA_COMMENTS = [
  'Comment your answer before you scroll — no cheating 👇',
  "Drop your answer below, curious who gets this one 👀",
  'Bet you can’t solve this in under 10 seconds ⏱️',
  'Tag someone who thinks they’re smart 😏',
  'Save this one and test your friends later',
  'Full 30-question IQ test is free — link in bio if this hooked you',
  'Comment A, B, C or D — let’s see the split',
  'No skipping — comment your answer first, then scroll for more',
];

/** Second comment: reaction/social-proof flavor, still visibly us. */
const REACTION_COMMENTS = [
  'Not gonna lie, this one got us too 😅',
  'The comments are about to be all over the place for this one',
  'This is one of our favorites so far',
  'If you got this instantly… okay, show-off 🏆',
  'Half our team missed this one first try',
  'This is exactly the kind of question that separates the top 10%',
  'Screenshot this and see who in your group chat gets it',
  'Some of these look easy and are absolutely not',
];

/**
 * Deterministic pair for a given post — same (day, slot) always yields
 * the same two comments, so a retried publish never double-posts a
 * DIFFERENT pair (idempotency matches the rest of the pipeline).
 */
export function pickComments(dayIndex: number, slot: number): [string, string] {
  const ordinal = dayIndex * 3 + slot;
  const cta = CTA_COMMENTS[ordinal % CTA_COMMENTS.length];
  // Offset so the two lines don't cycle in lockstep against each other.
  const reaction = REACTION_COMMENTS[(ordinal + 3) % REACTION_COMMENTS.length];
  return [cta, reaction];
}
