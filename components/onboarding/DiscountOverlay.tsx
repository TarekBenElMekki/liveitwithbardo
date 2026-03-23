"use client";

/**
 * DiscountOverlay — premium promotional modal
 *
 * Display logic:
 *  - Shows once per browser session (sessionStorage key "bardo_discount_shown").
 *  - Triggered in two ways:
 *    1. "language-chosen" custom event — fired by CountryLanguagePicker after
 *       the user confirms their language. Covers first-time visitors.
 *    2. On mount, after a short delay — covers returning visitors who already
 *       completed onboarding. The delay lets the page settle before the overlay
 *       appears.
 *  - Dismissed via "Got it" button or backdrop click.
 *  - Reappears on every new session (new tab / browser restart).
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SESSION_KEY = "bardo_discount_shown";

function markShown() {
  try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
}

function wasShownThisSession(): boolean {
  try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
}

export function DiscountOverlay() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const show = () => {
    if (wasShownThisSession()) return;
    markShown();
    setVisible(true);
  };

  const dismiss = () => setVisible(false);

  useEffect(() => {
    setMounted(true);

    // Listen for language picker completion (first-time visitors)
    const onLanguageChosen = () => {
      // Small delay so the picker closes first
      setTimeout(show, 600);
    };
    window.addEventListener("language-chosen", onLanguageChosen);

    // For returning visitors: show after a short settle delay
    const timer = setTimeout(show, 1200);

    return () => {
      window.removeEventListener("language-chosen", onLanguageChosen);
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Red accent bar at top */}
        <div className="h-1.5 w-full bg-[var(--red)]" aria-hidden="true" />

        <div className="p-7 flex flex-col gap-5">

          {/* Close button */}
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close offer"
            className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-ring"
          >
            <X size={16} aria-hidden="true" />
          </button>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--red)] text-white text-xs font-bold tracking-wide uppercase">
              Exclusive Offer
            </span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2
              id="discount-heading"
              className="text-2xl font-bold text-gray-900 leading-tight"
            >
              Don&apos;t Miss Our{" "}
              <span className="text-[var(--red)]">Exclusive Discounts</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enjoy{" "}
              <span className="font-bold text-[var(--red)]">20% off</span>{" "}
              for{" "}
              <span className="font-semibold text-gray-800">MEAxLDs</span>{" "}
              and{" "}
              <span className="font-semibold text-gray-800">EUROXPRO</span>.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" aria-hidden="true" />

          {/* CTA */}
          <div className="flex gap-3">
            <a
              href="#our-projects"
              onClick={dismiss}
              className="flex-1 py-3 rounded-xl bg-[var(--red)] text-white text-sm font-semibold text-center hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
            >
              Explore Now
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors duration-150 focus-ring"
            >
              Got it
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
