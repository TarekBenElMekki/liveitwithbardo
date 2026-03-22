"use client";

import { useState, useMemo } from "react";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { ProjectFilters } from "./ProjectFilters";
import { GroupedProjectGrid } from "./GroupedProjectGrid";
import { filterProjects, type FilterState } from "@/lib/utils";

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

export function ProjectsPageClient({ projects, locale }: ProjectsPageClientProps) {
  const cities = useMemo(
    () => Array.from(new Set(projects.map((p) => p.city))).sort(),
    [projects]
  );

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters]
  );

  return (
    <section aria-label="Project listing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <ProjectFilters filters={filters} cities={cities} onChange={setFilters} />
        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {filtered.length} project{filtered.length === 1 ? "" : "s"} found
        </p>
        <GroupedProjectGrid
          projects={filtered}
          locale={locale}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>
    </section>
  );
}
