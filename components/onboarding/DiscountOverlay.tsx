"use client";

/**
 * DiscountOverlay — clean promotional modal
 *
 * Display logic (homepage only):
 *  - Always shows on every homepage load/reload.
 *  - First-time visitor: waits for "language-chosen" event, then shows after 600ms.
 *  - Returning visitor: shows after 900ms settle delay.
 *  - Dismissed via close button, "Got it", "Explore Now", or backdrop click.
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { hasCompletedOnboarding } from "@/lib/locale";

export function DiscountOverlay() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dismiss = () => setVisible(false);

  useEffect(() => {
    setMounted(true);

    if (!hasCompletedOnboarding()) {
      const onLanguageChosen = () => {
        setTimeout(() => setVisible(true), 600);
      };
      window.addEventListener("language-chosen", onLanguageChosen, { once: true });
      return () => window.removeEventListener("language-chosen", onLanguageChosen);
    } else {
      const timer = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-heading"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Red accent bar */}
        <div className="h-1 w-full bg-[var(--red)]" aria-hidden="true" />

        {/* Close button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close offer"
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-ring"
        >
          <X size={15} aria-hidden="true" />
        </button>

        <div className="px-7 pt-7 pb-7 flex flex-col items-center gap-5 text-center">

          {/* Badge chip */}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--red)] text-white text-[11px] font-black tracking-widest uppercase">
            Exclusive Offer
          </span>

          {/* Hero number */}
          <div className="relative flex items-center justify-center w-full py-1">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl"
              style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(220,38,38,0.10) 0%, transparent 80%)" }}
            />
            <span
              className="relative font-black text-[var(--red)] leading-none tracking-tighter select-none"
              style={{ fontSize: "clamp(4.5rem, 20vw, 6.5rem)", textShadow: "0 2px 28px rgba(220,38,38,0.18)" }}
              aria-hidden="true"
            >
              20%
            </span>
          </div>

          {/* Main text block */}
          <div className="flex flex-col gap-2">
            <h2
              id="discount-heading"
              className="text-xl font-black text-gray-900 leading-tight tracking-tight"
            >
              Don&apos;t Miss Our Exclusive Discounts
            </h2>
            <p className="text-sm font-bold text-gray-600 leading-relaxed">
              Enjoy{" "}
              <span className="font-black text-[var(--red)]">20% off</span>{" "}
              for{" "}
              <span className="font-black text-gray-900">MEAXLDs</span>{" "}
              and{" "}
              <span className="font-black text-gray-900">EUROXPRO</span>.
            </p>
          </div>

          {/* Thin red rule */}
          <div className="h-px w-10 bg-[var(--red)] opacity-30 rounded-full" aria-hidden="true" />

          {/* CTA row */}
          <div className="flex gap-3 items-center w-full">
            <a
              href="/en/our-projects"
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl bg-[var(--red)] text-white text-sm font-black text-center hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
              style={{ boxShadow: "0 4px 18px rgba(220,38,38,0.28)" }}
            >
              Explore Now
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors duration-150 focus-ring"
            >
              Got it
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
