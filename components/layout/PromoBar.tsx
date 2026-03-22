"use client";

import { showPromoBar } from "@/lib/env";

export function PromoBar() {
  if (!showPromoBar) return null;

  return (
    <div
      role="banner"
      aria-label="Promotional announcement"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--red)] text-white text-xs py-2 px-4 flex items-center justify-center overflow-hidden"
      style={{ height: "var(--promo-h)" }}
    >
      <span className="font-medium tracking-wide text-center">
        Discover Our Exclusive Discounts — Don&apos;t Miss Out!
      </span>
    </div>
  );
}
