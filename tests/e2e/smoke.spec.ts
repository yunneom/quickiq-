import { test, expect } from '@playwright/test';

const TOTAL_QUESTIONS = 30;
const BYPASS_HEADERS = { 'x-test-bypass-rate-limit': '1' };

// Apply the bypass header to every request the page (and API) makes, so
// the rate limiter (PRD §3.3) doesn't fail this suite when re-run quickly.
test.use({ extraHTTPHeaders: BYPASS_HEADERS });

/**
 * End-to-end happy path: landing → 30 questions → result page.
 *
 * Picks option A on every question so the result is deterministic
 * (low overall score) — what we verify is *flow*, not score accuracy.
 * Score correctness is covered by unit-test-style API calls in the
 * second test below.
 */
test('full flow: landing → 30 questions → result page', async ({ page }) => {
  // Go directly to /ko — next-intl middleware otherwise picks the locale
  // from the browser's Accept-Language header (Chromium defaults to en-US).
  await page.goto('/ko');
  await expect(page).toHaveURL(/\/ko$/);

  // Landing CTA
  const cta = page.getByTestId('cta-start');
  await expect(cta).toBeVisible();
  await cta.click();

  await expect(page).toHaveURL(/\/ko\/test$/);

  // Loop through every question — pick A, the runner auto-advances after
  // ~350ms. Wait for the option to be enabled before clicking to avoid
  // racing the auto-advance.
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const optionA = page.getByTestId('option-A');
    await optionA.waitFor({ state: 'visible', timeout: 10_000 });
    await expect(optionA).toBeEnabled();
    await optionA.click();
    // Small delay to let the auto-advance kick in before we look for the
    // next question's option.
    await page.waitForTimeout(450);
  }

  // We should now be on the result page with a session id in the URL.
  await expect(page).toHaveURL(/\/ko\/result\/[0-9a-f-]{36}$/, { timeout: 10_000 });

  // Hero must show a top-percentile readout (e.g. "상위 50.0%").
  const percentile = page.getByTestId('result-percentile');
  await expect(percentile).toBeVisible();
  await expect(percentile).toHaveText(/상위\s*\d+(\.\d+)?%/);
});

/**
 * API-only correctness check: when the user answers every question correctly,
 * the scoring math from PRD §2.3 holds — 24/30 ≈ IQ 115 / top ~16%.
 * Here we answer 30/30 → IQ 125 / top ~5%.
 */
test('API: scoring math matches PRD §2.3', async ({ request }) => {
  const start = await request.post('/api/test/start', {
    data: { locale: 'ko' },
    headers: BYPASS_HEADERS,
  });
  expect(start.ok()).toBeTruthy();
  const startBody = (await start.json()) as {
    sessionId: string;
    questions: { id: string; correct_id: string }[];
  };

  const answers = startBody.questions.map((q) => ({
    question_id: q.id,
    selected_id: q.correct_id,
    time_ms: 5000,
  }));

  const submit = await request.post('/api/test/submit', {
    data: { sessionId: startBody.sessionId, answers },
  });
  expect(submit.ok()).toBeTruthy();
  const submitBody = (await submit.json()) as {
    result: {
      rawScore: number;
      estimatedIq: number;
      topPercentile: number;
      categoryScores: Record<string, number>;
    };
  };

  expect(submitBody.result.rawScore).toBe(30);
  expect(submitBody.result.estimatedIq).toBe(125);
  // top percentile should be in the high-IQ range (< 10%)
  expect(submitBody.result.topPercentile).toBeLessThan(10);
  // every category at 100%
  for (const v of Object.values(submitBody.result.categoryScores)) {
    expect(v).toBe(100);
  }
});

/**
 * Mock checkout path: after payment, the result page unlocks (no blur,
 * no paywall CTA).
 */
test('mock checkout unlocks the result page', async ({ request, page }) => {
  // Create a completed session via the API
  const start = await (
    await request.post('/api/test/start', {
      data: { locale: 'ko' },
      headers: BYPASS_HEADERS,
    })
  ).json();
  const answers = start.questions.map(
    (q: { id: string; correct_id: string }, i: number) => ({
      question_id: q.id,
      selected_id: i < 24 ? q.correct_id : 'A',
      time_ms: 5000,
    }),
  );
  await request.post('/api/test/submit', {
    data: { sessionId: start.sessionId, answers },
  });

  // Trigger mock checkout
  await request.get(
    `/api/checkout/mock?sessionId=${start.sessionId}&email=qa@example.com`,
    { maxRedirects: 0 },
  );

  // Visit result — should be unlocked
  await page.goto(`/ko/result/${start.sessionId}`);
  await expect(page.getByTestId('result-percentile')).toBeVisible();

  // Paid state: no purchase CTA should be present
  await expect(page.getByRole('link', { name: /9,900원/ })).toHaveCount(0);
});
