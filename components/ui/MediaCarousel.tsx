"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  title: string;
  description: string;
  alt?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  aspectRatio?: string;
}

const PLACEHOLDER = "/hero/hero_static_default.png";

export function MediaCarousel({ items, aspectRatio = "aspect-[4/3]" }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const total = items.length;

  const goTo = useCallback(
    (idx: number) => {
      const resolved = ((idx % total) + total) % total;
      const vid = videoRefs.current[current];
      if (vid) vid.pause();
      setCurrent(resolved);
    },
    [current, total]
  );

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const vid = videoRefs.current[current];
    if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  }, [current]);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  if (total === 0) return null;

  const prevIdx = ((current - 1) % total + total) % total;
  const nextIdx = (current + 1) % total;

  const getPos = (i: number): "prev" | "active" | "next" | "hidden" => {
    if (i === current) return "active";
    if (i === prevIdx) return "prev";
    if (i === nextIdx) return "next";
    return "hidden";
  };

  const posClass: Record<string, string> = {
    active: "translate-x-0 scale-100 z-20 opacity-100",
    prev:   "-translate-x-[64%] scale-[0.80] z-10 opacity-50",
    next:   "translate-x-[64%] scale-[0.80] z-10 opacity-50",
    hidden: "translate-x-0 scale-75 z-0 opacity-0 pointer-events-none",
  };

  const activeItem = items[current];

  return (
    <div
      className="relative w-full select-none"
      role="region"
      aria-label="Media carousel"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Track */}
      <div className="relative overflow-hidden px-[14%]">
        <div className={`relative w-full ${aspectRatio}`}>
          {items.map((item, i) => {
            const pos = getPos(i);
            const src = item.src && item.src.trim() !== "" ? item.src : PLACEHOLDER;

            return (
              <div
                key={`${item.src}-${i}`}
                aria-hidden={pos !== "active"}
                onClick={() => pos !== "active" && goTo(i)}
                className={`absolute inset-0 rounded-3xl overflow-hidden bg-gray-100 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${pos !== "active" ? "cursor-pointer" : ""} ${posClass[pos]}`}
              >
                {item.type === "video" ? (
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={src}
                    autoPlay={pos === "active"}
                    muted loop playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={src}
                    alt={item.alt ?? item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 60vw"
                    priority={i === 0}
                  />
                )}

                {/* Active card: bottom gradient for text legibility */}
                {pos === "active" && (
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
                    aria-hidden="true"
                  />
                )}

                {/* Active card: title overlay */}
                {pos === "active" && (
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pointer-events-none">
                    <p className="text-white font-semibold text-base leading-snug drop-shadow-sm">
                      {item.title}
                    </p>
                  </div>
                )}

                {/* Side cards: dim overlay */}
                {pos !== "active" && (
                  <div className="absolute inset-0 bg-black/30 rounded-3xl" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav arrows — positioned at card mid-height, outside the track */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-1 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 shadow-lg hover:bg-white hover:shadow-xl active:scale-95 text-gray-700 flex items-center justify-center transition-all duration-150"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-1 top-[40%] -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/95 shadow-lg hover:bg-white hover:shadow-xl active:scale-95 text-gray-700 flex items-center justify-center transition-all duration-150"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Description below card */}
      <div className="mt-5 px-2">
        <p className="text-sm text-gray-500 leading-relaxed text-center max-w-lg mx-auto min-h-[3rem]">
          {activeItem.description}
        </p>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4" role="tablist" aria-label="Slides">
        {items.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-5 h-1.5 bg-accent" : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
