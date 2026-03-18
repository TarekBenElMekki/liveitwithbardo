"use client";

import { useState } from "react";

/**
 * AIESEC Human mark component.
 *
 * Source asset: aiesec-human-blue.ai (not used in runtime — design reference only)
 *
 * Fallback chain:
 *   1. /logos/aiesec-human-blue.svg  (primary — vector, crisp at any size)
 *   2. /logos/aiesec-human-blue.png  (raster fallback)
 *   3. Inline SVG reproduction       (always available, no file dependency)
 */

interface AiesecHumanProps {
  size?: number;
  className?: string;
}

/** Stage 3: inline SVG — always available, no file dependency */
function AiesecHumanInline({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <circle cx="50" cy="50" r="50" fill="var(--accent)" />
      <circle cx="50" cy="32" r="14" fill="white" />
      <path d="M18 88 C18 66 32 56 50 56 C68 56 82 66 82 88" fill="white" />
    </svg>
  );
}

/** Stage 2: PNG raster fallback */
function AiesecHumanPng({
  size,
  className,
  onError,
}: {
  size: number;
  className: string;
  onError: () => void;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/aiesec-human-blue.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      onError={onError}
      style={{ display: "block" }}
    />
  );
}

export function AiesecHuman({ size = 48, className = "" }: AiesecHumanProps) {
  const [svgError, setSvgError] = useState(false);
  const [pngError, setPngError] = useState(false);

  // Stage 3: inline SVG
  if (svgError && pngError) {
    return <AiesecHumanInline size={size} className={className} />;
  }

  // Stage 2: PNG
  if (svgError) {
    return (
      <AiesecHumanPng
        size={size}
        className={className}
        onError={() => setPngError(true)}
      />
    );
  }

  // Stage 1: SVG (primary)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logos/aiesec-human-blue.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      onError={() => setSvgError(true)}
      style={{ display: "block" }}
    />
  );
}
