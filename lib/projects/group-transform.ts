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
export function slugify(str: string): string {
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
  return parts.join(" ") || "AIESEC opportunity in Tunisia.";
}

/**
 * Extracts the Project Fee in EUR from the fee_and_health_insurance JSON scalar.
 *
 * Strategy:
 *  1. If `project_fee` is set AND `currency` is "EUR" → use project_fee as EUR amount.
 *  2. If `project_fee` is null but `programme_fee` is set AND `currency` is "EUR"
 *     → fall back to programme_fee (same currency, different label).
 *  3. If currency is NOT "EUR" (e.g. TND) → return null.
 *     We do NOT invent conversion rates. The UI will hide the fee section.
 *
 * The GIS API fee_and_health_insurance scalar shape (observed):
 *   { project_fee, programme_fee, total, currency, country }
 */
function extractEurProjectFee(raw: unknown): { amount: number | null; currency: "EUR" | null } {
  if (!raw || typeof raw !== "object") return { amount: null, currency: null };
  const fee = raw as {
    project_fee?: number | null;
    programme_fee?: number | null;
    total?: number | null;
    currency?: string | null;
  };

  const isEur = fee.currency?.toUpperCase() === "EUR";
  if (!isEur) {
    // Currency is not EUR — do not display or convert
    return { amount: null, currency: null };
  }

  // Prefer project_fee, fall back to programme_fee
  const amount = fee.project_fee ?? fee.programme_fee ?? null;
  if (amount == null || amount <= 0) return { amount: null, currency: null };
  return { amount, currency: "EUR" };
}

/**
 * Returns true if the opportunity has at least one slot.
 * Used to filter out slot-less opportunities before they reach the UI.
 */
export function hasSlots(opp: GisOpportunity): boolean {
  return (opp.all_slots?.nodes?.length ?? 0) > 0;
}

// ── Main transform ────────────────────────────────────────────────────────────

/**
 * Transforms a single GIS opportunity into a GroupedProject.
 * Slug is title-only (no OPP ID prefix) — caller must handle deduplication.
 */
export function transformToGroupedProject(
  opp: GisOpportunity,
  slug: string
): GroupedProject {
  const rawTitle = opp.title?.trim() || "Untitled Opportunity";
  const title = cleanTitle(rawTitle);
  const oppId = String(opp.id);

  // Slots
  const slots: ProjectSlot[] = (opp.all_slots?.nodes ?? []).map((s) => ({
    startDate: normaliseDate(s.start_date),
    endDate: normaliseDate(s.end_date),
    openings: s.openings ?? null,
    available: null, // slot-level available not exposed by GIS API; use opp-level totals
  }));

  // Totals — opp-level fields (GIS doesn't expose per-slot available_openings)
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
    slug,
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
    fee: extractEurProjectFee(opp.fee_and_health_insurance),
    logistics: {
      accommodation: li?.accommodation_covered === "covered",
      food: li?.food_covered === "covered",
      transport: li?.transportation_covered === "covered",
    },
    externalApplyUrl,
  };
}

/**
 * Transforms a list of GIS opportunities into GroupedProjects.
 *
 * Slug strategy:
 *  - Base slug = slugify(cleanTitle(opp.title))
 *  - If two opps share the same base slug, the second gets "-2", third "-3", etc.
 *  - This is deterministic as long as the API returns opps in a stable order
 *    (which it does — sorted by ID).
 *  - Opps with no slots are excluded entirely.
 */
export function transformAllToGroupedProjects(opps: GisOpportunity[]): GroupedProject[] {
  const slugCounts = new Map<string, number>();
  const result: GroupedProject[] = [];

  for (const opp of opps) {
    // Phase 5: skip opportunities with no slots
    if (!hasSlots(opp)) continue;

    const rawTitle = opp.title?.trim() || "Untitled Opportunity";
    const baseSlug = slugify(cleanTitle(rawTitle));

    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);

    // First occurrence gets the clean slug; duplicates get a numeric suffix
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    result.push(transformToGroupedProject(opp, slug));
  }

  return result;
}
