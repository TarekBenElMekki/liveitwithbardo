"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/aiesec-human-blue.svg" alt="" aria-hidden="true" className="h-9 w-auto" />
              <span className="text-gray-900 font-semibold text-sm tracking-tight">in Bardo</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{t("tagline")}</p>
          </div>

          {/* Links */}
          <nav aria-label={t("footerNav")} className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Connect</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <li>
                <a
                  href="https://aiesec.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors duration-150 focus-ring rounded-md"
                >
                  {t("aiesecGlobal")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/volunteer_in_tunisia?igsh=YnVhYjdmb2tvNTB4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors duration-150 focus-ring rounded-md"
                >
                  {t("instagram")}
                </a>
              </li>
              <li>
                <a
                  href="https://docs.google.com/spreadsheets/d/1huQip4OHIxar4HCKTmvKiW0h_mFUUdm7Y38jDq8CCRQ/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors duration-150 focus-ring rounded-md"
                >
                  {t("contact")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {year} {t("copyright")}
          </p>
          <p className="text-xs text-gray-300">AIESEC in Bardo · Le Bardo, Tunisia</p>
        </div>
      </div>
    </footer>
  );
}
