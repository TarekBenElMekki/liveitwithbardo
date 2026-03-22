import { test, expect } from "@playwright/test";

/**
 * Dual-environment validation tests.
 *
 * These tests validate that environment-gated features behave correctly.
 * Run against a locally running server: `npx playwright test`
 *
 * Set BASE_URL env var to point at staging/production as needed.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? process.env.BASE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Admin route protection
// ---------------------------------------------------------------------------

test.describe("Admin route protection", () => {
  test("GET /admin returns 404 when ENABLE_ADMIN is not true", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin`);
    // Middleware returns 404 when admin is disabled
    expect([404, 307, 308]).toContain(res.status());
  });

  test("GET /api/admin/layout returns 404 when ENABLE_ADMIN is not true", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/admin/layout`);
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Currency API — rate limiting
// ---------------------------------------------------------------------------

test.describe("Currency API rate limiting", () => {
  test("GET /api/currency returns 200 for a normal request", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/currency?from=EUR&to=TND&amount=100`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("result");
    expect(body).toHaveProperty("from", "EUR");
    expect(body).toHaveProperty("to", "TND");
  });

  test("GET /api/currency returns 400 for invalid amount", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/currency?from=EUR&to=TND&amount=abc`);
    expect(res.status()).toBe(400);
  });

  test("GET /api/currency returns 400 for unsupported currency", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/currency?from=XYZ&to=TND&amount=10`);
    expect(res.status()).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Route visibility — production allowlist
// ---------------------------------------------------------------------------

test.describe("production: route allowlist", () => {
  test.skip(
    process.env.APP_ENV !== "production",
    "Only runs against a production server (APP_ENV=production)"
  );

  test("GET /en returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en`);
    expect(res.status()).toBe(200);
  });

  test("GET /fr returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/fr`);
    expect(res.status()).toBe(200);
  });

  test("GET /ar returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/ar`);
    expect(res.status()).toBe(200);
  });

  test("GET /en/our-projects returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/our-projects`);
    expect(res.status()).toBe(200);
  });

  test("GET /en/our-projects/some-slug returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/our-projects/test-project`);
    // Slug page is allowed by the production allowlist; may be 200 or 404 if slug doesn't exist
    expect([200, 404]).toContain(res.status());
  });

  test("GET /en/discover-bardo returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/discover-bardo`);
    expect(res.status()).toBe(404);
  });

  test("GET /en/tunisian-lifestyle returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/tunisian-lifestyle`);
    expect(res.status()).toBe(404);
  });

  test("GET /en/faq returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/faq`);
    expect(res.status()).toBe(404);
  });

  test("GET /login returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/login`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });

  test("GET /admin/editor/hero returns 404", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin/editor/hero`, { maxRedirects: 0 });
    expect(res.status()).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// Route visibility — staging (all pages accessible)
// ---------------------------------------------------------------------------

test.describe("staging: all pages accessible", () => {
  test.skip(
    process.env.APP_ENV !== "staging",
    "Only runs against a staging server (APP_ENV=staging)"
  );

  test("GET /en/discover-bardo returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/discover-bardo`);
    expect(res.status()).toBe(200);
  });

  test("GET /en/tunisian-lifestyle returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/tunisian-lifestyle`);
    expect(res.status()).toBe(200);
  });

  test("GET /en/faq returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en/faq`);
    expect(res.status()).toBe(200);
  });

  test("GET /admin/editor/hero redirects to login when unauthenticated", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/admin/editor/hero`, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain("/login");
  });
});

// ---------------------------------------------------------------------------
// Locale routing
// ---------------------------------------------------------------------------

test.describe("Locale routing", () => {
  test("GET / redirects to /en", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/`, { maxRedirects: 0 });
    expect([301, 302, 307, 308]).toContain(res.status());
    const location = res.headers()["location"] ?? "";
    expect(location).toMatch(/\/en/);
  });

  test("GET /en returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/en`);
    expect(res.status()).toBe(200);
  });

  test("GET /fr returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/fr`);
    expect(res.status()).toBe(200);
  });

  test("GET /ar returns 200", async ({ request }) => {
    const res = await request.get(`${BASE_URL}/ar`);
    expect(res.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// UI — PromoBar visibility
// ---------------------------------------------------------------------------

test.describe("PromoBar UI", () => {
  test("PromoBar is present when NEXT_PUBLIC_SHOW_PROMO_BAR is true", async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const showPromo = process.env.NEXT_PUBLIC_SHOW_PROMO_BAR !== "false";
    if (showPromo) {
      await expect(page.getByRole("banner", { name: "Promotional announcement" })).toBeVisible();
    } else {
      await expect(page.getByRole("banner", { name: "Promotional announcement" })).not.toBeAttached();
    }
  });
});
