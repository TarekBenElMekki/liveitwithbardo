$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Write-TextFile($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$groupTransformPath = Join-Path $projectRoot 'lib\projects\group-transform.ts'

Write-Section "Restoring grouped transformer exports and category mapping"
$groupTransformContent = @'
import type { ProjectCategory } from "@/data/projects";
import type { GroupedProject, ProjectSlot } from "./grouped-types";
import type { GisOpportunity } from "./gis-types";

/**
 * Transforms raw GIS opportunities into GroupedProject objects.
 * One GIS opportunity = one GroupedProject (slots are nested, not separate rows).
 */

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function stripBracketSuffix(value: string) {
  return value.replace(/\s*\[[^\]]*\]\s*/g, " ").replace(/\s+/g, " ").trim();
}

export function hasSlots(opp: GisOpportunity): boolean {
  return Array.isArray(opp.all_slots?.nodes) && opp.all_slots!.nodes.length > 0;
}

function mapCategory(opp: GisOpportunity): ProjectCategory {
  const id = opp.programme?.id;

  if (id === "7") return "volunteer"; // GV
  if (id === "8") return "talent";    // GTa
  if (id === "9") return "teaching";  // GTe

  return "volunteer";
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

  const fee = getProjectFee(opp);
  if (fee.amount != null && fee.currency) {
    extras.push(`Project fee: ${fee.amount} ${fee.currency}.`);
  }

  return [base, ...extras].filter(Boolean).join(" ").trim();
}

function toProjectSlot(opp: GisOpportunity): ProjectSlot[] {
  const nodes = opp.all_slots?.nodes ?? [];
  return nodes.map((slot) => ({
    startDate: slot.start_date ?? null,
    endDate: slot.end_date ?? null,
    openings: slot.openings ?? null,
    available: slot.openings ?? null,
  }));
}

function sortDateAsc(a: string | null, b: string | null) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function sortDateDesc(a: string | null, b: string | null) {
  return sortDateAsc(b, a);
}

function getEarliestStart(opp: GisOpportunity) {
  const slotDates = (opp.all_slots?.nodes ?? [])
    .map((slot) => slot.start_date ?? null)
    .filter((v): v is string => Boolean(v))
    .sort(sortDateAsc);

  return slotDates[0] ?? opp.earliest_start_date ?? "";
}

function getLatestEnd(opp: GisOpportunity) {
  const slotDates = (opp.all_slots?.nodes ?? [])
    .map((slot) => slot.end_date ?? null)
    .filter((v): v is string => Boolean(v))
    .sort(sortDateDesc);

  return slotDates[0] ?? opp.latest_end_date ?? "";
}

function getTotalOpenings(opp: GisOpportunity) {
  const nodes = opp.all_slots?.nodes ?? [];
  if (nodes.length === 0) return opp.openings ?? null;

  const sum = nodes.reduce((acc, slot) => acc + (slot.openings ?? 0), 0);
  return sum > 0 ? sum : opp.openings ?? null;
}

function getTotalAvailable(opp: GisOpportunity) {
  if (opp.available_openings != null) return opp.available_openings;

  const nodes = opp.all_slots?.nodes ?? [];
  if (nodes.length === 0) return null;

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
  return opp.programme?.id === "7"
    ? `https://aiesec.org/opportunity/global-volunteer/${opp.id}`
    : null;
}

export function transformToGroupedProject(
  opp: GisOpportunity,
  fallbackSlug?: string
): GroupedProject {
  const title = stripBracketSuffix(opp.title ?? "Untitled opportunity");
  const programme = getProgrammeDisplay(opp.programme);
  const sdg = opp.sdg_info?.sdg_target?.goal_index;
  const sdgs = typeof sdg === "number" ? [sdg] : [];
  const cleanSlugBase = fallbackSlug || slugify(`${opp.id}-${title || "opportunity"}`);

  return {
    id: `opp-${opp.id}`,
    oppId: String(opp.id),
    slug: cleanSlugBase,
    title,
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: opp.cover_photo?.filename ?? "",
    sdgs,
    startDate: getEarliestStart(opp),
    endDate: getLatestEnd(opp),
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
    programme,
    totalOpenings: getTotalOpenings(opp),
    totalAvailable: getTotalAvailable(opp),
    availableSlots: getAvailableSlots(opp),
    slots: toProjectSlot(opp),
    fee: getProjectFee(opp),
    logistics: getLogistics(opp),
    externalApplyUrl: getExternalApplyUrl(opp),
  };
}

export function transformAllToGroupedProjects(opps: GisOpportunity[]): GroupedProject[] {
  return opps
    .filter(hasSlots)
    .map((opp) => transformToGroupedProject(opp, slugify(`${opp.id}-${stripBracketSuffix(opp.title ?? "opportunity")}`)));
}

'@
Write-TextFile $groupTransformPath $groupTransformContent

Write-Section "Done"
Write-Host "group-transform.ts restored with transformAllToGroupedProjects, transformToGroupedProject, and volunteer/talent/teaching mapping." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
