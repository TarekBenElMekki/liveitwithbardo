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

function Write-TextFile($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir) { Ensure-Directory $dir }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$projectsClientPath = Join-Path $projectRoot 'components\projects\ProjectsPageClient.tsx'
$selectorPath = Join-Path $projectRoot 'components\projects\ProjectCategorySelector.tsx'
$transformPath = Join-Path $projectRoot 'lib\projects\transform.ts'
$groupTransformPath = Join-Path $projectRoot 'lib\projects\group-transform.ts'

Write-Section "Writing aligned projects page client"
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
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  }, [selectedCategory]);

  const availableSdgs = useMemo(
    () =>
      Array.from(
        new Set<number>(projects.flatMap((project) => project.sdgs as number[]))
      ).sort((a, b) => a - b) as SDG[],
    [projects]
  );

  const filtered = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters]
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
              The filter bar below stays active, so you can refine this category further.
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
          filters={filters}
          availableSdgs={availableSdgs}
          onChange={setFilters}
        />

        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {filtered.length} project{filtered.length === 1 ? "" : "s"} found
        </p>

        <GroupedProjectGrid
          projects={filtered}
          locale={locale}
          onReset={() => setFilters({ ...DEFAULT_FILTERS, category: selectedCategory })}
        />
      </div>
    </section>
  );
}

'@
Write-TextFile $projectsClientPath $projectsClientContent

Write-Section "Writing aligned selector cards"
$selectorContent = @'
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GroupedProject } from "@/lib/projects/grouped-types";

interface ProjectCategorySelectorProps {
  projects: GroupedProject[];
  locale: string;
}

type CategoryKey = "volunteer" | "talent" | "teaching";

interface CategoryCard {
  key: CategoryKey;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  alt: string;
  count: number;
  accent: string;
  soft: string;
  border: string;
  shadow: string;
}

const COPY: Record<CategoryKey, Omit<CategoryCard, "key" | "href" | "count">> = {
  volunteer: {
    title: "Global Volunteer",
    subtitle: "Purpose-led experiences with communities, NGOs, and social impact missions.",
    image: "/programs/GV LOGO WHITE.png",
    alt: "Global Volunteer logo",
    accent: "#F85A40",
    soft: "#FFF1ED",
    border: "rgba(248, 90, 64, 0.18)",
    shadow: "rgba(248, 90, 64, 0.16)",
  },
  talent: {
    title: "Global Talent",
    subtitle: "Professional internships built for growth, leadership, and international exposure.",
    image: "/programs/GTA LOGO WHITE.png",
    alt: "Global Talent logo",
    accent: "#0CB9C1",
    soft: "#ECFCFD",
    border: "rgba(12, 185, 193, 0.18)",
    shadow: "rgba(12, 185, 193, 0.16)",
  },
  teaching: {
    title: "Global Teacher",
    subtitle: "Teaching-driven exchange experiences focused on learning and cultural connection.",
    image: "/programs/GTE LOGO WHITE.png",
    alt: "Global Teacher logo",
    accent: "#F48924",
    soft: "#FFF5EA",
    border: "rgba(244, 137, 36, 0.18)",
    shadow: "rgba(244, 137, 36, 0.16)",
  },
};

function buildCard(
  key: CategoryKey,
  projects: GroupedProject[],
  locale: string
): CategoryCard {
  return {
    key,
    href: `/${locale}/our-projects?category=${key}`,
    count: projects.filter((project) => project.category === key).length,
    ...COPY[key],
  };
}

