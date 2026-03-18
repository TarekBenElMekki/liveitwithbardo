"use client";

/**
 * WorldMap — real 2D world map using react-simple-maps + world-atlas TopoJSON.
 *
 * Features:
 * - Neutral light base map (all countries)
 * - Partner countries filled in #037EF3
 * - Tunisia highlighted in brand accent #ff3131 with pulsing hub marker
 * - Animated curved arcs from Tunisia to each partner country
 * - Arc colors cycle through brand palette: #F85A40 · #F48924 · #0CB9C1
 * - Responsive SVG, mobile-friendly
 * - Respects prefers-reduced-motion
 */

import { useReducedMotion, motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoInterpolate } from "d3-geo";
import { partnerCountries, partnerCountryIds, TUNISIA } from "@/data/partner-countries";

const GEO_URL = "/world-110m.json";

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLOR_BASE     = "#e8edf2"; // neutral light grey for non-partner countries
const COLOR_PARTNER  = "#037EF3"; // partner country fill
const COLOR_PARTNER_STROKE = "#ffffff";
const COLOR_TUNISIA  = "#ff3131"; // brand accent — hub
const COLOR_BORDER   = "#ffffff"; // country border

// ─── Arc helpers ─────────────────────────────────────────────────────────────

/**
 * Build a smooth SVG cubic-bezier arc between two [lng, lat] points
 * projected onto the map's coordinate space.
 *
 * We use geoInterpolate to get the great-circle midpoint, then lift it
 * toward the center of the map to create a natural arc curve.
 */
function buildArcPath(
  fromCoords: [number, number],
  toCoords: [number, number],
  project: (coords: [number, number]) => [number, number]
): string {
  const [x1, y1] = project(fromCoords);
  const [x2, y2] = project(toCoords);

  // Great-circle midpoint
  const midCoords = geoInterpolate(fromCoords, toCoords)(0.5) as [number, number];
  const [mx, my] = project(midCoords);

  // Lift the control point toward the map center to create a visible arc
  // The lift amount scales with the distance between endpoints
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.min(dist * 0.35, 80);

  // Perpendicular direction (rotate 90°)
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cpx = mx - (dy / len) * lift;
  const cpy = my + (dx / len) * lift;

  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`;
}

// ─── Arc component ────────────────────────────────────────────────────────────

interface ArcProps {
  from: [number, number];
  to: [number, number];
  color: string;
  project: (coords: [number, number]) => [number, number];
  delay: number;
  animate: boolean;
}

function Arc({ from, to, color, project, delay, animate }: ArcProps) {
  const d = buildArcPath(from, to, project);

  // Approximate path length for dash animation
  const DASH = 400;

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeOpacity={0.75}
      strokeDasharray={DASH}
      markerEnd={`url(#arrow-${color.replace("#", "")})`}
      initial={{ strokeDashoffset: DASH, opacity: 0 }}
      animate={
        animate
          ? { strokeDashoffset: 0, opacity: 1 }
          : { strokeDashoffset: DASH, opacity: 0 }
      }
      transition={{
        duration: 1.4,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// ─── Dot component ────────────────────────────────────────────────────────────

interface DotProps {
  coords: [number, number];
  color: string;
  project: (coords: [number, number]) => [number, number];
  delay: number;
  animate: boolean;
}

function Dot({ coords, color, project, delay, animate }: DotProps) {
  const [cx, cy] = project(coords);
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={2.5}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={animate ? { opacity: 0.9, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ duration: 0.3, delay: delay + 1.2 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface WorldMapProps {
  isVisible: boolean;
}

export function WorldMap({ isVisible }: WorldMapProps) {
  const shouldReduceMotion = useReducedMotion();
  const animate = isVisible;

  // Map dimensions — wide aspect ratio for a section banner
  const WIDTH  = 800;
  const HEIGHT = 420;

  // We need to project coordinates ourselves for arcs.
  // react-simple-maps uses geoEqualEarth by default with scale ~160 at 800px wide.
  // We replicate the same projection here using d3-geo.
  // The projection function is called inside the Geographies render prop,
  // but we need it outside too for arcs. We'll use a manual geoEqualEarth setup.

  return (
    <div className="w-full" aria-label="World map showing AIESEC in Bardo global partner network" role="img">
      <ComposableMap
        width={WIDTH}
        height={HEIGHT}
        projection="geoEqualEarth"
        projectionConfig={{ scale: 153, center: [15, 15] }}
        style={{ width: "100%", height: "auto" }}
      >
        {/* ── Arrow marker defs ── */}
        <defs>
          {["F85A40", "F48924", "0CB9C1"].map((hex) => (
            <marker
              key={hex}
              id={`arrow-${hex}`}
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 Z" fill={`#${hex}`} opacity={0.8} />
            </marker>
          ))}
        </defs>

        {/* ── Base world countries ── */}
        <Geographies geography={GEO_URL}>
          {({ geographies, projection }) => {
            // Build a typed project function from the d3 projection
            const project = (coords: [number, number]): [number, number] => {
              const pt = projection(coords);
              return pt ? [pt[0], pt[1]] : [0, 0];
            };

            const tunisiaXY = project(TUNISIA.coordinates);

            return (
              <>
                {/* Countries */}
                {geographies.map((geo) => {
                  const id = String(geo.id);
                  const isTunisia  = id === TUNISIA.id;
                  const isPartner  = partnerCountryIds.has(id);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill:        isTunisia ? COLOR_TUNISIA : isPartner ? COLOR_PARTNER : COLOR_BASE,
                          stroke:      COLOR_BORDER,
                          strokeWidth: 0.4,
                          outline:     "none",
                        },
                        hover: {
                          fill:        isTunisia ? COLOR_TUNISIA : isPartner ? "#0568c8" : "#d4dce6",
                          stroke:      COLOR_BORDER,
                          strokeWidth: 0.4,
                          outline:     "none",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })}

                {/* Connection arcs — rendered after countries so they sit on top */}
                {!shouldReduceMotion &&
                  partnerCountries.map((partner, i) => (
                    <Arc
                      key={`arc-${partner.id}`}
                      from={TUNISIA.coordinates}
                      to={partner.coordinates}
                      color={partner.color}
                      project={project}
                      delay={i * 0.06}
                      animate={animate}
                    />
                  ))}

                {/* Destination dots */}
                {partnerCountries.map((partner, i) => (
                  <Dot
                    key={`dot-${partner.id}`}
                    coords={partner.coordinates}
                    color={partner.color}
                    project={project}
                    delay={i * 0.06}
                    animate={animate}
                  />
                ))}

                {/* Tunisia hub marker */}
                <Marker coordinates={TUNISIA.coordinates}>
                  {/* Outer pulse ring */}
                  <motion.circle
                    r={10}
                    fill="none"
                    stroke={COLOR_TUNISIA}
                    strokeWidth={1.5}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      animate
                        ? { opacity: [0, 0.5, 0], scale: [0.8, 1.8, 0.8] }
                        : { opacity: 0 }
                    }
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.01 }
                        : { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                    }
                  />
                  {/* Inner dot */}
                  <motion.circle
                    r={5}
                    fill={COLOR_TUNISIA}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={animate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                  {/* Label */}
                  <motion.text
                    textAnchor="middle"
                    y={-12}
                    style={{
                      fontFamily: "inherit",
                      fontSize: "7px",
                      fontWeight: 700,
                      fill: COLOR_TUNISIA,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                    initial={{ opacity: 0 }}
                    animate={animate ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                  >
                    BARDO
                  </motion.text>
                </Marker>
              </>
            );
          }}
        </Geographies>
      </ComposableMap>
    </div>
  );
}
