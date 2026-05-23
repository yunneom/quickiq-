import { test, expect } from '@playwright/test';

/**
 * Hardening checks — rate limiting, error pages, SEO endpoints.
 * These run without the bypass header so we actually exercise the gate.
 */

test('rate limit kicks in once the per-IP cap is exceeded', async ({ request }) => {
  // Limit was raised to 60/hour for production headroom (see lib/rate-limit.ts).
  // Hit /api/test/start 61 times with the *same* IP (request fixture reuses
  // the connection); the bypass header is intentionally NOT set here.
  const TOTAL_CALLS = 61;
  let ok = 0;
  let limited = 0;
  for (let i = 0; i < TOTAL_CALLS; i++) {
    const res = await request.post('/api/test/start', {
      data: { locale: 'ko' },
    });
    if (res.status() === 200) ok += 1;
    else if (res.status() === 429) limited += 1;
  }
  expect(ok).toBeGreaterThanOrEqual(60);
  expect(limited).toBeGreaterThanOrEqual(1);
});

test('SEO endpoints respond correctly', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain('Sitemap:');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain('<urlset');
  expect(sitemapBody).toContain('/ko');
  expect(sitemapBody).toContain('/en');

  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.status()).toBe(200);
  const manifestBody = (await manifest.json()) as { name?: string; start_url?: string };
  expect(manifestBody.name).toBe('IQ Test');
  expect(manifestBody.start_url).toBe('/ko');
});

test('og image and icon endpoints return images', async ({ request }) => {
  const og = await request.get('/opengraph-image');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/');

  const icon = await request.get('/icon');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/');
});

test('security headers present on landing page', async ({ request }) => {
  const res = await request.get('/ko');
  const h = res.headers();
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['content-security-policy']).toContain("default-src 'self'");
  expect(h['permissions-policy']).toContain('interest-cohort=()');
});

test('404 page renders for unknown routes inside [locale]', async ({ page }) => {
  // The [locale] not-found.tsx renders for unmatched segments under /ko/*.
  const response = await page.goto('/ko/this-route-does-not-exist', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(404);
  await expect(page.locator('text=404')).toBeVisible();
});
