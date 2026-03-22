import { test, expect } from "@playwright/test";

/**
 * Admin route access tests.
 *
 * Production (APP_ENV=production): admin routes return 404.
 * Staging/dev (APP_ENV=staging):   admin routes are directly accessible, no login required.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const APP_ENV = process.env.APP_ENV ?? "production";

// ---------------------------------------------------------------------------
// Production — admin routes must be blocked
// ---------------------------------------------------------------------------

test.describe("production: admin routes return 404", () => {
  test.skip(APP_ENV !== "production", "Only runs against a production server (APP_ENV=production)");

  test("/admin/projects-data returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin/projects-data`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("/api/admin/projects-data returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/projects-data`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("/login returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Staging — admin routes directly accessible, no login
// ---------------------------------------------------------------------------

test.describe("staging: admin routes accessible without login", () => {
  test.skip(APP_ENV !== "staging", "Only runs against a staging server (APP_ENV=staging)");

  test("/admin/projects-data returns 200 without any auth", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin/projects-data`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("/api/admin/projects-data returns 200 without any auth", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/projects-data`, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
  });

  test("/login returns 404 in staging (login page removed)", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("/admin/projects-data does NOT redirect to /login", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin/projects-data`, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).not.toContain(res.status());
  });
});
