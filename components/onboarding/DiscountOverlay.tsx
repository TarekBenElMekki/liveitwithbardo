"use client";

/**
 * DiscountOverlay — premium promotional modal
 *
 * Display logic (homepage only — no storage suppression):
 *  - Always shows on every homepage load/reload.
 *  - If the language picker is open (first-time visitor), waits for the
 *    "language-chosen" event, then shows after a 600ms settle delay.
 *  - If the language picker is not open (returning visitor), shows after
 *    a 900ms settle delay so the page has time to render first.
 *  - Only one instance ever visible at a time (guarded by `visible` state).
 *  - Dismissed via close button, "Got it", "Explore Now", or backdrop click.
 *
 * Sticker assets:
 *  - /hero/Live it with Bardo.png — bottom-left corner accent
 *  - /hero/Foreground.png         — top-right corner clip (cropped via overflow-hidden)
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
      // First-time visitor: language picker is showing — wait for it to close
      const onLanguageChosen = () => {
        setTimeout(() => setVisible(true), 600);
      };
      window.addEventListener("language-chosen", onLanguageChosen, { once: true });
      return () => window.removeEventListener("language-chosen", onLanguageChosen);
    } else {
      // Returning visitor: show after page settles
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
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* ── Red accent bar ── */}
        <div className="h-1 w-full bg-[var(--red)]" aria-hidden="true" />

        {/* ── Foreground sticker — top-right corner clip ── */}
        {/*    Cropped slice of the aqueduct image, rotated slightly,        */}
        {/*    sits partially outside the card edge for a sticker feel.      */}
        <div
          aria-hidden="true"
          className="absolute -top-4 -right-4 w-28 h-28 overflow-hidden rounded-xl opacity-90 pointer-events-none"
          style={{ transform: "rotate(6deg)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/Foreground.png"
            alt=""
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "60% 30%", filter: "saturate(1.1) brightness(0.95)" }}
            draggable={false}
          />
        </div>

        <div className="px-7 pt-6 pb-7 flex flex-col gap-5">

          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close offer"
            className="absolute top-5 right-5 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-ring"
          >
            <X size={15} aria-hidden="true" />
          </button>

          {/* Badge chip */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--red)] text-white text-[11px] font-bold tracking-widest uppercase">
              Exclusive Offer
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2
              id="discount-heading"
              className="text-[1.6rem] font-extrabold text-gray-900 leading-tight tracking-tight"
            >
              Don&apos;t Miss Our{" "}
              <span
                className="text-[var(--red)]"
                style={{ textShadow: "0 0 32px rgba(255,49,49,0.18)" }}
              >
                Exclusive Discounts
              </span>
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Enjoy{" "}
              <span className="font-extrabold text-[var(--red)] text-base">20% off</span>{" "}
              for{" "}
              <span className="font-semibold text-gray-800">MEAxLDs</span>{" "}
              and{" "}
              <span className="font-semibold text-gray-800">EUROXPRO</span>.
            </p>
          </div>

          {/* Thin red rule */}
          <div className="h-px w-12 bg-[var(--red)] opacity-40 rounded-full" aria-hidden="true" />

          {/* CTA row */}
          <div className="flex gap-3 items-center">
            <a
              href="/en/our-projects"
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl bg-[var(--red)] text-white text-sm font-bold text-center hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring shadow-sm"
              style={{ boxShadow: "0 4px 18px rgba(255,49,49,0.25)" }}
            >
              Explore Now
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors duration-150 focus-ring"
            >
              Got it
            </button>
          </div>

        </div>

        {/* ── "Live it with Bardo" branding sticker — bottom-left ── */}
        {/*    Sits partially outside the card, rotated for sticker feel.   */}
        <div
          aria-hidden="true"
          className="absolute -bottom-3 -left-3 w-32 pointer-events-none"
          style={{ transform: "rotate(-8deg)", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.18))" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero/Live it with Bardo.png"
            alt=""
            className="w-full h-auto block"
            draggable={false}
          />
        </div>

      </div>
    </div>
  );
}
