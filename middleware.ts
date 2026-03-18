import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default intlMiddleware;

export const config = {
  matcher: [
    // Match all paths except:
    // - Next.js internals (_next, _vercel)
    // - Static files (anything with a file extension)
    // - ALL /api/* routes — next-intl must never intercept API route handlers
    "/((?!_next|_vercel|api(?:/.*)?|.*\\..*).*)",
  ],
};
