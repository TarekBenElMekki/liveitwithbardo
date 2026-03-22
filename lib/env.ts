/**
 * Centralized environment configuration helper.
 *
 * Rules:
 * - Server-side vars (no NEXT_PUBLIC_ prefix): only accessible in Server
 *   Components, API routes, and middleware. Never sent to the browser.
 * - Client-safe vars (NEXT_PUBLIC_ prefix): embedded at build time.
 *   Only put values here that are safe to expose publicly.
 *
 * Credentials (STAGING_LOGIN_USERNAME, STAGING_LOGIN_PASSWORD, SESSION_SECRET)
 * are intentionally NOT exported from this file. They are read directly from
 * process.env inside server-only files (app/api/auth/login/route.ts,
 * lib/session.ts, middleware.ts) so they can never leak into a client bundle
 * even if a client component mistakenly imports from lib/env.ts.
 */

// ---------------------------------------------------------------------------
// Server-side flags
// ---------------------------------------------------------------------------

/** True when APP_ENV is explicitly "production" or unset (safe default). */
export const isProduction =
  process.env.APP_ENV === "production" || process.env.APP_ENV === undefined;

/** True when APP_ENV is explicitly "staging". */
export const isStaging = process.env.APP_ENV === "staging";

/**
 * Whether /admin/* routes and /api/admin/* endpoints are enabled.
 * Defaults to false — must be explicitly set to "true".
 */
export const isAdminEnabled = process.env.ENABLE_ADMIN === "true";

// ---------------------------------------------------------------------------
// Client-safe flags (NEXT_PUBLIC_ — embedded at build time)
// ---------------------------------------------------------------------------

/** Canonical app URL — used for metadataBase and absolute URLs. */
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://liveitwithbardo.vercel.app";

/** Whether to render the PromoBar countdown banner. Defaults to true. */
export const showPromoBar = process.env.NEXT_PUBLIC_SHOW_PROMO_BAR !== "false";

/** ISO date string for the PromoBar countdown target. */
export const promoTargetDate =
  process.env.NEXT_PUBLIC_PROMO_TARGET_DATE ?? "2026-05-15T09:00:00Z";

/** Whether the ChatAgent widget is rendered. Defaults to true. */
export const showChatAgent = process.env.NEXT_PUBLIC_SHOW_CHAT_AGENT !== "false";
