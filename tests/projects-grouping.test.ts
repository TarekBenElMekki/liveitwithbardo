/**
 * Unit tests for the grouped projects pipeline.
 *
 * Tests:
 * 1. cleanTitle removes square-bracket content
 * 2. transformToGroupedProject produces correct shape
 * 3. Totals (openings, available) are taken from opp-level fields
 * 4. Slots are mapped correctly
 * 5. GV programme produces external apply URL
 * 6. Non-GV programme produces null externalApplyUrl
 * 7. Slug is stable and includes oppId
 */

import { describe, it, expect } from "vitest";
import { cleanTitle, transformToGroupedProject } from "../lib/projects/group-transform";
import type { GisOpportunity } from "../lib/projects/gis-types";

// ── Minimal GIS opportunity factory ──────────────────────────────────────────

function makeOpp(overrides: Partial<GisOpportunity> = {}): GisOpportunity {
  return {
    id: "12345",
    title: "Scale Up! [6 weeks]",
    description: "A great opportunity.",
    status: "open",
    openings: 10,
    available_openings: 4,
    earliest_start_date: "2026-06-01",
    latest_end_date: "2026-07-15",
    experience_type: "physical",
    programme: { id: "7", short_name: "GV" },
    host_lc: { id: "1270", name: "AIESEC in Bardo", full_name: "AIESEC in Bardo" },
    sdg_info: { sdg_target: { goal_index: 4 } },
    logistics_info: {
      accommodation_covered: "covered",
      food_covered: "covered",
      transportation_covered: "not_covered",
    },
    fee_and_health_insurance: {
      programme_fee: 200,
      project_fee: null,
      total: 250,
      currency: "EUR",
      country: "TN",
    },
    cover_photo: null,
    all_slots: {
      nodes: [
        { start_date: "2026-06-01", end_date: "2026-06-30", status: "live", openings: 5 },
        { start_date: "2026-07-01", end_date: "2026-07-15", status: "live", openings: 5 },
      ],
    },
    ...overrides,
  };
}

// ── cleanTitle ────────────────────────────────────────────────────────────────

describe("cleanTitle", () => {
  it("removes square-bracket content and trims", () => {
    expect(cleanTitle("Scale Up! [6 weeks]")).toBe("Scale Up!");
    expect(cleanTitle("Global Classroom [6 weeks]")).toBe("Global Classroom");
    expect(cleanTitle("No brackets here")).toBe("No brackets here");
    expect(cleanTitle("[Prefix] Title")).toBe("Title");
    expect(cleanTitle("Title [A] and [B]")).toBe("Title and");
    expect(cleanTitle("  Spaced  [x]  ")).toBe("Spaced");
  });
});

// ── transformToGroupedProject ─────────────────────────────────────────────────

describe("transformToGroupedProject", () => {
  it("produces one grouped project per opp", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.id).toBe("opp-12345");
    expect(result.oppId).toBe("12345");
  });

  it("cleans the title", () => {
    const result = transformToGroupedProject(makeOpp({ title: "Scale Up! [6 weeks]" }));
    expect(result.title).toBe("Scale Up!");
  });

  it("slug includes oppId", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.slug).toContain("12345");
  });

  it("slug is stable across calls", () => {
    const a = transformToGroupedProject(makeOpp());
    const b = transformToGroupedProject(makeOpp());
    expect(a.slug).toBe(b.slug);
  });

  it("maps opp-level totals correctly", () => {
    const result = transformToGroupedProject(makeOpp({ openings: 10, available_openings: 4 }));
    expect(result.totalOpenings).toBe(10);
    expect(result.totalAvailable).toBe(4);
  });

  it("maps slots correctly", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.slots).toHaveLength(2);
    expect(result.slots[0].startDate).toBe("2026-06-01");
    expect(result.slots[0].endDate).toBe("2026-06-30");
    expect(result.slots[0].openings).toBe(5);
    expect(result.slots[1].startDate).toBe("2026-07-01");
  });

  it("handles missing slots gracefully", () => {
    const result = transformToGroupedProject(makeOpp({ all_slots: null }));
    expect(result.slots).toHaveLength(0);
    // dates fall back to opp-level fields
    expect(result.startDate).toBe("2026-06-01");
    expect(result.endDate).toBe("2026-07-15");
  });

  it("GV programme produces external apply URL", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "7", short_name: "GV" } }));
    expect(result.externalApplyUrl).toBe("https://aiesec.org/opportunity/global-volunteer/12345");
  });

  it("GT programme produces null externalApplyUrl", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "8", short_name: "GT" } }));
    expect(result.externalApplyUrl).toBeNull();
  });

  it("GE programme produces null externalApplyUrl", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "9", short_name: "GE" } }));
    expect(result.externalApplyUrl).toBeNull();
  });

  it("maps logistics correctly", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.logistics.accommodation).toBe(true);
    expect(result.logistics.food).toBe(true);
    expect(result.logistics.transport).toBe(false);
  });

  it("maps fee correctly — prefers total over programme_fee", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.fee.amount).toBe(250);
    expect(result.fee.currency).toBe("EUR");
  });

  it("maps SDG correctly", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.sdgs).toContain(4);
  });

  it("isOpen is true when status=open and available_openings > 0", () => {
    const result = transformToGroupedProject(makeOpp({ status: "open", available_openings: 4 }));
    expect(result.isOpen).toBe(true);
  });

  it("isOpen is false when available_openings is 0", () => {
    const result = transformToGroupedProject(makeOpp({ status: "open", available_openings: 0 }));
    expect(result.isOpen).toBe(false);
  });

  it("derives city from host_lc name", () => {
    const result = transformToGroupedProject(makeOpp());
    expect(result.city).toBe("Bardo");
  });
});
