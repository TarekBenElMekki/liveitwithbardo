import type { Project } from "@/data/projects";
import type { GisOpportunity } from "./gis-types";

/**
 * Normalises a date value from the GIS API to ISO YYYY-MM-DD.
 * Falls back to today if null/unparseable.
 */
function normaliseDate(raw: string | null | undefined): string {
  if (!raw?.trim()) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

/**
 * Slugifies a string: lowercase, spaces → hyphens, strip non-alphanumeric.
 */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Maps a GIS programme id to a ProjectCategory.
 * GV (programme 7) → "volunteer"
 * GT (programme 8) → "internship"
 * GE (programme 9) → "internship"
 * Default → "volunteer"
 */
function mapCategory(opp: GisOpportunity): "volunteer" | "internship" | "cultural" {
  const id = opp.programme?.id;
  if (id === "8" || id === "9") return "internship";
  return "volunteer";
}

/**
 * Builds a concise card-friendly description from GIS opportunity fields.
 */
function buildDescription(opp: GisOpportunity): string {
  const parts: string[] = [];

  if (opp.description?.trim()) {
    const stripped = opp.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped.length > 0) parts.push(stripped.slice(0, 300));
  }

  const logistics: string[] = [];
  const li = opp.logistics_info;
  if (li?.accommodation_covered === "covered") logistics.push("accommodation");
  if (li?.food_covered === "covered") logistics.push("meals");
  if (li?.transportation_covered === "covered") logistics.push("transportation");
  if (logistics.length > 0) parts.push(`Includes: ${logistics.join(", ")}.`);

  // fee_and_health_insurance is a JSON scalar — access as plain object
  const fee = opp.fee_and_health_insurance as {
    programme_fee?: number | null;
    total?: number | null;
    currency?: string | null;
  } | null;
  const feeAmount = fee?.total ?? fee?.programme_fee;
  if (feeAmount && feeAmount > 0) {
    const currency = fee?.currency ?? "TND";
    parts.push(`Programme fee: ${feeAmount} ${currency}.`);
  }

  return parts.join(" ") || "AIESEC opportunity in Tunisia.";
}

/**
 * Derives the city/location from the host LC name.
 */
function deriveCity(opp: GisOpportunity): string {
  const name = opp.host_lc?.name?.trim();
  if (!name) return "Tunisia";
  return name.replace(/^aiesec\s+(in\s+)?/i, "").trim() || "Tunisia";
}

/**
 * Transforms a raw GIS opportunity into the Project shape used by the UI.
 *
 * Direct mappings:
 *  id          ← "opp-" + opp.id
 *  slug        ← slugify(id + title)
 *  title       ← opp.title
 *  description ← built from description + logistics + fee
 *  isOpen      ← status === "open" && available_openings > 0
 *  startDate   ← earliest_start_date or first slot start_date
 *  endDate     ← latest_end_date or first slot end_date
 *  category    ← derived from programme id
 *  city        ← derived from host_lc.name
 *  sdgs        ← sdg_info.sdg_target.goal_index
 *  image       ← cover_photo.url (JSON scalar)
 */
export function transformGisOpportunity(opp: GisOpportunity): Project {
  const title = opp.title?.trim() || "Untitled Opportunity";

  const firstSlot = opp.all_slots?.nodes?.[0];
  const startDate = normaliseDate(opp.earliest_start_date ?? firstSlot?.start_date);
  const endDate = normaliseDate(opp.latest_end_date ?? firstSlot?.end_date);

  const isOpen =
    opp.status === "open" &&
    (opp.available_openings == null || opp.available_openings > 0);

  // SDG: sdg_info.sdg_target.goal_index is the SDG number (1–17)
  const goalIndex = opp.sdg_info?.sdg_target?.goal_index;
  const sdgs: Project["sdgs"] =
    goalIndex != null && goalIndex >= 1 && goalIndex <= 17
      ? [goalIndex as Project["sdgs"][number]]
      : [];

  // cover_photo is a JSON scalar — access as plain object
  const coverPhoto = opp.cover_photo as { url?: string } | null;
  const image = coverPhoto?.url ?? "";

  return {
    id: `opp-${opp.id}`,
    slug: slugify(`${opp.id}-${title}`),
    title,
    description: buildDescription(opp),
    image,
    alt: "",
    sdgs,
    startDate,
    endDate,
    city: deriveCity(opp),
    category: mapCategory(opp),
    isOpen,
  };
}
