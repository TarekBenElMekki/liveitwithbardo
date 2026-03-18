"use client";

import { Search, X } from "lucide-react";

interface FaqSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FaqSearch({ value, onChange }: FaqSearchProps) {
  return (
    <div className="relative w-full">
      <Search
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions..."
        aria-label="Search FAQ"
        className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-10 py-3 placeholder-gray-400 focus-ring focus:outline-none hover:border-gray-300 transition-colors duration-150"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus-ring rounded-full"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
