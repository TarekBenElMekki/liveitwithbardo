"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { hasCompletedOnboarding, saveLocaleAndCountry } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function CountryLanguagePicker() {
  const t = useTranslations("picker");
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  // Detect current locale from pathname (/en/..., /fr/..., /ar/...)
  const currentLocale = (pathname.split("/")[1] as Locale) || "en";

  useEffect(() => {
    setMounted(true);
    if (!hasCompletedOnboarding()) {
      setVisible(true);
    }
  }, []);

  // Reopen handler — triggered via custom event from Navbar
  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener("open-language-picker", handler);
    return () => window.removeEventListener("open-language-picker", handler);
  }, []);

  const handleContinue = () => {
    saveLocaleAndCountry(locale);
    setVisible(false);

    if (locale !== currentLocale) {
      const segments = pathname.split("/");
      segments[1] = locale;
      router.push(segments.join("/") || `/${locale}`);
    }
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-heading"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl p-8 flex flex-col gap-6">
        {/* Icon + heading */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Globe size={28} className="text-accent" aria-hidden="true" />
          </div>
          <h2 id="picker-heading" className="text-xl font-bold text-gray-900">
            {t("heading")}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">{t("subheading")}</p>
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
          className="w-full py-3 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
        >
          {t("continueButton")}
        </button>
      </div>
    </div>
  );
}
