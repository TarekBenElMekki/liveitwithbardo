import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

/**
 * Minimal locale middleware — Edge Runtime safe.
 *
 * next-intl/middleware pulls in `negotiator` (CommonJS) which crashes
 * on Vercel's Edge Runtime. This hand-rolled replacement does the same
 * job without any CJS dependencies:
 *
 *  1. Skip API routes, Next.js internals, and static files.
 *  2. If the path already starts with a supported locale prefix → pass through,
 *     injecting the x-next-intl-locale header so next-intl server APIs work.
 *  3. Otherwise redirect to /<defaultLocale><path>.
 */

function getLocaleFromPathname(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Pass through Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api/") ||
    // files with extensions (images, fonts, etc.)
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Already has a valid locale prefix → inject header and continue
  const locale = getLocaleFromPathname(pathname);
  if (locale) {
    const response = NextResponse.next();
    response.headers.set("x-next-intl-locale", locale);
    return response;
  }

  // 3. No locale prefix → redirect to default locale
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
     * - api/* (API routes)
     * - files with extensions (static assets)
     */
    "/((?!_next|_vercel|api(?:/.*)?|.*\\..*).*)",
  ],
};
