"use client";

import { useInView } from "@/lib/hooks/useInView";
import { WorldMap } from "@/components/map/WorldMap";

export function MapSection() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2, once: true });

  return (
    <section
      id="map"
      ref={ref}
      aria-labelledby="map-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Location
          </p>
          <h2
            id="map-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Tunisia Connects the World
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            AIESEC Tunisia bridges cultures across 50+ countries, sending and
            receiving exchange participants from every corner of the globe.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white p-2 sm:p-4">
          <WorldMap isVisible={inView} />
        </div>
      </div>
    </section>
  );
}
