"use client";

import type { FaqTopic } from "@/data/faq";
import { cn } from "@/lib/utils";

type TabValue = FaqTopic | "all";

interface FaqCategoryTabsProps {
  active: TabValue;
  onChange: (value: TabValue) => void;
}

const tabs: { value: TabValue; label: string }[] = [
  { value: "all",     label: "All" },
  { value: "cost",    label: "Cost of Living" },
  { value: "tunisia", label: "Tunisia" },
  { value: "aiesec",  label: "AIESEC" },
  { value: "general", label: "General" },
];

export function FaqCategoryTabs({ active, onChange }: FaqCategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="FAQ categories"
      className="flex flex-wrap gap-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "text-sm px-4 py-2 rounded-full border transition-colors duration-150 focus-ring",
            active === tab.value
              ? "bg-accent text-white border-accent"
              : "bg-transparent text-gray-500 border-gray-200 hover:border-accent/50 hover:text-accent"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
