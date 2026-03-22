"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/lib/utils";
import type { SDG } from "@/data/projects";
import { cn } from "@/lib/utils";

// SDG official colors (UN palette)
const SDG_COLORS: Record<SDG, { bg: string; text: string; border: string }> = {
  1:  { bg: "#E5243B", text: "#fff", border: "#E5243B" },
  2:  { bg: "#DDA63A", text: "#fff", border: "#DDA63A" },
  3:  { bg: "#4C9F38", text: "#fff", border: "#4C9F38" },
  4:  { bg: "#C5192D", text: "#fff", border: "#C5192D" },
  5:  { bg: "#FF3A21", text: "#fff", border: "#FF3A21" },
  6:  { bg: "#26BDE2", text: "#fff", border: "#26BDE2" },
  7:  { bg: "#FCC30B", text: "#1a1a1a", border: "#FCC30B" },
  8:  { bg: "#A21942", text: "#fff", border: "#A21942" },
  9:  { bg: "#FD6925", text: "#fff", border: "#FD6925" },
  10: { bg: "#DD1367", text: "#fff", border: "#DD1367" },
  11: { bg: "#FD9D24", text: "#fff", border: "#FD9D24" },
  12: { bg: "#BF8B2E", text: "#fff", border: "#BF8B2E" },
  13: { bg: "#3F7E44", text: "#fff", border: "#3F7E44" },
  14: { bg: "#0A97D9", text: "#fff", border: "#0A97D9" },
  15: { bg: "#56C02B", text: "#fff", border: "#56C02B" },
  16: { bg: "#00689D", text: "#fff", border: "#00689D" },
  17: { bg: "#19486A", text: "#fff", border: "#19486A" },
};

// SDG short labels
const SDG_LABELS: Record<SDG, string> = {
  1:  "No Poverty",
  2:  "Zero Hunger",
  3:  "Good Health",
  4:  "Quality Education",
  5:  "Gender Equality",
  6:  "Clean Water",
  7:  "Clean Energy",
  8:  "Decent Work",
  9:  "Industry & Innovation",
  10: "Reduced Inequalities",
  11: "Sustainable Cities",
  12: "Responsible Consumption",
  13: "Climate Action",
  14: "Life Below Water",
  15: "Life on Land",
  16: "Peace & Justice",
  17: "Partnerships",
};

interface ProjectFiltersProps {
  filters: FilterState;
  /** Only SDGs present in the current project list */
  availableSdgs: SDG[];
  onChange: (filters: FilterState) => void;
}

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  sdgs: [],
  city: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

export function ProjectFilters({ filters, availableSdgs, onChange }: ProjectFiltersProps) {
  const toggleSdg = (sdg: SDG) => {
    const next = filters.sdgs.includes(sdg)
      ? filters.sdgs.filter((s) => s !== sdg)
      : [...filters.sdgs, sdg];
    onChange({ ...filters, sdgs: next });
  };

  const hasFilters = filters.sdgs.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* SDG multi-select */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">
          Filter by SDG
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by Sustainable Development Goal">
          {availableSdgs.map((sdg) => {
            const active = filters.sdgs.includes(sdg);
            const colors = SDG_COLORS[sdg];
            return (
              <button
                key={sdg}
                type="button"
                onClick={() => toggleSdg(sdg)}
                aria-pressed={active}
                title={`SDG ${sdg}: ${SDG_LABELS[sdg]}`}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 focus-ring",
                  active ? "opacity-100 shadow-sm" : "opacity-60 hover:opacity-90"
                )}
                style={
                  active
                    ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
                    : { backgroundColor: "transparent", color: colors.bg, borderColor: colors.bg }
                }
              >
                <span
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                  aria-hidden="true"
                >
                  {sdg}
                </span>
                {SDG_LABELS[sdg]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter chips + clear */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {filters.sdgs.map((sdg) => {
            const colors = SDG_COLORS[sdg as SDG];
            return (
              <span
                key={sdg}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                SDG {sdg}
                <button
                  type="button"
                  onClick={() => toggleSdg(sdg as SDG)}
                  aria-label={`Remove SDG ${sdg} filter`}
                  className="hover:opacity-70 transition-opacity focus-ring rounded-full ml-0.5"
                >
                  <X size={10} aria-hidden="true" />
                </button>
              </span>
            );
          })}
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
