"use client";

import { useEffect, useState } from "react";
import { showPromoBar, promoTargetDate } from "@/lib/env";

/** Target date driven by NEXT_PUBLIC_PROMO_TARGET_DATE env var */
const TARGET = new Date(promoTargetDate);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(): TimeLeft {
  const diff = Math.max(0, TARGET.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * EUROEXPO logo.
 * Primary: /logos/euroxpro-logo.svg
 * Fallback: text badge — replace file to activate real logo.
 */
function EuroexpoLogo() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span
        className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm bg-white/20 text-white font-bold text-[9px] tracking-tighter leading-none"
        aria-hidden="true"
      >
        EE
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/euroxpro-logo.svg"
      alt="EUROEXPO"
      width={40}
      height={20}
      onError={() => setImgError(true)}
      className="h-5 w-auto object-contain"
      style={{ display: "inline-block" }}
    />
  );
}

export function PromoBar() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Controlled by NEXT_PUBLIC_SHOW_PROMO_BAR — defaults to true
    if (!showPromoBar) return;
    setTime(calcTimeLeft());
    const id = setInterval(() => setTime(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Controlled by NEXT_PUBLIC_SHOW_PROMO_BAR — defaults to true
  if (!showPromoBar) return null;

  return (
    <div
      role="banner"
      aria-label="Promotional announcement"
      className="fixed top-0 left-0 right-0 z-50 bg-[var(--red)] text-white text-xs py-2 px-4 flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap"
      style={{ height: "var(--promo-h)" }}
    >
      <span className="flex items-center gap-2 font-medium tracking-wide min-w-0 shrink-0">
        <EuroexpoLogo />
        <span className="hidden xs:inline">Discover Our Exclusive Discounts — Don&apos;t Miss Out!</span>
      </span>

      <span className="text-white/40 shrink-0" aria-hidden="true">·</span>

      {time !== null ? (
        <span className="flex items-center gap-1.5 font-mono tabular-nums shrink-0" aria-label="Countdown timer">
          <CountUnit value={time.days}    label="d" />
          <Sep />
          <CountUnit value={time.hours}   label="h" />
          <Sep />
          <CountUnit value={time.minutes} label="m" />
          <Sep />
          <CountUnit value={time.seconds} label="s" />
        </span>
      ) : (
        <span className="font-mono text-white/60 tabular-nums shrink-0">-- : -- : --</span>
      )}
    </div>
  );
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-baseline gap-0.5">
      <span className="font-semibold">{pad(value)}</span>
      <span className="text-white/60 text-[10px]">{label}</span>
    </span>
  );
}

function Sep() {
  return <span className="text-white/40 font-light" aria-hidden="true">:</span>;
}
