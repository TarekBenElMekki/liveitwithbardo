import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

/**
 * Unified middleware — Edge Runtime safe (no CJS / Node.js-only deps).
 *
 * Order of operations:
 *  1. Admin + login route guard
 *     - production  → 404 for /admin/*, /api/admin/*, /login, /api/auth/*
 *     - staging     → /admin/* requires valid session cookie; redirect to /login if missing
 *  2. Static / API pass-through
 *  3. Locale routing — redirect bare paths to /<defaultLocale>/...
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COOKIE_NAME = "admin_session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isProduction(): boolean {
  return process.env.APP_ENV === "production" || process.env.APP_ENV === undefined;
}

function isStaging(): boolean {
  return process.env.APP_ENV === "staging";
}

/**
 * Lightweight cookie verification in the Edge Runtime.
 *
 * We re-implement the HMAC check here because lib/session.ts uses Buffer
 * which is not available in the Edge Runtime. The logic is identical.
 */
async function isSessionValid(cookieValue: string): Promise<boolean> {
  const dot = cookieValue.lastIndexOf(".");
  if (dot === -1) return false;

  const payloadB64 = cookieValue.slice(0, dot);
  const sigB64 = cookieValue.slice(dot + 1);

  const secret = process.env.SESSION_SECRET ?? "dev-secret-change-me";
  const enc = new TextEncoder();

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret).buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch {
    return false;
  }

  // Decode base64url → ArrayBuffer
  function fromB64url(str: string): ArrayBuffer {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer as ArrayBuffer;
  }

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sigB64),
      enc.encode(payloadB64).buffer as ArrayBuffer
    );
  } catch {
    return false;
  }

  if (!valid) return false;

  // Decode payload and check expiry
  try {
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as { exp: number };
    return Math.floor(Date.now() / 1000) < payload.exp;
  } catch {
    return false;
  }
}

function getLocaleFromPathname(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

/**
 * Production page route allowlist.
 *
 * Returns true if the given pathname is allowed in production.
 * Only localized home, /our-projects, and /our-projects/[slug] are permitted.
 * Static assets, API routes, and Next internals are handled before this check.
 */
function isAllowedInProduction(pathname: string): boolean {
  // Root redirect is always allowed
  if (pathname === "/") return true;

  for (const locale of locales) {
    // /${locale}  or  /${locale}/
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return true;
    // /${locale}/our-projects  (exact)
    if (pathname === `/${locale}/our-projects` || pathname === `/${locale}/our-projects/`) return true;
    // /${locale}/our-projects/[slug]  (one level deep only)
    if (pathname.startsWith(`/${locale}/our-projects/`)) {
      const rest = pathname.slice(`/${locale}/our-projects/`.length);
      // Allow single slug segment — no further nesting
      if (rest.length > 0 && !rest.includes("/")) return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Route guards ────────────────────────────────────────────────────────

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/api/auth");

  if (isProduction()) {
    // Production: admin, login, and auth API routes must not exist
    if (isAdminRoute || isAuthRoute) {
      return new NextResponse(null, { status: 404 });
    }
  } else if (isStaging()) {
    // Staging: admin routes require a valid session
    if (isAdminRoute) {
      const cookieValue = request.cookies.get(COOKIE_NAME)?.value ?? "";
      const valid = cookieValue ? await isSessionValid(cookieValue) : false;

      if (!valid) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(loginUrl);
      }
    }
    // /login and /api/auth/* are allowed through in staging
  }

  // ── 1b. Production page route allowlist ───────────────────────────────────────
  // Only runs for page routes (not API, not static). API/static pass-through is
  // handled in step 2, but we need to gate page routes before locale routing.
  if (isProduction()) {
    // Skip allowlist check for Next/Vercel internals, API routes, and static files
    const isInternal =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/_vercel") ||
      pathname.startsWith("/api/") ||
      /\.[^/]+$/.test(pathname);

    if (!isInternal && !isAllowedInProduction(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── 2. Pass through Next.js internals, Vercel internals, API routes, static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api/") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 3. Locale routing ──────────────────────────────────────────────────────

  // /login and /admin are not locale-prefixed — pass them through directly
  if (pathname.startsWith("/login") || pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    const response = NextResponse.next();
    response.headers.set("x-next-intl-locale", locale);
    return response;
  }

  // No locale prefix → redirect to default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next (Next.js internals)
     * - _vercel (Vercel internals)
     * - files with extensions (static assets)
     * Note: /api/* is included so the admin API guard runs on it.
     */
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
