export type SDG =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

export type ProjectCategory = "volunteer" | "talent" | "teaching";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  sdgs: SDG[];
  startDate: string;
  endDate: string;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
}

/**
 * Static project seed data intentionally disabled.
 * Public pages should rely on API / GIS data only.
 */
export const projects: Project[] = [];