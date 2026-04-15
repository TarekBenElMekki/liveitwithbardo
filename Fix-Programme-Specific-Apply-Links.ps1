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
$projectSlugPagePath = Join-Path $projectRoot 'app\[locale]\our-projects\[slug]\page.tsx'

Write-Section "Rewriting group-transform.ts with programme-specific apply links"
$groupTransformContent = @'
import type { ProjectCategory, SDG } from "@/data/projects";
import type { GroupedProject, ProjectSlot } from "./grouped-types";
import type { GisOpportunity } from "./gis-types";

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

function mapCategory(opp: GisOpportunity): ProjectCategory {
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

function getProgrammeDisplay(
  programme: { id: string; short_name: string | null } | null | undefined
) {
  const p = programme as
    | ({ id: string; short_name: string | null; short_name_display?: string | null })
    | null
    | undefined;

  return p?.short_name_display ?? p?.short_name ?? "";
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

function getEarliestStartSafe(opp: GisOpportunity): string {
  const nodes = opp.all_slots?.nodes ?? [];
  const starts = nodes
    .map((slot) => slot.start_date)
    .filter((value): value is string => typeof value === "string");

  if (starts.length === 0) {
    return opp.earliest_start_date ?? "";
  }

  return starts.sort()[0] ?? opp.earliest_start_date ?? "";
}

function getLatestEndSafe(opp: GisOpportunity): string {
  const nodes = opp.all_slots?.nodes ?? [];
  const ends = nodes
    .map((slot) => slot.end_date)
    .filter((value): value is string => typeof value === "string");

  if (ends.length === 0) {
    return opp.latest_end_date ?? "";
  }

  return ends.sort()[ends.length - 1] ?? opp.latest_end_date ?? "";
}

function hasSlots(opp: GisOpportunity) {
  const nodes = opp.all_slots?.nodes ?? [];
  return nodes.length > 0 || !!opp.earliest_start_date || !!opp.latest_end_date;
}

function toProjectSlot(opp: GisOpportunity): ProjectSlot[] {
  const nodes = opp.all_slots?.nodes ?? [];
  return nodes.map((slot) => ({
    startDate: slot.start_date ?? null,
    endDate: slot.end_date ?? null,
    openings: slot.openings ?? null,
    available: null,
  }));
}

function getTotalAvailable(opp: GisOpportunity) {
  const nodes = opp.all_slots?.nodes ?? [];
  if (nodes.length === 0) {
    return opp.available_openings ?? null;
  }

  if (typeof opp.available_openings === "number") {
    return opp.available_openings;
  }

  return null;
}

function getTotalOpenings(opp: GisOpportunity) {
  const nodes = opp.all_slots?.nodes ?? [];
  if (nodes.length === 0) {
    return opp.openings ?? null;
  }

  const sum = nodes.reduce((acc, slot) => acc + (slot.openings ?? 0), 0);
  return sum > 0 ? sum : null;
}

function getAvailableSlots(opp: GisOpportunity) {
  const nodes = opp.all_slots?.nodes ?? [];
  return nodes.reduce((acc, slot) => acc + ((slot.openings ?? 0) > 0 ? 1 : 0), 0);
}

function getProjectFee(opp: GisOpportunity): GroupedProject["fee"] {
  const fee = opp.fee_and_health_insurance;

  if (!fee || fee.currency !== "EUR") {
    return { amount: null, currency: null };
  }

  if (fee.project_fee != null) {
    return { amount: fee.project_fee, currency: "EUR" };
  }

  if (fee.programme_fee != null) {
    return { amount: fee.programme_fee, currency: "EUR" };
  }

  return { amount: null, currency: null };
}

function getLogistics(opp: GisOpportunity): GroupedProject["logistics"] {
  return {
    accommodation: opp.logistics_info?.accommodation_covered === "covered",
    food: opp.logistics_info?.food_covered === "covered",
    transport: opp.logistics_info?.transportation_covered === "covered",
  };
}

function getExternalApplyUrl(opp: GisOpportunity) {
  if (!opp?.id) return null;

  const programmeId = opp.programme?.id;

  if (programmeId === "7") {
    return `https://aiesec.org/opportunity/global-volunteer/${opp.id}`;
  }

  if (programmeId === "8") {
    return `https://aiesec.org/opportunity/global-talent/${opp.id}`;
  }

  if (programmeId === "9") {
    return `https://aiesec.org/opportunity/global-teacher/${opp.id}`;
  }

  return `https://aiesec.org/opportunity/${opp.id}`;
}

export function transformToGroupedProject(
  opp: GisOpportunity,
  fallbackSlug?: string
): GroupedProject {
  const title = stripBracketSuffix(opp.title ?? "Untitled opportunity");
  const cleanSlugBase = fallbackSlug || slugify(`${opp.id}-${title || "opportunity"}`);

  return {
    id: `opp-${opp.id}`,
    oppId: String(opp.id),
    slug: cleanSlugBase,
    title,
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: opp.cover_photo?.filename ?? "",
    sdgs: extractSdgs(opp),
    startDate: getEarliestStartSafe(opp),
    endDate: getLatestEndSafe(opp),
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
    programme: getProgrammeDisplay(opp.programme),
    totalOpenings: getTotalOpenings(opp),
    totalAvailable: getTotalAvailable(opp),
    availableSlots: getAvailableSlots(opp),
    slots: toProjectSlot(opp),
    fee: getProjectFee(opp),
    logistics: getLogistics(opp),
    externalApplyUrl: getExternalApplyUrl(opp),
  };
}

export function transformGisOpportunityToGrouped(opp: GisOpportunity): GroupedProject {
  return transformToGroupedProject(
    opp,
    slugify(`${opp.id}-${stripBracketSuffix(opp.title ?? "opportunity")}`)
  );
}

export function transformAllToGroupedProjects(opps: GisOpportunity[]): GroupedProject[] {
  return opps
    .filter(hasSlots)
    .map((opp) =>
      transformToGroupedProject(
        opp,
        slugify(`${opp.id}-${stripBracketSuffix(opp.title ?? "opportunity")}`)
      )
    );
}
'@
Write-Utf8NoBom $groupTransformPath $groupTransformContent

Write-Section "Rewriting project detail page to enable Apply for all programmes with a link"
$projectSlugPageContent = @'
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, MapPin, Users, Calendar, ExternalLink } from "lucide-react";
import { loadGroupedProjects } from "@/lib/projects/loader";
import type { GroupedProject, ProjectSlot } from "@/lib/projects/grouped-types";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await loadGroupedProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "TBC";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  volunteer: "bg-emerald-50 text-emerald-700 border-emerald-100",
  talent: "bg-cyan-50 text-cyan-700 border-cyan-100",
  teaching: "bg-amber-50 text-amber-700 border-amber-100",
};

