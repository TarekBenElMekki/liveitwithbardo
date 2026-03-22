"use client";

import { useTranslations } from "next-intl";
import { useInView } from "@/lib/hooks/useInView";
import { WorldMap } from "@/components/map/WorldMap";

export function GlobeSection() {
  const { ref, inView } = useInView({ threshold: 0.1, once: true });
  const t = useTranslations("home");

  return (
    <section
      id="globe"
      aria-labelledby="globe-heading"
      className="py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#0d0d0d" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Global Network
          </p>
          <h2
            id="globe-heading"
            className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight"
          >
            {t("globeHeading")}
          </h2>
          <p className="text-white/60 max-w-lg text-base leading-relaxed">{t("globeSubtitle")}</p>
        </div>

        <p className="sr-only">{t("globeSrOnly")}</p>

        {/* World map */}
        <div
          ref={ref}
          className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2 sm:p-4"
        >
          <WorldMap isVisible={inView} />
        </div>

        {/* Connection stats row */}
        <div className="mt-8 grid grid-cols-3 divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
          {[
            { value: "50+",    label: "Partner Countries" },
            { value: "1,000+", label: "Exchange Participants" },
            { value: "15+",    label: "Years of Impact" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center px-4 py-5">
              <span className="text-xl font-bold text-accent tabular-nums">{s.value}</span>
              <span className="text-xs text-white/40 mt-1.5 font-medium uppercase tracking-wider leading-tight">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
