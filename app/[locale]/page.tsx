import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { GlobeSection } from "@/components/globe/GlobeSection";
import { CtaSection } from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <StatsSection />
      <GlobeSection />
      <CtaSection />
    </main>
  );
}
