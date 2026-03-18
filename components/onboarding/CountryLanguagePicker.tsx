"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe, ChevronDown } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import {
  hasCompletedOnboarding,
  saveLocaleAndCountry,
  getSavedLocale,
  getSavedCountry,
  getDefaultLocaleForCountry,
} from "@/lib/locale";
import { cn } from "@/lib/utils";

// ── Country list ──────────────────────────────────────────────────────────────
// Curated list of countries most likely to use AIESEC exchanges
const COUNTRIES: { code: string; name: string }[] = [
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KE", name: "Kenya" },
  { code: "LB", name: "Lebanon" },
  { code: "LY", name: "Libya" },
  { code: "MA", name: "Morocco" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PK", name: "Pakistan" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function CountryLanguagePicker() {
  const t = useTranslations("picker");
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [country, setCountry] = useState("");
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  // Detect current locale from pathname (/en/..., /fr/..., /ar/...)
  const currentLocale = (pathname.split("/")[1] as Locale) || "en";

  useEffect(() => {
    setMounted(true);
    if (!hasCompletedOnboarding()) {
      setVisible(true);
    }
    // Pre-fill with saved values if reopening
    const savedLocale = getSavedLocale();
    const savedCountry = getSavedCountry();
    if (savedLocale) setLocale(savedLocale);
    if (savedCountry) setCountry(savedCountry);
  }, []);

  // When country changes, suggest a default locale
  const handleCountryChange = useCallback((code: string) => {
    setCountry(code);
    const suggested = getDefaultLocaleForCountry(code);
    setLocale(suggested);
  }, []);

  const handleContinue = useCallback(() => {
    if (!country) return;
    saveLocaleAndCountry(locale, country);
    setVisible(false);

    // Redirect to the chosen locale if different from current
    if (locale !== currentLocale) {
      // Replace the locale segment in the current path
      const segments = pathname.split("/");
      segments[1] = locale;
      router.push(segments.join("/") || `/${locale}`);
    }
  }, [country, locale, currentLocale, pathname, router]);

  // Reopen handler — exposed via a button in the Navbar
  // We use a custom event so Navbar can trigger it without prop drilling
  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("open-language-picker", handler);
    return () => window.removeEventListener("open-language-picker", handler);
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl p-8 flex flex-col gap-6">
        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Globe size={28} className="text-accent" aria-hidden="true" />
          </div>
          <h2 id="picker-heading" className="text-xl font-bold text-gray-900">
            {t("heading")}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        {/* Country select */}
        <div className="flex flex-col gap-2">
          <label htmlFor="picker-country" className="text-sm font-medium text-gray-700">
            {t("countryLabel")}
          </label>
          <div className="relative">
            <select
              id="picker-country"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full appearance-none bg-[var(--section-alt)] border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-10 focus-ring focus:outline-none"
            >
              <option value="" disabled>{t("countryPlaceholder")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Language select */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">{t("languageLabel")}</span>
          <div className="flex gap-2">
            {locales.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                aria-pressed={locale === loc}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors duration-150 focus-ring",
                  locale === loc
                    ? "bg-accent text-white border-accent"
                    : "bg-transparent text-gray-500 border-gray-200 hover:border-accent/50 hover:text-accent"
                )}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!country}
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-150 focus-ring",
            country
              ? "bg-accent text-white hover:bg-[var(--accent-dark)]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {t("continueButton")}
        </button>
      </div>
    </div>
  );
}
