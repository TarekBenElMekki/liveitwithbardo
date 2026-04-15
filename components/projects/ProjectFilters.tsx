"use client";

import { X } from "lucide-react";
import type { FilterState } from "@/lib/utils";
import type { SDG } from "@/data/projects";
import { cn } from "@/lib/utils";

const SDG_COLORS: Record<SDG, { bg: string; text: string; border: string }> = {
  1:  { bg: "#E5243B", text: "#fff", border: "#E5243B" },
  2:  { bg: "#DDA63A", text: "#fff", border: "#DDA63A" },
  3:  { bg: "#4C9F38", text: "#fff", border: "#4C9F38" },
  4:  { bg: "#C5192D", text: "#fff", border: "#C5192D" },
  5:  { bg: "#FF3A21", text: "#fff", border: "#FF3A21" },
  6:  { bg: "#26BDE2", text: "#fff", border: "#26BDE2" },
  7:  { bg: "#FCC30B", text: "#111", border: "#FCC30B" },
  8:  { bg: "#A21942", text: "#fff", border: "#A21942" },
  9:  { bg: "#FD6925", text: "#fff", border: "#FD6925" },
  10: { bg: "#DD1367", text: "#fff", border: "#DD1367" },
  11: { bg: "#FD9D24", text: "#111", border: "#FD9D24" },
  12: { bg: "#BF8B2E", text: "#fff", border: "#BF8B2E" },
  13: { bg: "#3F7E44", text: "#fff", border: "#3F7E44" },
  14: { bg: "#0A97D9", text: "#fff", border: "#0A97D9" },
  15: { bg: "#56C02B", text: "#111", border: "#56C02B" },
  16: { bg: "#00689D", text: "#fff", border: "#00689D" },
  17: { bg: "#19486A", text: "#fff", border: "#19486A" },
};

interface ProjectFiltersProps {
  filters: FilterState;
  availableSdgs: SDG[];
  onChange: (filters: FilterState) => void;
}

export function ProjectFilters({
  filters,
  availableSdgs,
  onChange,
}: ProjectFiltersProps) {
  if (availableSdgs.length === 0) {
    return null;
  }

  const activeFilters = filters.sdgs.map((sdg) => ({
    key: `sdg-${sdg}`,
    label: `SDG ${sdg}`,
    onRemove: () =>
      onChange({
        ...filters,
        sdgs: filters.sdgs.filter((value) => value !== sdg),
      }),
  }));

  return (
    <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(17,24,39,0.05)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
          SDGs
        </p>

        <div className="flex flex-wrap gap-2">
          {availableSdgs.map((sdg) => {
            const selected = filters.sdgs.includes(sdg);
            const colors = SDG_COLORS[sdg];

            return (
              <button
                key={sdg}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    sdgs: selected
                      ? filters.sdgs.filter((value) => value !== sdg)
                      : [...filters.sdgs, sdg],
                  })
                }
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-transform duration-150 hover:-translate-y-0.5"
                )}
                style={{
                  backgroundColor: selected ? colors.bg : "#ffffff",
                  color: selected ? colors.text : "#374151",
                  borderColor: selected ? colors.border : "#e5e7eb",
                }}
              >
                SDG {sdg}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={filter.onRemove}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            {filter.label}
            <X size={12} aria-hidden="true" />
          </button>
        ))}

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                sdgs: [],
              })
            }
            className="ml-auto inline-flex items-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}