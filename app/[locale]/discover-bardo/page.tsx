import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WhyTunisiaGrid } from "@/components/discover/WhyTunisiaGrid";
import { PersonaCards } from "@/components/discover/PersonaCards";
import { JourneyTimeline } from "@/components/discover/JourneyTimeline";
import { SupportSection } from "@/components/discover/SupportSection";
import { ExperienceHighlights } from "@/components/discover/ExperienceHighlights";
import { CtaSection } from "@/components/sections/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("discover");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function DiscoverBardoPage() {
  const t = await getTranslations("discover");

  return (
    <main id="main-content" className="page-top">
      {/* Page Hero */}
      <section
        aria-labelledby="discover-hero-heading"
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--section-alt)]"
      >
        <div className="relative max-w-3xl mx-auto">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">
            {t("badge")}
          </p>
          <h1
            id="discover-hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5"
          >
            {t("heroHeading")} <span className="text-accent">{t("heroAccent")}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* What is Bardo */}
      <section aria-labelledby="what-bardo-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The City</p>
            <h2 id="what-bardo-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {t("whatBardoHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 text-base leading-relaxed">
            <p>{t("whatBardoP1")}</p>
            <p>{t("whatBardoP2")}</p>
          </div>
        </div>
      </section>

      {/* What AIESEC does */}
      <section
        aria-labelledby="aiesec-heading"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]"
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">The Organisation</p>
            <h2 id="aiesec-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {t("aiesecHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 text-base leading-relaxed mb-12">
            <p>{t("aiesecP1")}</p>
            <p>{t("aiesecP2")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border border-gray-100 rounded-2xl bg-white overflow-hidden">
            {[
              { value: "1984", label: t("statFounded") },
              { value: "120+", label: t("statCountries") },
              { value: "50+",  label: t("statPartners") },
              { value: "1,000+", label: t("statAlumni") },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center px-4 py-7">
                <span className="text-2xl font-bold text-accent tabular-nums">{stat.value}</span>
                <span className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyTunisiaGrid />
      <PersonaCards />
      <JourneyTimeline />
      <SupportSection />
      <ExperienceHighlights />
      <CtaSection />
    </main>
  );
}