export function ProjectCategorySelector({
  projects,
  locale,
}: ProjectCategorySelectorProps) {
  const cards = [
    buildCard("volunteer", projects, locale),
    buildCard("talent", projects, locale),
    buildCard("teaching", projects, locale),
  ];

  return (
    <section
      aria-labelledby="project-selector-heading"
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-14 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em] mb-3">
            Choose your path
          </p>
          <h2
            id="project-selector-heading"
            className="text-3xl sm:text-4xl lg:text-[2.9rem] font-bold text-gray-900 leading-tight max-w-4xl"
          >
            Select the AIESEC experience you want to explore
          </h2>
          <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            Each card starts muted and reveals the exact product color on hover. Click to enter the real projects page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group relative isolate min-h-[31rem] sm:min-h-[34rem] overflow-hidden rounded-[2rem] border bg-white transition-all duration-300 ease-out hover:-translate-y-1 focus-ring"
              style={{
                borderColor: card.border,
                boxShadow: `0 16px 48px 0 ${card.shadow}`,
                background: `linear-gradient(180deg, ${card.soft} 0%, #ffffff 100%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(180deg, ${card.accent} 0%, ${card.accent} 100%)`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.65)_45%,rgba(0,0,0,0.55)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_36%,rgba(0,0,0,0.72)_100%)] transition-all duration-300" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-800 transition-colors duration-300 group-hover:text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.65)" }}
                  >
                    Program
                  </span>
                  <span className="inline-flex rounded-full border border-white/30 bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-800 transition-colors duration-300 group-hover:bg-black/20 group-hover:text-white">
                    {card.count} projects
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center py-5 sm:py-7">
                  <div className="relative h-[10.5rem] w-[10.5rem] sm:h-[12.5rem] sm:w-[12.5rem]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 200px, 220px"
                      className="object-contain opacity-75 grayscale brightness-[0.84] saturate-0 transition duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:saturate-100 group-hover:brightness-100"
                      priority={false}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="mb-4 h-1 w-14 rounded-full transition-all duration-300 group-hover:w-24"
                    style={{ backgroundColor: card.accent }}
                  />
                  <h3
                    className="text-3xl sm:text-[2.05rem] font-bold leading-[1.05] transition-colors duration-300 max-w-xs group-hover:text-white group-hover:[text-shadow:0_2px_12px_rgba(0,0,0,0.22)]"
                    style={{ color: card.accent }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-4 text-gray-700 group-hover:text-white text-sm sm:text-base leading-relaxed transition-colors duration-300 max-w-sm group-hover:[text-shadow:0_2px_10px_rgba(0,0,0,0.18)]">
                    {card.subtitle}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 group-hover:text-white transition-colors duration-300">
                    Enter projects
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

'@
Write-TextFile $selectorPath $selectorContent

Write-Section "Writing aligned flat transformer"
$transformContent = @'
import type { Project } from "@/data/projects";
import type { GisOpportunity } from "./gis-types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function mapCategory(opp: GisOpportunity): "volunteer" | "talent" | "teaching" {
  const id = opp.programme?.id;

  if (id === "7") return "volunteer"; // GV
  if (id === "8") return "talent";    // GTa
  if (id === "9") return "teaching";  // GTe

  return "volunteer";
}

function pickPrimarySlot(opp: GisOpportunity) {
  const slots = opp.all_slots?.nodes ?? [];
  return slots.find((slot) => slot.status === "live") ?? slots[0] ?? null;
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
    extras.push(`Programme fee: ${opp.fee_and_health_insurance.total} ${opp.fee_and_health_insurance.currency ?? ""}.`.trim());
  }

  return [base, ...extras].filter(Boolean).join(" ").trim();
}

export function transformGisOpportunity(opp: GisOpportunity): Project {
  const slot = pickPrimarySlot(opp);
  const sdg = opp.sdg_info?.sdg_target?.goal_index;
  const sdgs = typeof sdg === "number" ? [sdg] : [];

  return {
    id: `opp-${opp.id}`,
    slug: `${opp.id}-${slugify(opp.title ?? "opportunity")}`,
    title: opp.title ?? "Untitled opportunity",
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: "",
    sdgs,
    startDate: slot?.start_date ?? opp.earliest_start_date ?? "",
    endDate: slot?.end_date ?? opp.latest_end_date ?? "",
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
  };
}

'@
Write-TextFile $transformPath $transformContent

Write-Section "Writing aligned grouped transformer"
$groupTransformContent = @'
import type { GroupedProject, ProjectCategory } from "./grouped-types";
import type { GisOpportunity } from "./gis-types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function mapCategory(opp: GisOpportunity): ProjectCategory {
  const id = opp.programme?.id;

  if (id === "7") return "volunteer"; // GV
  if (id === "8") return "talent";    // GTa
  if (id === "9") return "teaching";  // GTe

  return "volunteer";
}

function pickPrimarySlot(opp: GisOpportunity) {
  const slots = opp.all_slots?.nodes ?? [];
  return slots.find((slot) => slot.status === "live") ?? slots[0] ?? null;
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
    extras.push(`Programme fee: ${opp.fee_and_health_insurance.total} ${opp.fee_and_health_insurance.currency ?? ""}.`.trim());
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

export function transformGisOpportunityToGrouped(opp: GisOpportunity): GroupedProject {
  const slot = pickPrimarySlot(opp);
  const sdg = opp.sdg_info?.sdg_target?.goal_index;
  const sdgs = typeof sdg === "number" ? [sdg] : [];

  return {
    id: `opp-${opp.id}`,
    slug: `${opp.id}-${slugify(opp.title ?? "opportunity")}`,
    title: opp.title ?? "Untitled opportunity",
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: "",
    sdgs,
    startDate: slot?.start_date ?? opp.earliest_start_date ?? "",
    endDate: slot?.end_date ?? opp.latest_end_date ?? "",
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    programme: getProgrammeDisplay(opp.programme),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
  };
}

'@
Write-TextFile $groupTransformPath $groupTransformContent

Write-Section "Done"
Write-Host "Links, categories, and both transformers are now aligned to volunteer / talent / teaching." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
