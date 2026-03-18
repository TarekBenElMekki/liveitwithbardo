"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/Slider";

// ─── Config ───────────────────────────────────────────────────────────────────

interface SliderDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  tip?: string;
}

interface Group {
  id: string;
  label: string;
  icon: string;
  sliders: SliderDef[];
}

const GROUPS: Group[] = [
  {
    id: "housing",
    label: "Housing",
    icon: "🏠",
    sliders: [
      { key: "rent",    label: "Monthly rent",          min: 100, max: 1200, step: 50,  default: 400 },
      { key: "water",   label: "Water & utilities",     min: 20,  max: 150,  step: 5,   default: 40  },
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍽️",
    sliders: [
      { key: "groceries",   label: "Groceries",              min: 50,  max: 400, step: 10, default: 150 },
      { key: "lunch",       label: "Lunch outside",          min: 0,   max: 300, step: 10, default: 80  },
      { key: "dinner",      label: "Dinner outside",         min: 0,   max: 300, step: 10, default: 60  },
      { key: "breakfast",   label: "Breakfast / bakery",     min: 0,   max: 150, step: 5,  default: 30  },
      { key: "snacks",      label: "Snacks & street food",   min: 0,   max: 150, step: 5,  default: 30  },
      { key: "coffee",      label: "Coffee & hot drinks",    min: 0,   max: 150, step: 5,  default: 40  },
      { key: "water_drink", label: "Bottled water",          min: 0,   max: 60,  step: 5,  default: 15  },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚌",
    sliders: [
      { key: "public_transport", label: "Public transport (metro / bus)", min: 10, max: 100, step: 5,  default: 40 },
      { key: "taxi",             label: "Taxi / ride-hailing",            min: 0,  max: 200, step: 10, default: 50 },
    ],
  },
  {
    id: "connectivity",
    label: "Mobile & Internet",
    icon: "📱",
    sliders: [
      { key: "mobile", label: "Mobile plan",    min: 10, max: 80,  step: 5, default: 25 },
      { key: "internet", label: "Home internet", min: 0,  max: 100, step: 5, default: 30 },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment & Leisure",
    icon: "🎬",
    sliders: [
      { key: "cinema",    label: "Cinema / events",    min: 0, max: 100, step: 5,  default: 20 },
      { key: "outings",   label: "Casual outings",     min: 0, max: 200, step: 10, default: 50 },
      { key: "gym",       label: "Gym / fitness",      min: 0, max: 150, step: 10, default: 0  },
      { key: "weekend",   label: "Weekend activities", min: 0, max: 200, step: 10, default: 40 },
    ],
  },
  {
    id: "essentials",
    label: "Daily Essentials",
    icon: "🧴",
    sliders: [
      { key: "toiletries", label: "Toiletries & hygiene", min: 10, max: 100, step: 5, default: 30 },
      { key: "laundry",    label: "Laundry",               min: 0,  max: 60,  step: 5, default: 15 },
      { key: "misc",       label: "Miscellaneous",         min: 0,  max: 150, step: 5, default: 30 },
    ],
  },
];

const ALL_SLIDERS = GROUPS.flatMap((g) => g.sliders);
type SliderKey = string;
type SliderValues = Record<SliderKey, number>;

const DEFAULT_VALUES: SliderValues = Object.fromEntries(
  ALL_SLIDERS.map((s) => [s.key, s.default])
);

const TND_TO_EUR = 0.30;
const TND_TO_USD = 0.32;

// ─── Component ────────────────────────────────────────────────────────────────

export function EstimatorSection() {
  const [values, setValues] = useState<SliderValues>(DEFAULT_VALUES);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["housing", "food"]));

  const total = Object.values(values).reduce((a, b) => a + b, 0);
  const totalEur = Math.round(total * TND_TO_EUR);
  const totalUsd = Math.round(total * TND_TO_USD);

  const handleChange = (key: SliderKey, value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section
      id="estimator"
      aria-labelledby="estimator-heading"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Budget Planner
          </p>
          <h2
            id="estimator-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Cost of Living Estimator
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Build your personal monthly budget in Tunisia.
            All amounts are in Tunisian Dinar (TND).
          </p>
        </div>

        {/* Sticky total bar */}
        <div className="sticky top-[72px] z-10 mb-6 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">
              Estimated Monthly Total
            </p>
            <p className="text-4xl font-bold text-gray-900 tabular-nums leading-none">
              {total.toLocaleString()}{" "}
              <span className="text-accent text-xl font-semibold">TND</span>
            </p>
          </div>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>≈ <strong className="text-gray-700">{totalEur} EUR</strong></span>
            <span>≈ <strong className="text-gray-700">{totalUsd} USD</strong></span>
          </div>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-3">
          {GROUPS.map((group) => {
            const isOpen = openGroups.has(group.id);
            const groupTotal = group.sliders.reduce((sum, s) => sum + (values[s.key] ?? 0), 0);
            return (
              <div
                key={group.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden="true">{group.icon}</span>
                    <span className="font-semibold text-gray-900">{group.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-accent tabular-nums">
                      {groupTotal} TND
                    </span>
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      aria-hidden="true"
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>

                {/* Sliders */}
                {isOpen && (
                  <div className="px-5 pb-6 flex flex-col gap-7 border-t border-gray-100 pt-5">
                    {group.sliders.map((s) => (
                      <Slider
                        key={s.key}
                        id={`slider-${s.key}`}
                        label={s.label}
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={values[s.key]}
                        unit="TND"
                        onChange={(v) => handleChange(s.key, v)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Estimates are approximate and vary by neighbourhood and lifestyle.
          Tunis is one of the most affordable capitals in the Mediterranean.
        </p>
      </div>
    </section>
  );
}
