/**
 * Grouped project type — one entry per OPP ID.
 * Replaces the flat Project shape for the UI layer.
 */

import type { SDG, ProjectCategory } from "@/data/projects";

export interface ProjectSlot {
  startDate: string | null;   // ISO YYYY-MM-DD or null
  endDate: string | null;
  openings: number | null;
  available: number | null;
}

export interface GroupedProject {
  /** "opp-<id>" */
  id: string;
  /** Raw GIS opportunity ID (numeric string) */
  oppId: string;
  /** URL-safe slug: slugified clean title, disambiguated if needed */
  slug: string;
  /** Title with square-bracket content stripped */
  title: string;
  description: string;
  image: string;
  alt: string;
  sdgs: SDG[];
  /** Earliest start across all slots */
  startDate: string;
  /** Latest end across all slots */
  endDate: string;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
  /** GIS programme short name, e.g. "GV", "GT", "GE" */
  programme: string;
  /** Sum of openings across all slots (or opp-level openings) */
  totalOpenings: number | null;
  /** Sum of available_openings across all slots */
  totalAvailable: number | null;
  /** Sum of slot.openings across all slots — used for UI availability display */
  availableSlots: number;
  /** Per-slot breakdown */
  slots: ProjectSlot[];
  fee: {
    /**
     * Project Fee in EUR from the GIS fee_and_health_insurance JSON scalar.
     * Uses `project_fee` field when currency is EUR.
     * Falls back to `programme_fee` if `project_fee` is null and currency is EUR.
     * null if no EUR fee is available — never invented or converted.
     */
    amount: number | null;
    /** Always "EUR" when amount is set, null otherwise */
    currency: "EUR" | null;
  };
  logistics: {
    accommodation: boolean;
    food: boolean;
    transport: boolean;
  };
  /** External apply URL — only set for GV programme */
  externalApplyUrl: string | null;
}
