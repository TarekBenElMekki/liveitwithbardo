"use client";

export function PromoBar() {
  return (
    <div
      role="banner"
      aria-label="Promotional announcement"
      className="fixed top-0 left-0 right-0 z-[60] bg-[var(--red)] text-white text-xs py-2 px-4 flex items-center justify-center overflow-hidden"
      style={{ height: "var(--promo-h)" }}
    >
      <span className="font-medium tracking-wide text-center">
        Discover Our Exclusive Discounts — Don&apos;t Miss Out!
      </span>
    </div>
  );
}
