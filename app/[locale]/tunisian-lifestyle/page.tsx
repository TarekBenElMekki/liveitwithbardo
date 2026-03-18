import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FoodSection } from "@/components/sections/FoodSection";
import { PlacesSection } from "@/components/sections/PlacesSection";
import { EstimatorSection } from "@/components/sections/EstimatorSection";
import { CurrencyConverter } from "@/components/sections/CurrencyConverter";
import { TransportSection } from "@/components/lifestyle/TransportSection";
import { ClimateSection } from "@/components/lifestyle/ClimateSection";
import { LanguageSection } from "@/components/lifestyle/LanguageSection";
import { EtiquetteSection } from "@/components/lifestyle/EtiquetteSection";
import { SafetySection } from "@/components/lifestyle/SafetySection";
import { PackingSection } from "@/components/lifestyle/PackingSection";
import { CtaSection } from "@/components/sections/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("lifestyle");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function TunisianLifestylePage() {
  const t = await getTranslations("lifestyle");

  return (
    <main id="main-content" className="page-top">
      <section
        aria-labelledby="lifestyle-hero-heading"
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--section-alt)]"
      >
        <div className="relative max-w-3xl mx-auto">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">
            {t("badge")}
          </p>
          <h1
            id="lifestyle-hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5"
          >
            {t("heroHeading")} <span className="text-accent">{t("heroAccent")}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <FoodSection />
      <PlacesSection />
      <EstimatorSection />
      <CurrencyConverter />
      <TransportSection />
      <ClimateSection />
      <LanguageSection />
      <EtiquetteSection />
      <SafetySection />
      <PackingSection />
      <CtaSection />
    </main>
  );
}
