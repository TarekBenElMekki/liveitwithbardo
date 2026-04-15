import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";
import { loadGroupedProjects } from "@/lib/projects/loader";

function isValidCategory(value: string | undefined) {
  return value === "volunteer" || value === "talent" || value === "teaching";
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function OurProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedCategory = resolvedSearchParams?.category;
  const showHero = isValidCategory(selectedCategory);

  const [t, projects] = await Promise.all([
    getTranslations("projects"),
    loadGroupedProjects(),
  ]);

  return (
    <main id="main-content" className="page-top">
      {showHero && (
        <section
          aria-labelledby="projects-hero-heading"
          className="relative py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--section-alt)]"
        >
          <div className="relative max-w-3xl mx-auto">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">
              {t("badge")}
            </p>
            <h1
              id="projects-hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3"
            >
              {t("heroHeading")} <span className="text-accent">{t("heroAccent")}</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </div>
        </section>
      )}

      <ProjectsPageClient projects={projects} locale={locale} />
    </main>
  );
}