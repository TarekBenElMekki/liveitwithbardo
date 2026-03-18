import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function OurProjectsPage() {
  const t = await getTranslations("projects");

  return (
    <main id="main-content" className="page-top">
      <section
        aria-labelledby="projects-hero-heading"
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--section-alt)]"
      >
        <div className="relative max-w-3xl mx-auto">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">
            {t("badge")}
          </p>
          <h1
            id="projects-hero-heading"
            className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            {t("heroHeading")} <span className="text-accent">{t("heroAccent")}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <ProjectsPageClient />
    </main>
  );
}
