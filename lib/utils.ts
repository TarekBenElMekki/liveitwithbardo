import type { KnowledgeEntry } from "@/data/knowledge-base";

/**
 * Lightweight className merger — joins truthy class strings.
 * Drop-in for clsx without the extra dependency.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Matches user input against knowledge base entries by keyword substring search.
 * Accepts KnowledgeEntry[] (superset of FaqEntry[]) — backward compatible.
 * Returns the first matching entry, or null if no match is found.
 */
export function matchFaq(
  input: string,
  entries: KnowledgeEntry[]
): KnowledgeEntry | null {
  const normalized = input.toLowerCase().trim();
  if (!normalized) return null;

  return (
    entries.find((entry) =>
      entry.keywords.some((keyword) =>
        normalized.includes(keyword.toLowerCase())
      )
    ) ?? null
  );
}

/**
 * Filters projects by a FilterState object.
 * Pure function — no side effects.
 */
export interface FilterState {
  category: string;   // "all" or ProjectCategory
  sdgs: number[];
  city: string;       // "all" or city name
  status: string;     // "all" | "open" | "closed"
  startDate: string;  // ISO date string or ""
  endDate: string;    // ISO date string or ""
}

export function filterProjects<T extends {
  category: string;
  sdgs: number[];
  city: string;
  isOpen: boolean;
  startDate: string;
  endDate: string;
}>(projects: T[], filters: FilterState): T[] {
  return projects.filter((p) => {
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (filters.sdgs.length > 0 && !filters.sdgs.some((s) => p.sdgs.includes(s))) return false;
    if (filters.city !== "all" && p.city !== filters.city) return false;
    if (filters.status === "open" && !p.isOpen) return false;
    if (filters.status === "closed" && p.isOpen) return false;
    if (filters.startDate && p.endDate < filters.startDate) return false;
    if (filters.endDate && p.startDate > filters.endDate) return false;
    return true;
  });
}
