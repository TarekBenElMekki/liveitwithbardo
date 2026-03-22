/**
 * Raw types from the AIESEC GIS GraphQL API.
 *
 * Endpoint: https://gis-api.aiesec.org/graphql
 * Auth:     ?access_token=<AIESEC_GIS_TOKEN> (query parameter)
 *
 * Only the fields we actually request are typed here.
 */

export interface GisSlot {
  start_date: string | null;   // ISO date
  end_date: string | null;     // ISO date
  status: string | null;       // "live" | "inactive" | ...
  openings: number | null;
}

export interface GisOpportunity {
  id: string;
  title: string;
  description: string | null;
  status: string | null;           // "open" | "inactive" | ...
  openings: number | null;
  available_openings: number | null;
  earliest_start_date: string | null;
  latest_end_date: string | null;
  experience_type: string | null;  // "physical" | "remote" | "semi-remote"
  programme: {
    id: string;
    short_name: string | null;
  } | null;
  host_lc: {
    id: string;
    name: string;
    full_name: string | null;
  } | null;
  /** sdg_info.sdg_target.goal_index is the SDG number (1–17) */
  sdg_info: {
    sdg_target: {
      goal_index: number | null;
    } | null;
  } | null;
  logistics_info: {
    accommodation_covered: string | null;  // "covered" | "not_covered" | null
    food_covered: string | null;
    transportation_covered: string | null;
  } | null;
  /** JSON scalar — returned as a plain object, not a typed sub-selection */
  fee_and_health_insurance: {
    programme_fee: number | null;
    project_fee: number | null;
    total: number | null;
    currency: string | null;
    country: string | null;
  } | null;
  /** JSON scalar — returned as a plain object */
  cover_photo: {
    url: string;
    filename: string | null;
    is_default: boolean | null;
  } | null;
  all_slots: {
    nodes: GisSlot[];
  } | null;
}

/** Shape returned by the allOpportunity query */
export interface GisOpportunitiesResponse {
  data: {
    allOpportunity: {
      paging: {
        total_items: number;
        total_pages: number;
        current_page: number;
      };
      data: GisOpportunity[];
    };
  };
  errors?: { message: string }[];
}
