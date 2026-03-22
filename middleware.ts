import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

/**
 * Unified middleware — Edge Runtime safe.
 *
 * Order of operations:
 *  1. Admin route guard
 *     - production  → 404 for /admin/*, /api/admin/*, /login, /api/auth/*
 *     - staging/dev → /admin/* and /api/admin/* pass through directly (no auth)
 *  2. Production page route allowlist
 *  3. Static / API pass-through
 *  4. Locale routing — redirect bare paths to /<defaultLocale>/...
 */

function isProduction(): boolean {
  return process.env.APP_ENV === "production" || process.env.APP_ENV === undefined;
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
 * Only localized home, /our-projects, and /our-projects/[slug] are permitted.
 */
function isAllowedInProduction(pathname: string): boolean {
  if (pathname === "/") return true;

  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return true;
    if (pathname === `/${locale}/our-projects` || pathname === `/${locale}/our-projects/`) return true;
    if (pathname.startsWith(`/${locale}/our-projects/`)) {
      const rest = pathname.slice(`/${locale}/our-projects/`.length);
      if (rest.length > 0 && !rest.includes("/")) return true;
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin route guard ───────────────────────────────────────────────────

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/api/auth");

  if (isProduction()) {
    // Production: block all admin, login, and auth routes
    if (isAdminRoute || isAuthRoute) {
      return new NextResponse(null, { status: 404 });
    }
  }
  // Staging/dev: admin routes pass through directly — no auth required

  // ── 2. Production page route allowlist ────────────────────────────────────

  if (isProduction()) {
    const isInternal =
      pathname.startsWith("/_next") ||
      pathname.startsWith("/_vercel") ||
      pathname.startsWith("/api/") ||
      /\.[^/]+$/.test(pathname);

    if (!isInternal && !isAllowedInProduction(pathname)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── 3. Pass through Next.js internals, API routes, static files ───────────

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api/") ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ── 4. Locale routing ──────────────────────────────────────────────────────

  // /admin is not locale-prefixed — pass through directly
  if (pathname.startsWith("/admin")) {
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
  matcher: ["/((?!_next|_vercel|.*\\..*).*)" ],
};
