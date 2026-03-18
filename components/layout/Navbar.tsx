"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  // Extract current locale from pathname (/en/..., /fr/..., /ar/...)
  const segments = pathname.split("/");
  const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : "en") as Locale;

  // Build locale-prefixed href
  const localePath = (path: string) => `/${currentLocale}${path}`;

  const navLinks = [
    { href: localePath(""),              label: t("home") },
    { href: localePath("/discover-bardo"), label: t("discover") },
    { href: localePath("/our-projects"),   label: t("projects") },
    { href: localePath("/tunisian-lifestyle"), label: t("lifestyle") },
    { href: localePath("/faq"),            label: t("faq") },
  ];

  const isActive = (href: string) => {
    const base = `/${currentLocale}`;
    if (href === base || href === `${base}/`) return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  };

  const openPicker = useCallback(() => {
    window.dispatchEvent(new Event("open-language-picker"));
    setMenuOpen(false);
  }, []);

  return (
    <header className="fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100" style={{ top: "var(--promo-h)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href={localePath("")}
            className="flex items-center gap-2 focus-ring rounded-md"
            aria-label={t("logoLabel")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/aiesec-human-blue.svg" alt="" aria-hidden="true" className="h-9 w-auto" />
            <span className="text-gray-900 font-semibold text-sm tracking-tight">in Bardo</span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label={t("mainNav")} className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors duration-150 focus-ring rounded-md px-3 py-1.5",
                  isActive(link.href)
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-900"
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}

            {/* Language switcher */}
            <button
              type="button"
              onClick={openPicker}
              aria-label={t("changeLanguageLabel")}
              title={t("changeLanguage")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors focus-ring rounded-md px-3 py-1.5 ml-1"
            >
              <Globe size={14} aria-hidden="true" />
              <span className="uppercase text-xs font-semibold tracking-wide">{currentLocale}</span>
            </button>

            <Link
              href={localePath("/our-projects")}
              className="ml-3 px-4 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
            >
              {t("applyNow")}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus-ring"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label={t("mobileNav")}
          className="md:hidden border-t border-gray-100 bg-white"
        >
          <ul className="flex flex-col px-4 py-3 gap-0.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block py-2.5 text-sm transition-colors focus-ring rounded-md px-2",
                    isActive(link.href)
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* Language options in mobile */}
            <li className="pt-3 border-t border-gray-100 mt-2">
              <div className="flex gap-2 py-1">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}${pathname.substring(currentLocale.length + 1)}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex-1 text-center py-1.5 rounded-lg text-xs font-semibold border transition-colors focus-ring",
                      loc === currentLocale
                        ? "bg-accent text-white border-accent"
                        : "text-gray-500 border-gray-200 hover:text-gray-900"
                    )}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </li>
            <li className="pt-2 pb-1">
              <Link
                href={localePath("/our-projects")}
                onClick={() => setMenuOpen(false)}
                className="block text-center px-4 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
              >
                {t("applyNow")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
