"use client";

import { useScroll, useTransform, type MotionValue } from "framer-motion";

/**
 * Returns a horizontal MotionValue driven by page scroll.
 * Positive factor moves right, negative moves left.
 * Uses transform only — no layout reflow.
 */
export function useParallax(factor: number): MotionValue<number> {
  const { scrollY } = useScroll();
  // Map scroll 0–2000px to a horizontal offset
  const x = useTransform(scrollY, [0, 2000], [0, factor * 300]);
  return x;
}
