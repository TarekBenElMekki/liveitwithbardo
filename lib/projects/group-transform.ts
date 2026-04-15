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