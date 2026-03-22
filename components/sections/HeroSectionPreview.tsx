"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { AiesecHuman } from "@/components/ui/AiesecHuman";
import type {
  HeroLayoutConfig,
  AnyLayer,
  LayerProps,
  TextLayerProps,
  BadgeGroupConfig,
} from "@/lib/hero-layout-types";
import { isImageLayer, isBadgeGroup, isTextOverlay } from "@/lib/hero-layout-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useLayerY(yFactor: number) {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 800], [0, yFactor * 120]);
}

function SafeImg({
  src,
  alt,
  style,
  className,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className={className}
        style={{ ...style, background: "rgba(0,0,0,0.05)", borderRadius: 8 }}
        aria-hidden="true"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={() => setErr(true)}
    />
  );
}

function layerStyle(props: LayerProps, isBg = false): React.CSSProperties {
  if (isBg) {
    return {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: props.opacity,
      zIndex: props.zIndex,
    };
  }
  return {
    position: "absolute",
    left: `${props.x}%`,
    top: `${props.y}%`,
    width: `${props.width}%`,
    transform: `translate(-50%, -50%) rotate(${props.rotation}deg)`,
    opacity: props.opacity,
    zIndex: props.zIndex,
  };
}

// ---------------------------------------------------------------------------
// Layer renderers
// ---------------------------------------------------------------------------

function BadgeGroupLayer({
  layer,
  props,
  reducedMotion,
}: {
  layer: BadgeGroupConfig;
  props: LayerProps;
  reducedMotion: boolean;
}) {
  const y = useLayerY(reducedMotion ? 0 : layer.parallax.yFactor);
  const { badges, arrangement } = layer;
  const { radius, startAngleDeg, centerBadgeIndex } = arrangement;
  const ringBadges = badges.filter((_b, i) => i !== centerBadgeIndex);
  const angleStep = ringBadges.length > 0 ? 360 / ringBadges.length : 0;

  return (
    <motion.div style={{ y, ...layerStyle(props) }} aria-hidden="true">
      <div className="relative w-full" style={{ paddingBottom: "100%" }}>
        {badges[centerBadgeIndex] && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "12%",
              height: "12%",
            }}
          >
            <SafeImg
              src={badges[centerBadgeIndex].src}
              alt={badges[centerBadgeIndex].alt}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        {ringBadges.map((badge, i) => {
          const angleDeg = startAngleDeg + i * angleStep;
          const angleRad = (angleDeg * Math.PI) / 180;
          const cx = 50 + radius * Math.cos(angleRad);
          const cy = 50 + radius * Math.sin(angleRad);
          const isLast = i === ringBadges.length - 1;
          return (
            <div
              key={badge.src}
              className={isLast ? "hidden sm:block" : "block"}
              style={{
                position: "absolute",
                left: `${cx}%`,
                top: `${cy}%`,
                transform: "translate(-50%,-50%)",
                width: "9%",
                height: "9%",
              }}
            >
              <SafeImg src={badge.src} alt={badge.alt} className="w-full h-full object-contain" />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function LayerRenderer({
  layer,
  mode,
  reducedMotion,
}: {
  layer: AnyLayer;
  mode: "desktop" | "mobile";
  reducedMotion: boolean;
}) {
  const props = layer[mode] as LayerProps;
  const y = useLayerY(reducedMotion ? 0 : layer.parallax.yFactor);
  if (!props.visible) return null;

  if (isImageLayer(layer)) {
    const isBg = layer.type === "background";
    return (
      <motion.div style={{ y: isBg ? 0 : y, ...layerStyle(props, isBg) }} aria-hidden="true">
        <SafeImg src={layer.assetPath} alt="" className="w-full h-full object-cover" />
      </motion.div>
    );
  }

  if (isBadgeGroup(layer)) {
    return <BadgeGroupLayer layer={layer} props={props} reducedMotion={reducedMotion} />;
  }

  if (isTextOverlay(layer)) {
    const textProps = props as TextLayerProps;
    return (
      <motion.div style={{ y, ...layerStyle(props), pointerEvents: "none" }}>
        <div
          className="flex flex-col items-center gap-4 px-8 py-6 rounded-3xl bg-white/90 backdrop-blur-sm border border-gray-100 text-center"
          style={{ maxWidth: textProps.maxWidth, textAlign: textProps.textAlign }}
        >
          <AiesecHuman size={56} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Behind each exchange a <span className="text-accent">STORY</span>
          </h1>
          {textProps.showSubtitle && (
            <p className="text-sm text-gray-500">
              Discover Tunisia through the eyes of those who lived it.
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

interface HeroSectionPreviewProps {
  config: HeroLayoutConfig;
  mode?: "desktop" | "mobile";
}

export function HeroSectionPreview({ config, mode = "desktop" }: HeroSectionPreviewProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const sorted = [...config.layers].sort(
    (a, b) => (a[mode] as LayerProps).zIndex - (b[mode] as LayerProps).zIndex
  );

  return (
    <div className="relative w-full min-h-full overflow-hidden bg-white">
      {sorted.map((layer) => (
        <LayerRenderer key={layer.id} layer={layer} mode={mode} reducedMotion={reducedMotion} />
      ))}
    </div>
  );
}
