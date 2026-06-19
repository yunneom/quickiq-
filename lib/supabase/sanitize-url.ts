/**
 * Normalize a pasted Supabase project URL into the bare origin that
 * supabase-js expects (e.g. https://abc.supabase.co).
 *
 * Guards against the two most common dashboard copy-paste mistakes:
 *   1. Trailing slash / surrounding whitespace from the clipboard.
 *   2. Pasting the "RESTful endpoint" (…/rest/v1) instead of the
 *      "Project URL". supabase-js then appends its own /rest/v1, yielding
 *      …/rest/v1/rest/v1/<table> which PostgREST rejects with PGRST125
 *      "Invalid path specified in request URL".
 *
 * Idempotent: a already-clean URL passes through unchanged.
 */
export function sanitizeSupabaseUrl(
  raw: string | undefined,
): string | undefined {
  if (!raw) return raw;
  let u = raw.trim().replace(/\/+$/, '');
  // Strip an accidental REST (or auth) suffix, then any slash left behind.
  u = u.replace(/\/(rest|auth)\/v1$/i, '').replace(/\/+$/, '');
  return u;
}
