"use client";

import { useEffect, useState } from "react";

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animates a counter from 0 to `target` over `duration` ms.
 * Only starts when `active` is true.
 *
 * Initializes to 0 on both server and client to avoid hydration mismatches.
 * When not animating (active=false), snaps to target after mount.
 */
export function useCounter(
  target: number,
  duration: number,
  active: boolean
): number {
  // Always start at 0 — consistent between SSR and client hydration.
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      // Not animating — show the final value immediately after mount.
      setCount(target);
      return;
    }

    let rafId: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(easeOut(progress) * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, target, duration]);

  return count;
}
