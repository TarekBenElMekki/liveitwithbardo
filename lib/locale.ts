/**
 * Locale and country persistence helpers.
 *
 * Storage:
 *   localStorage["bardo_locale"]  — chosen locale ("en" | "fr" | "ar")
 *   localStorage["bardo_country"] — chosen country code ("DE", "FR", etc.)
 *   cookie "NEXT_LOCALE"          — read by next-intl middleware for server-side routing
 *
 * The picker is shown when neither key exists in localStorage.
 * To reset (simulate first visit): clear both localStorage keys.
 */

import { locales, defaultLocale, type Locale } from "@/i18n/config";

const LOCALE_KEY = "bardo_locale";
const COUNTRY_KEY = "bardo_country";
const COOKIE_NAME = "NEXT_LOCALE";

export function getSavedLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(LOCALE_KEY);
  if (v && locales.includes(v as Locale)) return v as Locale;
  return null;
}

export function getSavedCountry(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(COUNTRY_KEY);
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(LOCALE_KEY);
}

export function saveLocaleAndCountry(locale: Locale, country?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, locale);
  if (country) localStorage.setItem(COUNTRY_KEY, country);
  // Set cookie so middleware uses the chosen locale on next request
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

export function clearOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCALE_KEY);
  localStorage.removeItem(COUNTRY_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getDefaultLocaleForCountry(countryCode: string): Locale {
  // French-speaking countries default to French
  const frenchCountries = ["FR", "BE", "CH", "LU", "MC", "SN", "CI", "ML", "BF", "NE", "TG", "BJ", "GN", "CD", "CG", "CM", "GA", "MG", "MU", "DZ", "MA", "TN"];
  // Arabic-speaking countries default to Arabic
  const arabicCountries = ["TN", "DZ", "MA", "EG", "SA", "AE", "JO", "LB", "SY", "IQ", "KW", "QA", "BH", "OM", "YE", "LY", "SD", "MR", "SO", "DJ", "KM"];

  if (arabicCountries.includes(countryCode)) return "ar";
  if (frenchCountries.includes(countryCode)) return "fr";
  return defaultLocale;
}
