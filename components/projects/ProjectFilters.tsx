"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/lib/utils";
import type { SDG, ProjectCategory } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  filters: FilterState;
  cities: string[];
  onChange: (filters: FilterState) => void;
}

const CATEGORIES: { value: ProjectCategory | "all"; label: string }[] = [
  { value: "all",        label: "All types" },
  { value: "volunteer",  label: "Volunteer" },
  { value: "internship", label: "Internship" },
  { value: "cultural",   label: "Cultural" },
];

const STATUSES = [
  { value: "all",    label: "Any status" },
  { value: "open",   label: "Open" },
  { value: "closed", label: "Closed" },
];

const SDG_OPTIONS: SDG[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  sdgs: [],
  city: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

export function ProjectFilters({ filters, cities, onChange }: ProjectFiltersProps) {
  const set = (partial: Partial<FilterState>) =>
    onChange({ ...filters, ...partial });

  const toggleSdg = (sdg: SDG) => {
    const next = filters.sdgs.includes(sdg)
      ? filters.sdgs.filter((s) => s !== sdg)
      : [...filters.sdgs, sdg];
    set({ sdgs: next });
  };

  // Build active chip list
  const chips: { label: string; onRemove: () => void }[] = [];
  if (filters.category !== "all")
    chips.push({ label: filters.category, onRemove: () => set({ category: "all" }) });
  if (filters.city !== "all")
    chips.push({ label: filters.city, onRemove: () => set({ city: "all" }) });
  if (filters.status !== "all")
    chips.push({ label: filters.status, onRemove: () => set({ status: "all" }) });
  if (filters.startDate)
    chips.push({ label: `From ${filters.startDate}`, onRemove: () => set({ startDate: "" }) });
  if (filters.endDate)
    chips.push({ label: `Until ${filters.endDate}`, onRemove: () => set({ endDate: "" }) });
  filters.sdgs.forEach((sdg) =>
    chips.push({ label: `SDG ${sdg}`, onRemove: () => toggleSdg(sdg as SDG) })
  );

  const hasFilters = chips.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-category" className="text-xs text-gray-500 font-medium">
            Type
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => set({ category: e.target.value as FilterState["category"] })}
            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus-ring focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-city" className="text-xs text-gray-500 font-medium">
            City
          </label>
          <select
            id="filter-city"
            value={filters.city}
            onChange={(e) => set({ city: e.target.value })}
            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus-ring focus:outline-none"
          >
            <option value="all">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-xs text-gray-500 font-medium">
            Status
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => set({ status: e.target.value as FilterState["status"] })}
            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus-ring focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">Date range</span>
          <div className="flex gap-2">
            <input
              type="date"
              aria-label="Start date"
              value={filters.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
              className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-2 py-2 focus-ring focus:outline-none min-w-0"
            />
            <input
              type="date"
              aria-label="End date"
              value={filters.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
              className="flex-1 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-2 py-2 focus-ring focus:outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* SDG multi-select */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 font-medium">SDGs</span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by SDG">
          {SDG_OPTIONS.map((sdg) => (
            <button
              key={sdg}
              type="button"
              onClick={() => toggleSdg(sdg)}
              aria-pressed={filters.sdgs.includes(sdg)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors duration-150 focus-ring",
                filters.sdgs.includes(sdg)
                  ? "bg-accent text-white border-accent"
                  : "bg-transparent text-gray-400 border-gray-100 hover:border-accent/50 hover:text-accent"
              )}
            >
              SDG {sdg}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--accent)] text-white border border-[var(--accent)]"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                aria-label={`Remove filter: ${chip.label}`}
                className="hover:text-white/70 transition-colors focus-ring rounded-full"
              >
                <X size={10} aria-hidden="true" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-xs text-gray-400 hover:text-gray-900 transition-colors focus-ring rounded-md px-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
