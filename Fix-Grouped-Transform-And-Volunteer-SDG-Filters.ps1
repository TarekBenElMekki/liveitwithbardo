param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-Directory($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Write-Utf8NoBom($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir) { Ensure-Directory $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$groupTransformPath = Join-Path $projectRoot 'lib\projects\group-transform.ts'
$projectsClientPath = Join-Path $projectRoot 'components\projects\ProjectsPageClient.tsx'
$projectFiltersPath = Join-Path $projectRoot 'components\projects\ProjectFilters.tsx'

Write-Section "Rewriting lib/projects/group-transform.ts"
$groupTransformContent = @'
import type { SDG } from "@/data/projects";
import type { GroupedProject } from "./grouped-types";
import type { GisOpportunity } from "./gis-types";

type GroupedProjectCategory = "volunteer" | "talent" | "teaching";

function stripBracketSuffix(value: string) {
  return value.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function dedupeSlugs(baseSlugs: string[]): string[] {
  const counts = new Map<string, number>();

  return baseSlugs.map((base) => {
    const current = counts.get(base) ?? 0;
    const next = current + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  });
}

function mapCategory(opp: GisOpportunity): GroupedProjectCategory {
  const id = opp.programme?.id;

  if (id === "7") return "volunteer";
  if (id === "8") return "talent";
  if (id === "9") return "teaching";

  return "volunteer";
}

function isSDG(value: number): value is SDG {
  return Number.isInteger(value) && value >= 1 && value <= 17;
}

function extractSdgs(opp: GisOpportunity): SDG[] {
  const raw = opp.sdg_info?.sdg_target?.goal_index;

  if (mapCategory(opp) !== "volunteer") {
    return [];
  }

  return typeof raw === "number" && isSDG(raw) ? [raw] : [];
}

function pickPrimarySlot(opp: GisOpportunity) {
  const slots = opp.all_slots?.nodes ?? [];
  return slots.find((slot) => slot.status === "live") ?? slots[0] ?? null;
}

function getEarliestStart(opp: GisOpportunity): string {
  const slot = pickPrimarySlot(opp);
  return slot?.start_date ?? opp.earliest_start_date ?? "";
}

function getLatestEnd(opp: GisOpportunity): string {
  const slot = pickPrimarySlot(opp);
  return slot?.end_date ?? opp.latest_end_date ?? "";
}

function buildDescription(opp: GisOpportunity) {
  const base = (opp.description ?? "").replace(/\s+/g, " ").trim();
  const logistics = [];

  if (opp.logistics_info?.accommodation_covered === "covered") logistics.push("accommodation");
  if (opp.logistics_info?.food_covered === "covered") logistics.push("meals");
  if (opp.logistics_info?.transportation_covered === "covered") logistics.push("transportation");

  const extras = [];
  if (logistics.length > 0) extras.push(`Includes: ${logistics.join(", ")}.`);
  if (opp.fee_and_health_insurance?.total) {
    extras.push(
      `Programme fee: ${opp.fee_and_health_insurance.total} ${opp.fee_and_health_insurance.currency ?? ""}.`.trim()
    );
  }

  return [base, ...extras].filter(Boolean).join(" ").trim();
}

function getProgrammeDisplay(
  programme: { id: string; short_name: string | null } | null | undefined
) {
  const p = programme as
    | ({ id: string; short_name: string | null; short_name_display?: string | null })
    | null
    | undefined;

  return p?.short_name_display ?? p?.short_name ?? "";
}

function hasSlots(opp: GisOpportunity): boolean {
  const slots = opp.all_slots?.nodes ?? [];
  return slots.length > 0 || !!opp.earliest_start_date || !!opp.latest_end_date;
}

export function transformToGroupedProject(
  opp: GisOpportunity,
  slug: string
): GroupedProject {
  return {
    id: `opp-${opp.id}`,
    slug,
    title: stripBracketSuffix(opp.title ?? "Untitled opportunity"),
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: opp.cover_photo?.filename ?? "",
    sdgs: extractSdgs(opp),
    startDate: getEarliestStart(opp),
    endDate: getLatestEnd(opp),
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    programme: getProgrammeDisplay(opp.programme),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
  };
}

export function transformGisOpportunityToGrouped(opp: GisOpportunity): GroupedProject {
  const cleanTitle = stripBracketSuffix(opp.title ?? "opportunity");
  const slug = slugify(cleanTitle || "opportunity");
  return transformToGroupedProject(opp, slug);
}

export function transformAllToGroupedProjects(opps: GisOpportunity[]): GroupedProject[] {
  const valid = opps.filter(hasSlots);
  const baseSlugs = valid.map((opp) => {
    const cleanTitle = stripBracketSuffix(opp.title ?? "opportunity");
    return slugify(cleanTitle || "opportunity");
  });

  const finalSlugs = dedupeSlugs(baseSlugs);

  return valid.map((opp, index) => transformToGroupedProject(opp, finalSlugs[index]));
}
'@
Write-Utf8NoBom $groupTransformPath $groupTransformContent

Write-Section "Rewriting components/projects/ProjectsPageClient.tsx"
$projectsClientContent = @'
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
      ...filters,
      sdgs: sdgEnabled ? filters.sdgs : [],
    }),
    [filters, sdgEnabled]
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
            <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              {sdgEnabled
                ? "SDG filters are available for volunteer opportunities."
                : "SDG filters are hidden for talent and teaching opportunities."}
            </p>
          </div>

          <a
            href={resetHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus-ring"
          >
            Back to selection
          </a>
        </div>

        <ProjectFilters
          filters={effectiveFilters}
          availableSdgs={availableSdgs}
          onChange={setFilters}
        />

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
'@
Write-Utf8NoBom $projectsClientPath $projectsClientContent

Write-Section "Rewriting components/projects/ProjectFilters.tsx"
$projectFiltersContent = @'
"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/lib/utils";
import type { SDG } from "@/data/projects";
import { cn } from "@/lib/utils";

const SDG_COLORS: Record<SDG, { bg: string; text: string; border: string }> = {
  1:  { bg: "#E5243B", text: "#fff", border: "#E5243B" },
  2:  { bg: "#DDA63A", text: "#fff", border: "#DDA63A" },
  3:  { bg: "#4C9F38", text: "#fff", border: "#4C9F38" },
  4:  { bg: "#C5192D", text: "#fff", border: "#C5192D" },
  5:  { bg: "#FF3A21", text: "#fff", border: "#FF3A21" },
  6:  { bg: "#26BDE2", text: "#fff", border: "#26BDE2" },
  7:  { bg: "#FCC30B", text: "#111", border: "#FCC30B" },
  8:  { bg: "#A21942", text: "#fff", border: "#A21942" },
  9:  { bg: "#FD6925", text: "#fff", border: "#FD6925" },
  10: { bg: "#DD1367", text: "#fff", border: "#DD1367" },
  11: { bg: "#FD9D24", text: "#111", border: "#FD9D24" },
  12: { bg: "#BF8B2E", text: "#fff", border: "#BF8B2E" },
  13: { bg: "#3F7E44", text: "#fff", border: "#3F7E44" },
  14: { bg: "#0A97D9", text: "#fff", border: "#0A97D9" },
  15: { bg: "#56C02B", text: "#111", border: "#56C02B" },
  16: { bg: "#00689D", text: "#fff", border: "#00689D" },
  17: { bg: "#19486A", text: "#fff", border: "#19486A" },
};

interface ProjectFiltersProps {
  filters: FilterState;
  availableSdgs: SDG[];
  onChange: (filters: FilterState) => void;
}

export function ProjectFilters({
  filters,
  availableSdgs,
  onChange,
}: ProjectFiltersProps) {
  const showSdgs = availableSdgs.length > 0;

  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (filters.category !== "all") {
    activeFilters.push({
      key: "category",
      label: `Category: ${filters.category}`,
      onRemove: () => onChange({ ...filters, category: "all" }),
    });
  }

  if (filters.city !== "all") {
    activeFilters.push({
      key: "city",
      label: `City: ${filters.city}`,
      onRemove: () => onChange({ ...filters, city: "all" }),
    });
  }

  if (filters.status !== "all") {
    activeFilters.push({
      key: "status",
      label: `Status: ${filters.status}`,
      onRemove: () => onChange({ ...filters, status: "all" }),
    });
  }

  if (filters.startDate) {
    activeFilters.push({
      key: "startDate",
      label: `From: ${filters.startDate}`,
      onRemove: () => onChange({ ...filters, startDate: "" }),
    });
  }

  if (filters.endDate) {
    activeFilters.push({
      key: "endDate",
      label: `Until: ${filters.endDate}`,
      onRemove: () => onChange({ ...filters, endDate: "" }),
    });
  }

  if (showSdgs) {
    filters.sdgs.forEach((sdg) => {
      activeFilters.push({
        key: `sdg-${sdg}`,
        label: `SDG ${sdg}`,
        onRemove: () =>
          onChange({
            ...filters,
            sdgs: filters.sdgs.filter((value) => value !== sdg),
          }),
      });
    });
  }

  const cities = ["all", "Tunis", "Bardo", "Sfax", "Sousse", "Nabeul", "Mahdia", "Remote"];

  return (
    <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(17,24,39,0.05)]">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            Type
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onChange({
                ...filters,
                category: e.target.value as FilterState["category"],
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          >
            <option value="all">All types</option>
            <option value="volunteer">Volunteer</option>
            <option value="talent">Talent</option>
            <option value="teaching">Teaching</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) =>
              onChange({
                ...filters,
                city: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city === "all" ? "All cities" : city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as FilterState["status"],
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          >
            <option value="all">Any status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            Start date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              onChange({
                ...filters,
                startDate: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            End date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              onChange({
                ...filters,
                endDate: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {showSdgs && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
            SDGs
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSdgs.map((sdg) => {
              const selected = filters.sdgs.includes(sdg);
              const colors = SDG_COLORS[sdg];

              return (
                <button
                  key={sdg}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      sdgs: selected
                        ? filters.sdgs.filter((value) => value !== sdg)
                        : [...filters.sdgs, sdg],
                    })
                  }
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5"
                  )}
                  style={{
                    backgroundColor: selected ? colors.bg : "#ffffff",
                    color: selected ? colors.text : "#374151",
                    borderColor: selected ? colors.border : "#e5e7eb",
                  }}
                >
                  SDG {sdg}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={filter.onRemove}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            {filter.label}
            <X size={12} aria-hidden="true" />
          </button>
        ))}

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                category: "all",
                sdgs: [],
                city: "all",
                status: "all",
                startDate: "",
                endDate: "",
              })
            }
            className="ml-auto inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
'@
Write-Utf8NoBom $projectFiltersPath $projectFiltersContent

Write-Section "Done"
Write-Host "Grouped transformer exports restored and SDG filters are now volunteer-only." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Fix-Grouped-Transform-And-Volunteer-SDG-Filters.ps1" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White