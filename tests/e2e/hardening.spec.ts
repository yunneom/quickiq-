import { test, expect } from '@playwright/test';

/**
 * Hardening checks — rate limiting, error pages, SEO endpoints.
 * These run without the bypass header so we actually exercise the gate.
 */

const BYPASS_HEADERS = { 'x-test-bypass-rate-limit': '1' };

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

test('health endpoint reports integration status', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const body = (await res.json()) as {
    status: string;
    integrations: Record<string, boolean>;
  };
  expect(body.status).toBe('ok');
  // The keys must exist regardless of whether the env vars are set.
  for (const key of ['supabase', 'lemonSqueezy', 'resend', 'sentry', 'kakao', 'metaPixel']) {
    expect(body.integrations).toHaveProperty(key);
  }
});

test('FAQ section appears and accordions expand', async ({ page }) => {
  await page.goto('/ko');
  const faq = page.getByText('자주 묻는 질문');
  await expect(faq).toBeVisible();
  // First question
  const firstQ = page.getByRole('button', { name: /정말 무료인가요/ });
  await firstQ.click();
  await expect(
    page.getByText(/30문항 응시와 추정 IQ \+ 상위 백분위 확인까지/),
  ).toBeVisible();
});

test('pdf endpoint requires payment', async ({ request }) => {
  // PDF render in dev mode (cold compile + font load) can push past 60s,
  // so give this single test plenty of headroom.
  test.setTimeout(180_000);
  // 1. Create + complete a session (unpaid).
  const start = await (
    await request.post('/api/test/start', {
      data: { locale: 'ko' },
      headers: BYPASS_HEADERS,
    })
  ).json();
  const answers = start.questions.map((q: { id: string; correct_id: string }) => ({
    question_id: q.id,
    selected_id: q.correct_id,
    time_ms: 5000,
  }));
  await request.post('/api/test/submit', {
    data: { sessionId: start.sessionId, answers },
    headers: BYPASS_HEADERS,
  });

  // 2. PDF should 402 when not paid.
  const unpaid = await request.get(
    `/api/test/pdf?sessionId=${start.sessionId}`,
  );
  expect(unpaid.status()).toBe(402);

  // 3. Mock-pay, then PDF should return application/pdf.
  await request.get(
    `/api/checkout/mock?sessionId=${start.sessionId}&email=qa@example.com`,
    { maxRedirects: 0 },
  );
  const paid = await request.get(
    `/api/test/pdf?sessionId=${start.sessionId}`,
  );
  expect(paid.status()).toBe(200);
  expect(paid.headers()['content-type']).toContain('application/pdf');
});
