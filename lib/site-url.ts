/**
 * Resolve the canonical absolute site origin (no trailing slash) for
 * absolute-URL contexts that can't read the request host: sitemap.xml,
 * robots.txt, JSON-LD.
 *
 * Fallback order, most-specific first:
 *   1. NEXT_PUBLIC_APP_URL        — explicit operator override (custom domain)
 *   2. VERCEL_BRANCH_URL          — stable git-branch alias
 *                                   (…-git-<branch>-<team>.vercel.app). This
 *                                   matches the URL registered as the Google
 *                                   Search Console property, so sitemap URLs
 *                                   line up and GSC can read them.
 *   3. VERCEL_PROJECT_PRODUCTION_URL — the project's production domain
 *   4. VERCEL_URL                 — per-deployment URL (changes every deploy)
 *   5. http://localhost:3000      — local dev
 *
 * Without this, an unset NEXT_PUBLIC_APP_URL made the sitemap emit
 * http://localhost:3000/... URLs, which Google rejects with
 * "Couldn't read sitemap" (the URLs aren't on the property's domain).
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelHost =
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
}
