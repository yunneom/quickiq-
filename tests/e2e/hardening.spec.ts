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
  // /about must be in the sitemap so Google indexes the methodology
  // page (added in Round 16). Both locales required.
  expect(sitemapBody).toContain('/ko/about');
  expect(sitemapBody).toContain('/en/about');
  // hreflang alternates: every URL emits xhtml:link rows so search
  // engines serve the right locale to the right user.
  expect(sitemapBody).toContain('xhtml:link');
  expect(sitemapBody).toContain('hreflang="x-default"');

  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.status()).toBe(200);
  const manifestBody = (await manifest.json()) as { name?: string; start_url?: string };
  expect(manifestBody.name).toContain('IQ Test');
  expect(manifestBody.start_url).toContain('/ko');
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

test('/about renders methodology + four-domain sections', async ({ page }) => {
  // The /about route is a static SEO page; we only check structural
  // signals (h1 present, four domain cards visible) rather than exact
  // copy, since the copy may evolve and we'd rather flag broken
  // rendering than every wording tweak.
  await page.goto('/ko/about', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toBeVisible();
  // 4 domain cards == 4 list items inside the categories <ul>.
  const lis = page.locator('article ul li');
  await expect(lis).toHaveCount(4);
});

test('locale switcher swaps between /ko and /en in place', async ({ page }) => {
  // Pre-set cookie consent so the bottom banner doesn't intercept our
  // footer clicks. The banner is a fixed-position overlay that covers
  // the LocaleSwitcher on a phone viewport.
  await page.addInitScript(() => {
    window.localStorage.setItem('iq-cookie-consent', 'accepted');
  });
  // Bump the navigation timeout for this test — next-intl's
  // router.push() goes through a server round-trip that on a cold dev
  // server can take longer than the default 30s. The actual
  // production navigation is sub-second.
  await page.goto('/ko/about', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'English' }).click();
  await page.waitForURL('**/en/about', { timeout: 60_000 });
  expect(page.url()).toContain('/en/about');
  // Round-trip back to KO must work too.
  await page.getByRole('button', { name: '한국어' }).click();
  await page.waitForURL('**/ko/about', { timeout: 60_000 });
  expect(page.url()).toContain('/ko/about');
});

test('faq JSON-LD is emitted on the landing page', async ({ request }) => {
  // FAQ schema lives on the IQ landing (moved to /iq after the hub split);
  // the new hub doesn't carry FAQ.
  const res = await request.get('/ko/iq');
  const html = await res.text();
  // Look for the FAQPage schema marker — exact JSON shape is fragile,
  // but the @type is stable.
  expect(html).toContain('"@type":"FAQPage"');
  expect(html).toContain('"@type":"Question"');
});

test('short-URL redirects an unknown code to the IQ landing', async ({ request }) => {
  // We can't easily mint a real session in this isolated request
  // context, but the *miss* path (no matching session) must redirect
  // to the IQ conversion landing (tagged for attribution) rather than
  // 404 so failed shares still funnel into the test.
  const res = await request.get('/r/deadbeef', { maxRedirects: 0 });
  expect([307, 308]).toContain(res.status());
  expect(res.headers()['location']).toContain('/ko/iq');
  expect(res.headers()['location']).toContain('utm_source=share_miss');
});

test('paid-only endpoints reject unpaid + unknown sessions', async ({ request }) => {
  // /api/test/explanations is the paid 30-question breakdown. The
  // capability check (is_paid=true) is the security boundary that
  // separates the free summary from the paid content. Refactors can't
  // silently widen it — these assertions pin the contract.

  // 1. Missing sessionId → 400
  const noId = await request.get('/api/test/explanations');
  expect(noId.status()).toBe(400);

  // 2. Unknown sessionId → 404
  const unknown = await request.get(
    '/api/test/explanations?sessionId=00000000-0000-0000-0000-000000000000',
  );
  expect(unknown.status()).toBe(404);

  // Same shape for the paid PDF endpoint.
  const pdfNoId = await request.get('/api/test/pdf');
  expect(pdfNoId.status()).toBe(400);
});

test('admin endpoints 404 without a valid token', async ({ request }) => {
  // /api/admin/stats must look invisible (404 not 401) when no token
  // is set — keeps the endpoint from being a beacon for attackers.
  const noToken = await request.get('/api/admin/stats');
  expect(noToken.status()).toBe(404);

  const badToken = await request.get('/api/admin/stats', {
    headers: { 'x-admin-token': 'definitely-not-the-real-one' },
  });
  expect(badToken.status()).toBe(404);

  // Same shape for the per-session endpoint.
  const detail = await request.get('/api/admin/sessions/some-uuid', {
    headers: { 'x-admin-token': 'definitely-not-the-real-one' },
  });
  expect(detail.status()).toBe(404);

  // And the CSV export.
  const csv = await request.get('/api/admin/sessions.csv');
  expect(csv.status()).toBe(404);
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
  // FAQ lives on the IQ landing (moved to /iq after the hub split).
  await page.goto('/ko/iq');
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
