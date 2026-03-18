"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqEntry } from "@/data/faq";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  entries: FaqEntry[];
}

interface AccordionItemProps {
  entry: FaqEntry;
  isOpen: boolean;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  index: number;
}

function AccordionItem({ entry, isOpen, onToggle, onKeyDown }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const panelId = `faq-panel-${entry.id}`;
  const triggerId = `faq-trigger-${entry.id}`;

  const contentHeight = isOpen && contentRef.current
    ? contentRef.current.scrollHeight
    : 0;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <h3>
        <button
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="w-full flex items-center justify-between gap-4 py-5 text-left text-gray-900 font-medium text-sm sm:text-base focus-ring rounded-md"
        >
          <span>{entry.question}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "flex-shrink-0 text-gray-400 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        ref={contentRef}
        style={{
          maxHeight: isOpen ? contentHeight || "none" : 0,
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
      >
        <p className="pb-5 text-gray-500 text-sm leading-relaxed">
          {entry.answer}
        </p>
      </div>
    </div>
  );
}

export function FaqAccordion({ entries }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (!listRef.current) return;
      const buttons = Array.from(
        listRef.current.querySelectorAll<HTMLButtonElement>("button[aria-expanded]")
      );
      if (e.key === "ArrowDown") {
        e.preventDefault();
        buttons[(index + 1) % buttons.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        buttons[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        buttons[buttons.length - 1]?.focus();
      }
    },
    []
  );

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">🤔</div>
        <p className="text-gray-900 font-semibold mb-1">No results found</p>
        <p className="text-gray-500 text-sm">Try a different search term or category.</p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 px-5"
    >
      {entries.map((entry, i) => (
        <AccordionItem
          key={entry.id}
          entry={entry}
          index={i}
          isOpen={openId === entry.id}
          onToggle={() => toggle(entry.id)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        />
      ))}
    </div>
  );
}
