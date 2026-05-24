/**
 * Lightweight "did you mean…?" suggester for the checkout form. We hit
 * the top free-email providers used by our KO/EN audience plus a few
 * Korean office domains. Anything else is left alone so we don't
 * accidentally rewrite a legitimate niche domain.
 *
 * Algorithm: Levenshtein distance ≤ 2 against the popular-domain list,
 * with two short-circuits — exact match (no suggestion) and obviously
 * malformed input (no @ or no dot in the domain).
 */

const POPULAR_DOMAINS = [
  // Korean
  'naver.com',
  'kakao.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
  // International
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.kr',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
];

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Returns the suggested corrected email when the domain looks like a
 * typo of a popular one, or null when the input is fine / unrecognised.
 * The local part is preserved verbatim — only the domain is rewritten.
 */
export function suggestEmailFix(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (!domain.includes('.')) return null;
  if (POPULAR_DOMAINS.includes(domain)) return null;

  let best: { domain: string; dist: number } | null = null;
  for (const cand of POPULAR_DOMAINS) {
    const d = levenshtein(domain, cand);
    if (d === 0) return null;
    if (d <= 2 && (!best || d < best.dist)) {
      best = { domain: cand, dist: d };
    }
  }
  if (!best) return null;
  return `${local}@${best.domain}`;
}
