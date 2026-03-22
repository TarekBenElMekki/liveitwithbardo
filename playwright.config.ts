import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration.
 *
 * Two named projects: "production" and "staging".
 * Select with --project flag:
 *
 *   npx playwright test --project=production
 *   npx playwright test --project=staging
 *
 * Required env vars (set in shell before running):
 *
 *   PLAYWRIGHT_BASE_URL          base URL of the running server
 *   APP_ENV                      "production" | "staging"
 *   PLAYWRIGHT_STAGING_USERNAME  must match STAGING_LOGIN_USERNAME in .env.staging
 *   PLAYWRIGHT_STAGING_PASSWORD  must match STAGING_LOGIN_PASSWORD in .env.staging
 */

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,          // run sequentially — auth state must be isolated
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,                    // single worker prevents cookie state collisions
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // Do not share browser state between tests
    storageState: undefined,
  },

  projects: [
    {
      name: "production",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "staging",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