function SlotRow({ slot }: { slot: ProjectSlot }) {
  const hasDate = slot.startDate || slot.endDate;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
        {hasDate ? (
          <span>
            <span className="font-medium">{fmtDate(slot.startDate)}</span>
            <span className="text-gray-400 mx-1">—</span>
            <span className="font-medium">{fmtDate(slot.endDate)}</span>
          </span>
        ) : (
          <span className="text-gray-400 italic">Dates to be confirmed</span>
        )}
      </div>
      {slot.openings != null && (
        <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
          <Users size={11} aria-hidden="true" />
          <span>{slot.openings} slots</span>
        </div>
      )}
    </div>
  );
}

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [t, projects] = await Promise.all([
    getTranslations("projects"),
    loadGroupedProjects(),
  ]);

  const project: GroupedProject | undefined = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const logisticsTags: string[] = [];
  if (project.logistics.accommodation) logisticsTags.push("Accommodation");
  if (project.logistics.food) logisticsTags.push("Meals");
  if (project.logistics.transport) logisticsTags.push("Transport");

  const applyUrl = project.externalApplyUrl;

  return (
    <main id="main-content" className="page-top min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href={`/${locale}/our-projects`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 focus-ring rounded-md"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t("backToProjects")}
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize",
              categoryColors[project.category] ?? "bg-gray-50 text-gray-500 border-gray-200"
            )}
          >
            {project.category}
          </span>

          {project.programme && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {project.programme}
            </span>
          )}

          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
              project.isOpen
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            )}
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
          {project.title}
        </h1>

        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <MapPin size={13} aria-hidden="true" />
          {project.city}
        </div>

        <p className="text-gray-600 leading-relaxed mb-10">{project.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {project.availableSlots > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Availability</p>
              <p className="text-lg font-bold text-gray-900">{project.availableSlots}</p>
              <p className="text-xs text-gray-400">slots available</p>
            </div>
          )}

          {project.fee.amount != null && project.fee.amount > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Project Fee</p>
              <p className="text-lg font-bold text-gray-900">
                €{project.fee.amount}
                <span className="text-sm font-normal text-gray-400 ml-1">EUR</span>
              </p>
            </div>
          )}

          {logisticsTags.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Included</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {logisticsTags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {project.sdgs.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SDGs</p>
            <div className="flex flex-wrap gap-1.5">
              {project.sdgs.map((sdg) => (
                <span key={sdg} className="text-xs px-2.5 py-1 rounded-full text-gray-500 border border-gray-200" title={`SDG ${sdg}`}>
                  SDG {sdg}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.slots.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Available Slots ({project.slots.length})
            </p>
            <div className="flex flex-col gap-2">
              {project.slots.map((slot, i) => (
                <SlotRow key={i} slot={slot} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
            >
              Apply on AIESEC.org
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
              title={`Apply via AIESEC for ${project.programme || "this programme"}`}
            >
              Apply on AIESEC.org
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          )}

          {!applyUrl && (
            <p className="text-xs text-gray-400 mt-2">
              Online applications are not available here yet. Contact AIESEC in Bardo directly.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
'@
Write-Utf8NoBom $projectSlugPagePath $projectSlugPageContent

Write-Section "Done"
Write-Host "Apply links now use global-volunteer / global-talent / global-teacher and the detail page enables the button for all programmes." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White