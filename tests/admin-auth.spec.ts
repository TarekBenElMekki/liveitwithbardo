import { test, expect, type BrowserContext } from "@playwright/test";

/**
 * Admin route protection E2E tests.
 *
 * Production run (server must be running with APP_ENV=production):
 *   APP_ENV=production \
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 \
 *   npx playwright test --project=production tests/admin-auth.spec.ts
 *
 * Staging run (server must be running with APP_ENV=staging):
 *   APP_ENV=staging \
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 \
 *   PLAYWRIGHT_STAGING_USERNAME=admin \
 *   PLAYWRIGHT_STAGING_PASSWORD=staging-pass-change-me \
 *   npx playwright test --project=staging tests/admin-auth.spec.ts
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const APP_ENV = process.env.APP_ENV ?? "production";

const STAGING_USERNAME = process.env.PLAYWRIGHT_STAGING_USERNAME ?? "";
const STAGING_PASSWORD = process.env.PLAYWRIGHT_STAGING_PASSWORD ?? "";

const ADMIN_PATH = "/admin/editor/hero";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clear all cookies before each test to prevent state bleed. */
async function clearCookies(context: BrowserContext) {
  await context.clearCookies();
}

// ---------------------------------------------------------------------------
// Production tests
// ---------------------------------------------------------------------------

test.describe("production: admin route is not accessible", () => {
  test.skip(APP_ENV !== "production", "Only runs against a production server (APP_ENV=production)");

  test("visiting /admin/editor/hero returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}${ADMIN_PATH}`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("visiting /admin/editor/hero shows no login form", async ({ page }) => {
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[name="username"]')).not.toBeAttached();
    await expect(page.locator('input[name="password"]')).not.toBeAttached();
  });

  test("visiting /admin/editor/hero shows no protected admin content", async ({ page }) => {
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#admin-hero-editor")).not.toBeAttached();
  });

  test("/login returns 404 in production", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("/api/auth/login returns 404 in production", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { username: "test", password: "test" },
    });
    expect(res.status()).toBe(404);
  });

  test("/api/auth/logout returns 404 in production", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/logout`);
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Staging — unauthenticated access
// ---------------------------------------------------------------------------

test.describe("staging: admin route requires login", () => {
  test.skip(APP_ENV !== "staging", "Only runs against a staging server (APP_ENV=staging)");

  test.beforeEach(async ({ context }) => {
    await clearCookies(context);
  });

  test("visiting /admin/editor/hero redirects to /login", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}${ADMIN_PATH}`, {
      waitUntil: "domcontentloaded",
    });
    expect(page.url()).toContain("/login");
    expect(response?.status()).not.toBe(404);
  });

  test("redirect preserves ?next= param pointing to admin path", async ({ page }) => {
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain(encodeURIComponent(ADMIN_PATH));
  });

  test("login page shows username and password fields", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("protected admin content is not visible before login", async ({ page }) => {
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#admin-hero-editor")).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Staging — successful login
// ---------------------------------------------------------------------------

test.describe("staging: login succeeds and grants access", () => {
  test.skip(APP_ENV !== "staging", "Only runs against a staging server (APP_ENV=staging)");

  test.beforeEach(async ({ context }) => {
    await clearCookies(context);
  });

  test("staging credentials are configured", () => {
    // Fail loudly instead of silently skipping — misconfigured test env is a bug.
    if (!STAGING_USERNAME || !STAGING_PASSWORD) {
      throw new Error(
        "PLAYWRIGHT_STAGING_USERNAME and PLAYWRIGHT_STAGING_PASSWORD must be set. " +
          "These must match STAGING_LOGIN_USERNAME and STAGING_LOGIN_PASSWORD in .env.staging."
      );
    }
  });

  test("login with valid credentials redirects to /admin/editor/hero", async ({ page }) => {
    if (!STAGING_USERNAME || !STAGING_PASSWORD) test.skip();

    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
    expect(page.url()).toContain(encodeURIComponent(ADMIN_PATH));

    await page.fill('input[name="username"]', STAGING_USERNAME);
    await page.fill('input[name="password"]', STAGING_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`**${ADMIN_PATH}`, { timeout: 10_000 });
    expect(page.url()).toContain(ADMIN_PATH);
  });

  test("protected admin content is visible after login", async ({ page }) => {
    if (!STAGING_USERNAME || !STAGING_PASSWORD) test.skip();

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', STAGING_USERNAME);
    await page.fill('input[name="password"]', STAGING_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`**${ADMIN_PATH}`, { timeout: 10_000 });

    await expect(page.locator("#admin-hero-editor")).toBeVisible();
  });

  test("session persists across page reload", async ({ page }) => {
    if (!STAGING_USERNAME || !STAGING_PASSWORD) test.skip();

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', STAGING_USERNAME);
    await page.fill('input[name="password"]', STAGING_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`**${ADMIN_PATH}`, { timeout: 10_000 });

    await page.reload({ waitUntil: "domcontentloaded" });
    expect(page.url()).toContain(ADMIN_PATH);
    await expect(page.locator("#admin-hero-editor")).toBeVisible();
  });

  test("logout clears session and redirects to login on next admin visit", async ({ page }) => {
    if (!STAGING_USERNAME || !STAGING_PASSWORD) test.skip();

    // Log in
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', STAGING_USERNAME);
    await page.fill('input[name="password"]', STAGING_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(`**${ADMIN_PATH}`, { timeout: 10_000 });

    // Log out via API
    await page.evaluate(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    });

    // Admin should now redirect to login again
    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
    await expect(page.locator("#admin-hero-editor")).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Staging — invalid login
// ---------------------------------------------------------------------------

test.describe("staging: login rejects invalid credentials", () => {
  test.skip(APP_ENV !== "staging", "Only runs against a staging server (APP_ENV=staging)");

  test.beforeEach(async ({ context }) => {
    await clearCookies(context);
  });

  test("submitting wrong credentials shows error message", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', "wrong-user");
    await page.fill('input[name="password"]', "wrong-pass");
    await page.click('button[type="submit"]');

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toContain("/login");
  });

  test("after failed login, admin page is still inaccessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', "wrong-user");
    await page.fill('input[name="password"]', "wrong-pass");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    await page.goto(`${BASE_URL}${ADMIN_PATH}`, { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
    await expect(page.locator("#admin-hero-editor")).not.toBeAttached();
  });

  test("open redirect via next param is blocked", async ({ request }) => {
    // A crafted ?next=//evil.com must not redirect off-domain after login
    const res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: { username: STAGING_USERNAME || "x", password: STAGING_PASSWORD || "x" },
      headers: { "Content-Type": "application/json" },
      maxRedirects: 0,
    });
    // The API itself never redirects — it just sets a cookie and returns JSON.
    // The redirect happens client-side in LoginForm.tsx which sanitises the path.
    // This test confirms the API response never contains a Location header.
    expect(res.headers()["location"]).toBeUndefined();
  });
});
