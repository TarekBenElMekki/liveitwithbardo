/**
 * Project data loader - AIESEC GIS GraphQL API.
 * Fetches open opportunities for AIESEC in Bardo (committee 1270),
 * programmes GV/GT/GE (7, 8, 9).
 * Falls back to static data/projects.ts if AIESEC_GIS_TOKEN is not set.
 */

import { projects as staticProjects } from "@/data/projects";
import type { Project } from "@/data/projects";
import type { GisOpportunity, GisOpportunitiesResponse } from "./gis-types";
import { transformGisOpportunity } from "./transform";
import { transformAllToGroupedProjects } from "./group-transform";
import type { GroupedProject } from "./grouped-types";

const GIS_ENDPOINT = "https://gis-api.aiesec.org/graphql";

const OPPORTUNITIES_QUERY = `
  query GetBardoOpportunities($page: Int, $perPage: Int) {
    allOpportunity(
      filters: {
        status: "open"
        committee: 1270
        programmes: [7, 8, 9]
      }
      pagination: { page: $page, per_page: $perPage }
    ) {
      paging { total_items total_pages current_page }
      data {
        id title description status openings available_openings
        earliest_start_date latest_end_date experience_type
        programme { id short_name }
        host_lc { id name full_name }
        sdg_info { sdg_target { goal_index } }
        logistics_info { accommodation_covered food_covered transportation_covered }
        fee_and_health_insurance
        cover_photo
        all_slots { nodes { start_date end_date status openings } }
      }
    }
  }
`;

async function fetchPage(
  token: string,
  page: number,
  perPage: number,
  revalidate: number
): Promise<GisOpportunitiesResponse> {
  const res = await fetch(`${GIS_ENDPOINT}?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: OPPORTUNITIES_QUERY, variables: { page, perPage } }),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`GIS API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<GisOpportunitiesResponse>;
}

async function fetchAllOpportunities(
  token: string,
  revalidate: number,
  perPage = 50,
  maxPages = 10
): Promise<GisOpportunity[]> {
  const all: GisOpportunity[] = [];
  let page = 1;
  while (page <= maxPages) {
    const response = await fetchPage(token, page, perPage, revalidate);
    if (response.errors?.length) {
      console.error("[loader] GIS API errors:", response.errors);
      break;
    }
    const pageData = response.data?.allOpportunity;
    if (!pageData) break;
    all.push(...pageData.data);
    if (page >= pageData.paging.total_pages) break;
    page++;
  }
  return all;
}

/** Legacy flat loader - kept for backward compat (admin page, static fallback). */
export async function loadProjects(revalidate = 300): Promise<Project[]> {
  const token = process.env.AIESEC_GIS_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[loader] AIESEC_GIS_TOKEN not set - using static fallback");
    }
    return staticProjects;
  }
  try {
    const opps = await fetchAllOpportunities(token, revalidate);
    if (opps.length === 0) {
      console.warn("[loader] GIS API returned 0 opportunities - using static fallback");
      return staticProjects;
    }
    return opps.map(transformGisOpportunity);
  } catch (err) {
    console.error("[loader] Failed to load GIS data:", err);
    return staticProjects;
  }
}

/** Grouped loader - one GroupedProject per OPP ID. Used by the public UI. */
export async function loadGroupedProjects(revalidate = 300): Promise<GroupedProject[]> {
  const token = process.env.AIESEC_GIS_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[loader] AIESEC_GIS_TOKEN not set - no grouped projects available");
    }
    return [];
  }
  try {
    const opps = await fetchAllOpportunities(token, revalidate);
    if (opps.length === 0) {
      console.warn("[loader] GIS API returned 0 opportunities");
      return [];
    }
    return transformAllToGroupedProjects(opps);
  } catch (err) {
    console.error("[loader] Failed to load GIS data:", err);
    return [];
  }
}

export async function loadRawOpportunities(): Promise<GisOpportunity[]> {
  const token = process.env.AIESEC_GIS_TOKEN;
  if (!token) return [];
  try {
    return await fetchAllOpportunities(token, 0);
  } catch (err) {
    console.error("[loader] Failed to load raw GIS data:", err);
    return [];
  }
}
