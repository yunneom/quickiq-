import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke-focused e2e config. One project (mobile chromium) — the app is
 * mobile-first per PRD §3.2; running the same scenario on desktop is
 * unlikely to catch anything mobile doesn't.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'mobile-chromium',
      // Mimic iPhone 13 viewport but stay on Chromium so CI only needs
      // one browser binary. Touch + mobile UA are enough to exercise our
      // mobile-first layout per PRD §3.2.
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
});
