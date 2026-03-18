"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Place } from "@/data/places";

interface PlaceCardProps {
  place: Place;
  index: number;
  animate?: boolean;
}

export function PlaceCard({ place, index, animate = true }: PlaceCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.article
      variants={shouldReduceMotion ? undefined : variants}
      initial={shouldReduceMotion ? undefined : "hidden"}
      animate={animate && !shouldReduceMotion ? "visible" : undefined}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-hidden bg-white border border-[var(--border)] cursor-pointer"
    >
      {/* Placeholder image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100 flex items-end justify-start">
        <span className="text-xs text-gray-400 px-3 pb-2 line-clamp-1">{place.alt}</span>
        {/* Name overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/30 to-transparent">
          <h3 className="text-lg font-bold text-white">{place.name}</h3>
          <p className="text-sm text-white/80 leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {place.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
