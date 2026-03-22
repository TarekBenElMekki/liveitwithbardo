"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export function CtaSection() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : "en") as Locale;

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-accent"
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-5">
          AIESEC in Bardo
        </p>

        <h2
          id="cta-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl"
        >
          Live your experience with Bardo
        </h2>

        <p className="text-lg text-white/75 max-w-xl mb-10 leading-relaxed">
          Join thousands of young people who have transformed their lives through
          cultural exchange in Tunisia. Your story starts here.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-3">
          <Link
            href={`/${currentLocale}/our-projects`}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-accent font-semibold text-sm hover:bg-gray-100 transition-colors duration-150 focus-ring shadow-sm"
          >
            Apply for an Exchange
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Trusted by 1,000+ exchange participants across 50+ countries.
        </p>
      </div>
    </section>
  );
}
