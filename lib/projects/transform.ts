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

  if (mapCategory(opp) !== "volunteer") {
    return [];
  }

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
    extras.push(`Programme fee: ${opp.fee_and_health_insurance.total} ${opp.fee_and_health_insurance.currency ?? ""}.`.trim());
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