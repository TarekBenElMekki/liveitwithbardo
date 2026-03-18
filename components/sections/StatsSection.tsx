"use client";

import { useEffect, useState } from "react";
import { stats } from "@/data/stats";
import { StatCounter } from "@/components/ui/StatCounter";
import { useInView } from "@/lib/hooks/useInView";

export function StatsSection() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.3, once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) setHasAnimated(true);
  }, [inView, hasAnimated]);

  return (
    <section
      id="stats"
      ref={ref}
      aria-labelledby="stats-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100"
    >
      <div className="max-w-5xl mx-auto">
        <p
          id="stats-heading"
          className="text-center text-xs font-semibold uppercase tracking-widest text-accent mb-10"
        >
          Our Impact
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {stats.map((stat) => (
            <StatCounter key={stat.id} stat={stat} shouldAnimate={hasAnimated} />
          ))}
        </div>
      </div>
    </section>
  );
}
