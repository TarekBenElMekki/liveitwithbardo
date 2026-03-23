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
 * 7. Slug no longer includes OPP ID
 * 8. Duplicate titles are disambiguated with numeric suffix
 * 9. Opportunities with no slots are excluded
 * 10. Project fee uses EUR project_fee field only
 */

import { describe, it, expect } from "vitest";
import {
  cleanTitle,
  slugify,
  transformToGroupedProject,
  transformAllToGroupedProjects,
  hasSlots,
} from "../lib/projects/group-transform";
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
      project_fee: 150,
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

// ── slug ──────────────────────────────────────────────────────────────────────

describe("slug generation", () => {
  it("slug does NOT include OPP ID", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.slug).toBe("scale-up");
    expect(result.slug).not.toContain("12345");
  });

  it("slug is the slugified clean title", () => {
    const slug = slugify(cleanTitle("Scale Up! [6 weeks]"));
    expect(slug).toBe("scale-up");
  });

  it("duplicate titles get numeric suffix via transformAllToGroupedProjects", () => {
    const opps = [
      makeOpp({ id: "1", title: "Scale Up! [6 weeks]" }),
      makeOpp({ id: "2", title: "Scale Up! [8 weeks]" }), // same clean title
      makeOpp({ id: "3", title: "Scale Up! [10 weeks]" }), // same clean title
    ];
    const results = transformAllToGroupedProjects(opps);
    expect(results).toHaveLength(3);
    expect(results[0].slug).toBe("scale-up");
    expect(results[1].slug).toBe("scale-up-2");
    expect(results[2].slug).toBe("scale-up-3");
  });

  it("unique titles get clean slugs without suffix", () => {
    const opps = [
      makeOpp({ id: "1", title: "Scale Up! [6 weeks]" }),
      makeOpp({ id: "2", title: "Global Classroom [4 weeks]" }),
    ];
    const results = transformAllToGroupedProjects(opps);
    expect(results[0].slug).toBe("scale-up");
    expect(results[1].slug).toBe("global-classroom");
  });
});

// ── slot filtering ────────────────────────────────────────────────────────────

describe("slot filtering", () => {
  it("hasSlots returns true when slots exist", () => {
    expect(hasSlots(makeOpp())).toBe(true);
  });

  it("hasSlots returns false when all_slots is null", () => {
    expect(hasSlots(makeOpp({ all_slots: null }))).toBe(false);
  });

  it("hasSlots returns false when nodes array is empty", () => {
    expect(hasSlots(makeOpp({ all_slots: { nodes: [] } }))).toBe(false);
  });

  it("transformAllToGroupedProjects excludes opps with no slots", () => {
    const opps = [
      makeOpp({ id: "1", title: "Has Slots [4 weeks]" }),
      makeOpp({ id: "2", title: "No Slots [4 weeks]", all_slots: { nodes: [] } }),
      makeOpp({ id: "3", title: "Also No Slots", all_slots: null }),
    ];
    const results = transformAllToGroupedProjects(opps);
    expect(results).toHaveLength(1);
    expect(results[0].oppId).toBe("1");
  });
});

// ── fee ───────────────────────────────────────────────────────────────────────

describe("project fee", () => {
  it("uses project_fee when currency is EUR", () => {
    const result = transformToGroupedProject(
      makeOpp({
        fee_and_health_insurance: {
          project_fee: 150,
          programme_fee: 200,
          total: 250,
          currency: "EUR",
          country: "TN",
        },
      }),
      "scale-up"
    );
    expect(result.fee.amount).toBe(150);
    expect(result.fee.currency).toBe("EUR");
  });

  it("falls back to programme_fee when project_fee is null and currency is EUR", () => {
    const result = transformToGroupedProject(
      makeOpp({
        fee_and_health_insurance: {
          project_fee: null,
          programme_fee: 200,
          total: 250,
          currency: "EUR",
          country: "TN",
        },
      }),
      "scale-up"
    );
    expect(result.fee.amount).toBe(200);
    expect(result.fee.currency).toBe("EUR");
  });

  it("returns null when currency is not EUR", () => {
    const result = transformToGroupedProject(
      makeOpp({
        fee_and_health_insurance: {
          project_fee: 500,
          programme_fee: 400,
          total: 600,
          currency: "TND",
          country: "TN",
        },
      }),
      "scale-up"
    );
    expect(result.fee.amount).toBeNull();
    expect(result.fee.currency).toBeNull();
  });

  it("returns null when fee is null", () => {
    const result = transformToGroupedProject(
      makeOpp({ fee_and_health_insurance: null }),
      "scale-up"
    );
    expect(result.fee.amount).toBeNull();
    expect(result.fee.currency).toBeNull();
  });
});

