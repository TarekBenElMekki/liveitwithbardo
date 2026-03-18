"use client";

import { ImageIcon } from "lucide-react";
import type { HeroMedia } from "@/data/hero-media";

interface MediaCardProps {
  media: HeroMedia;
  isDesktop: boolean;
  priority?: boolean;
}

/** Gray placeholder — replaces missing image/video assets */
export function MediaCard({ media, isDesktop }: MediaCardProps) {
  return (
    <div
      className={`relative flex-shrink-0 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm flex items-center justify-center transition-transform duration-300 hover:scale-105 ${
        isDesktop ? "w-64 h-40 lg:w-72 lg:h-48" : "w-full h-32"
      }`}
      aria-label={media.alt}
      role="img"
    >
      <div className="flex flex-col items-center gap-2 text-gray-300">
        <ImageIcon size={24} aria-hidden="true" />
        <span className="text-xs text-gray-400 text-center px-3 line-clamp-2">{media.alt}</span>
      </div>
    </div>
  );
}
