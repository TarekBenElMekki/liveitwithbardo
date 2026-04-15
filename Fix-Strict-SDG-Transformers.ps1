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
$transformPath = Join-Path $projectRoot 'lib\projects\transform.ts'

Write-Section "Rewriting grouped transformer with strict SDG typing"
$groupTransformContent = @'
import type { SDG } from "@/data/projects";
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

export function transformGisOpportunityToGrouped(opp: GisOpportunity): GroupedProject {
  return {
    id: `opp-${opp.id}`,
    slug: `${opp.id}-${slugify(opp.title ?? "opportunity")}`,
    title: opp.title ?? "Untitled opportunity",
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
'@
Write-Utf8NoBom $groupTransformPath $groupTransformContent

Write-Section "Rewriting flat transformer with strict SDG typing"
$transformContent = @'
import type { Project, SDG } from "@/data/projects";
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
  return typeof raw === "number" && isSDG(raw) ? [raw] : [];
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
    extras.push(
      `Programme fee: ${opp.fee_and_health_insurance.total} ${opp.fee_and_health_insurance.currency ?? ""}.`.trim()
    );
  }

  return [base, ...extras].filter(Boolean).join(" ").trim();
}

export function transformGisOpportunity(opp: GisOpportunity): Project {
  const slot = pickPrimarySlot(opp);

  return {
    id: `opp-${opp.id}`,
    slug: `${opp.id}-${slugify(opp.title ?? "opportunity")}`,
    title: opp.title ?? "Untitled opportunity",
    description: buildDescription(opp),
    image: opp.cover_photo?.url ?? "/hero/hero_static_default.png",
    alt: opp.cover_photo?.filename ?? "",
    sdgs: extractSdgs(opp),
    startDate: slot?.start_date ?? opp.earliest_start_date ?? "",
    endDate: slot?.end_date ?? opp.latest_end_date ?? "",
    city: opp.host_lc?.name ?? "",
    category: mapCategory(opp),
    isOpen: opp.status === "open" && (opp.available_openings ?? 0) > 0,
  };
}
'@
Write-Utf8NoBom $transformPath $transformContent

Write-Section "Done"
Write-Host "Both GIS transformers now emit strict SDG[] values and stay API-only." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White