// ── transformToGroupedProject ─────────────────────────────────────────────────

describe("transformToGroupedProject", () => {
  it("produces one grouped project per opp", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.id).toBe("opp-12345");
    expect(result.oppId).toBe("12345");
  });

  it("cleans the title", () => {
    const result = transformToGroupedProject(makeOpp({ title: "Scale Up! [6 weeks]" }), "scale-up");
    expect(result.title).toBe("Scale Up!");
  });

  it("maps opp-level totals correctly", () => {
    const result = transformToGroupedProject(makeOpp({ openings: 10, available_openings: 4 }), "scale-up");
    expect(result.totalOpenings).toBe(10);
    expect(result.totalAvailable).toBe(4);
  });

  it("availableSlots sums slot openings", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    // makeOpp has slots with openings 5 + 5 = 10
    expect(result.availableSlots).toBe(10);
  });

  it("availableSlots handles null slot openings", () => {
    const result = transformToGroupedProject(
      makeOpp({
        all_slots: {
          nodes: [
            { start_date: "2026-06-01", end_date: "2026-06-30", status: "live", openings: null },
            { start_date: "2026-07-01", end_date: "2026-07-15", status: "live", openings: 2 },
          ],
        },
      }),
      "scale-up"
    );
    expect(result.availableSlots).toBe(2);
  });

  it("availableSlots is 0 when no slots", () => {
    const result = transformToGroupedProject(makeOpp({ all_slots: null }), "scale-up");
    expect(result.availableSlots).toBe(0);
  });

  it("maps slots correctly", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.slots).toHaveLength(2);
    expect(result.slots[0].startDate).toBe("2026-06-01");
    expect(result.slots[0].endDate).toBe("2026-06-30");
    expect(result.slots[0].openings).toBe(5);
    expect(result.slots[1].startDate).toBe("2026-07-01");
  });

  it("handles missing slots gracefully", () => {
    const result = transformToGroupedProject(makeOpp({ all_slots: null }), "scale-up");
    expect(result.slots).toHaveLength(0);
    expect(result.startDate).toBe("2026-06-01");
    expect(result.endDate).toBe("2026-07-15");
  });

  it("GV programme produces external apply URL", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "7", short_name: "GV" } }), "scale-up");
    expect(result.externalApplyUrl).toBe("https://aiesec.org/opportunity/global-volunteer/12345");
  });

  it("GT programme produces null externalApplyUrl", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "8", short_name: "GT" } }), "scale-up");
    expect(result.externalApplyUrl).toBeNull();
  });

  it("GE programme produces null externalApplyUrl", () => {
    const result = transformToGroupedProject(makeOpp({ programme: { id: "9", short_name: "GE" } }), "scale-up");
    expect(result.externalApplyUrl).toBeNull();
  });

  it("maps logistics correctly", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.logistics.accommodation).toBe(true);
    expect(result.logistics.food).toBe(true);
    expect(result.logistics.transport).toBe(false);
  });

  it("maps SDG correctly", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.sdgs).toContain(4);
  });

  it("isOpen is true when status=open and available_openings > 0", () => {
    const result = transformToGroupedProject(makeOpp({ status: "open", available_openings: 4 }), "scale-up");
    expect(result.isOpen).toBe(true);
  });

  it("isOpen is false when available_openings is 0", () => {
    const result = transformToGroupedProject(makeOpp({ status: "open", available_openings: 0 }), "scale-up");
    expect(result.isOpen).toBe(false);
  });

  it("derives city from host_lc name", () => {
    const result = transformToGroupedProject(makeOpp(), "scale-up");
    expect(result.city).toBe("Bardo");
  });
});
