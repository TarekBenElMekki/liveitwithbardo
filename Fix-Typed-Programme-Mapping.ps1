param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 72) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 72) -ForegroundColor DarkGray
}

function Ensure-File($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing file: $path"
  }
}

function Write-File($path, $content) {
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[updated] $path" -ForegroundColor Green
}

Write-Section "Project root"
$root = (Get-Location).Path
Write-Host $root -ForegroundColor Green

$client = Join-Path $root 'components\projects\ProjectsPageClient.tsx'
Ensure-File $client

Write-Section "Writing typed GV / GT / GE category mapping"

$content = @'
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

function mapCategoryToProgrammes(category: string | null): string[] | null {
  if (category === "volunteer") return ["GV"];
  if (category === "internship") return ["GT", "GTA"];
  if (category === "cultural") return ["GE", "GTE"];
  return null;
}

export function ProjectsPageClient({ projects, locale }: ProjectsPageClientProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedProgrammes = mapCategoryToProgrammes(selectedCategory);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
  }, [selectedCategory]);

  const availableSdgs = useMemo(
    () =>
      Array.from(
        new Set<number>(projects.flatMap((project) => project.sdgs as number[]))
      ).sort((a, b) => a - b) as SDG[],
    [projects]
  );

  const filtered = useMemo(() => {
    const base = filterProjects(projects, filters);

    if (!selectedProgrammes) {
      return base;
    }

    return base.filter((project) =>
      selectedProgrammes.includes(project.programme)
    );
  }, [projects, filters, selectedProgrammes]);

  const resetHref = `/${locale}/our-projects`;

  if (!selectedCategory) {
    return <ProjectCategorySelector projects={projects} locale={locale} />;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold capitalize">
              {selectedCategory} projects
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Filtered by the matching AIESEC programme codes for this category.
            </p>
          </div>

          <a
            href={resetHref}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Back
          </a>
        </div>

        <ProjectFilters
          filters={filters}
          availableSdgs={availableSdgs}
          onChange={setFilters}
        />

        <GroupedProjectGrid
          projects={filtered}
          locale={locale}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>
    </section>
  );
}
'@

Write-File $client $content

Write-Section "Done"
Write-Host "ProjectsPageClient.tsx now uses typed SDG sorting and maps categories to programme codes." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
