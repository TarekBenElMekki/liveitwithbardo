"use client";

import { useReducedMotion } from "framer-motion";
import { useCounter } from "@/lib/hooks/useCounter";
import type { Stat } from "@/data/stats";

interface StatCounterProps {
  stat: Stat;
  shouldAnimate: boolean;
}

export function StatCounter({ stat, shouldAnimate }: StatCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const active = shouldAnimate && !prefersReducedMotion;
  const animatedCount = useCounter(stat.value, 2000, active);
  const displayValue = prefersReducedMotion && shouldAnimate ? stat.value : animatedCount;

  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      <span className="text-4xl lg:text-5xl font-bold text-gray-900 tabular-nums leading-none">
        {displayValue}
        <span className="text-accent">{stat.suffix}</span>
      </span>
      <span className="mt-3 text-xs text-gray-400 font-semibold uppercase tracking-widest">
        {stat.label}
      </span>
    </div>
  );
}
