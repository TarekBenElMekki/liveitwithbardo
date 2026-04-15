"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { ProjectFilters } from "./ProjectFilters";
import { GroupedProjectGrid } from "./GroupedProjectGrid";
import { ProjectCategorySelector } from "./ProjectCategorySelector";
import { filterProjects, type FilterState } from "@/lib/utils";
import type { SDG } from "@/data/projects";

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  sdgs: [],
  city: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

interface ProjectsPageClientProps {
  projects: GroupedProject[];
  locale: string;
}

function normalizeCategory(value: string | null): Exclude<FilterState["category"], "all"> | null {
  if (value === "volunteer" || value === "talent" || value === "teaching") {
    return value;
  }
  return null;
}

export function ProjectsPageClient({ projects, locale }: ProjectsPageClientProps) {
  const searchParams = useSearchParams();
  const selectedCategory = normalizeCategory(searchParams.get("category"));
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    if (selectedCategory) {
      setFilters({
        ...DEFAULT_FILTERS,
        category: selectedCategory,
        sdgs: [],
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  }, [selectedCategory]);

  const projectsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) return projects;
    return projects.filter((project) => project.category === selectedCategory);
  }, [projects, selectedCategory]);

  const sdgEnabled = selectedCategory === "volunteer";

  const availableSdgs = useMemo(
    () =>
      !sdgEnabled
        ? []
        : (Array.from(
            new Set<number>(
              projectsForSelectedCategory.flatMap((project) => project.sdgs as number[])
            )
          ).sort((a, b) => a - b) as SDG[]),
    [projectsForSelectedCategory, sdgEnabled]
  );

  const effectiveFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      category: selectedCategory ?? "all",
      sdgs: sdgEnabled ? filters.sdgs : [],
    }),
    [filters.sdgs, sdgEnabled, selectedCategory]
  );

  const filtered = useMemo(
    () => filterProjects(projectsForSelectedCategory, effectiveFilters),
    [projectsForSelectedCategory, effectiveFilters]
  );

  const resetHref = `/${locale}/our-projects`;

  if (!selectedCategory) {
    return <ProjectCategorySelector projects={projects} locale={locale} />;
  }

  return (
    <section aria-label="Projects listing" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em] mb-3">
              Category selected
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight capitalize">
              {selectedCategory} projects
            </h2>
            {sdgEnabled && (
              <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
                Filter Global Volunteer opportunities by SDG.
              </p>
            )}
          </div>

          <a
            href={resetHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus-ring"
          >
            Back to selection
          </a>
        </div>

        {sdgEnabled && (
          <ProjectFilters
            filters={effectiveFilters}
            availableSdgs={availableSdgs}
            onChange={(next) =>
              setFilters({
                ...DEFAULT_FILTERS,
                category: selectedCategory,
                sdgs: next.sdgs,
              })
            }
          />
        )}

        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {filtered.length} project{filtered.length === 1 ? "" : "s"} found
        </p>

        <GroupedProjectGrid
          projects={filtered}
          locale={locale}
          onReset={() =>
            setFilters({
              ...DEFAULT_FILTERS,
              category: selectedCategory,
              sdgs: [],
            })
          }
        />
      </div>
    </section>
  );
}