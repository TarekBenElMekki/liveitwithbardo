"use client";

import { useState, useMemo } from "react";
import { faqEntries, type FaqTopic } from "@/data/faq";
import { FaqSearch } from "./FaqSearch";
import { FaqCategoryTabs } from "./FaqCategoryTabs";
import { FaqAccordion } from "./FaqAccordion";

type TabValue = FaqTopic | "all";

export function FaqPageClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TabValue>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return faqEntries.filter((entry) => {
      const matchesCategory = category === "all" || entry.topic === category;
      const matchesQuery =
        !q ||
        entry.question.toLowerCase().includes(q) ||
        entry.keywords.some((kw) => kw.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <section aria-label="FAQ" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <FaqSearch value={query} onChange={setQuery} />
        <FaqCategoryTabs active={category} onChange={setCategory} />
        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
        <FaqAccordion entries={filtered} />
      </div>
    </section>
  );
}
