/**
 * Transforms raw GIS opportunities into GroupedProject objects.
 * One GIS opportunity = one GroupedProject (slots are nested, not separate rows).
 */

import type { GisOpportunity } from "./gis-types";
import type { GroupedProject, ProjectSlot } from "./grouped-types";
import type { SDG, ProjectCategory } from "@/data/projects";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Removes content inside square brackets (including the brackets) and trims.
 * "Scale Up! [6 weeks]" → "Scale Up!"
 * "Global Classroom [6 weeks]" → "Global Classroom"
 */
export function cleanTitle(raw: string): string {
  return raw.replace(/\s*\[.*?\]\s*/g, " ").trim().replace(/\s+/g, " ");
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
 * Normalises a date value to ISO YYYY-MM-DD, or returns null if missing.
 */
function normaliseDate(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function mapCategory(opp: GisOpportunity): ProjectCategory {
  const id = opp.programme?.id;
  if (id === "8" || id === "9") return "internship";
  return "volunteer";
}

function deriveCity(opp: GisOpportunity): string {
  const name = opp.host_lc?.name?.trim();
  if (!name) return "Tunisia";
  return name.replace(/^aiesec\s+(in\s+)?/i, "").trim() || "Tunisia";
}

function buildDescription(opp: GisOpportunity): string {
  const parts: string[] = [];
  if (opp.description?.trim()) {
    const stripped = opp.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped) parts.push(stripped.slice(0, 300));
  }
  const li = opp.logistics_info;
  const covered: string[] = [];
  if (li?.accommodation_covered === "covered") covered.push("accommodation");
  if (li?.food_covered === "covered") covered.push("meals");
  if (li?.transportation_covered === "covered") covered.push("transportation");
  if (covered.length) parts.push(`Includes: ${covered.join(", ")}.`);
  const fee = opp.fee_and_health_insurance as { programme_fee?: number | null; total?: number | null; currency?: string | null } | null;
  const feeAmt = fee?.total ?? fee?.programme_fee;
  if (feeAmt && feeAmt > 0) parts.push(`Programme fee: ${feeAmt} ${fee?.currency ?? "TND"}.`);
  return parts.join(" ") || "AIESEC opportunity in Tunisia.";
}

// ── Main transform ────────────────────────────────────────────────────────────

export function transformToGroupedProject(opp: GisOpportunity): GroupedProject {
  const rawTitle = opp.title?.trim() || "Untitled Opportunity";
  const title = cleanTitle(rawTitle);
  const oppId = String(opp.id);

  // Slots
  const slots: ProjectSlot[] = (opp.all_slots?.nodes ?? []).map((s) => ({
    startDate: normaliseDate(s.start_date),
    endDate: normaliseDate(s.end_date),
    openings: s.openings ?? null,
    available: null, // slot-level available not in GIS response; use opp-level
  }));

  // Totals — use opp-level fields (GIS doesn't expose per-slot available)
  const totalOpenings = opp.openings ?? null;
  const totalAvailable = opp.available_openings ?? null;

  // Date range: prefer opp-level fields, fall back to first/last slot
  const firstSlot = slots[0];
  const lastSlot = slots[slots.length - 1];
  const startDate =
    normaliseDate(opp.earliest_start_date) ??
    firstSlot?.startDate ??
    new Date().toISOString().slice(0, 10);
  const endDate =
    normaliseDate(opp.latest_end_date) ??
    lastSlot?.endDate ??
    new Date().toISOString().slice(0, 10);

  const isOpen =
    opp.status === "open" &&
    (opp.available_openings == null || opp.available_openings > 0);

  const goalIndex = opp.sdg_info?.sdg_target?.goal_index;
  const sdgs: SDG[] =
    goalIndex != null && goalIndex >= 1 && goalIndex <= 17
      ? [goalIndex as SDG]
      : [];

  const coverPhoto = opp.cover_photo as { url?: string } | null;
  const image = coverPhoto?.url ?? "";

  const fee = opp.fee_and_health_insurance as {
    programme_fee?: number | null;
    total?: number | null;
    currency?: string | null;
  } | null;

  const li = opp.logistics_info;

  const programme = opp.programme?.short_name ?? "";

  // External apply URL — GV only
  const externalApplyUrl =
    programme.toUpperCase() === "GV"
      ? `https://aiesec.org/opportunity/global-volunteer/${oppId}`
      : null;

  return {
    id: `opp-${oppId}`,
    oppId,
    slug: slugify(`${oppId}-${title}`),
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
    programme,
    totalOpenings,
    totalAvailable,
    slots,
    fee: {
      amount: fee?.total ?? fee?.programme_fee ?? null,
      currency: fee?.currency ?? null,
    },
    logistics: {
      accommodation: li?.accommodation_covered === "covered",
      food: li?.food_covered === "covered",
      transport: li?.transportation_covered === "covered",
    },
    externalApplyUrl,
  };
}
