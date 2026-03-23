"use client";

/**
 * HeroSection — layered parallax composition
 *
 * Layer stack (bottom → top):
 *  1. Base warm gradient (atmospheric fill)
 *  2. Sky image          (slow scroll + tiny mouse)       z-10
 *  3. Atmospheric haze   (gradient overlay, no parallax)  z-20
 *  4. Branding mark      (subtle scroll + delicate mouse) z-25  ← behind aqueduct
 *  5. Foreground/aqueduct (medium scroll + moderate mouse) z-30 ← occludes branding
 *  6. Vignette overlay   (static, focus toward center)    z-40
 *  7. Bottom fade        (static, very subtle)            z-50
 *
 * Motion:
 *  - Scroll: translate3d(0, offset, 0) — sky slowest, aqueduct medium, brand subtle
 *  - Mouse:  translate3d(dx, dy, 0)   — sky tiny, aqueduct moderate, brand delicate
 *  - Both combined via refs, updated in a single RAF loop
 *  - Reduced-motion: all parallax disabled
 *
 * Performance:
 *  - will-change: transform on animated layers
 *  - Single RAF loop for both scroll + mouse
 *  - No React state updates on scroll/mouse — pure DOM ref mutations
 *  - Listeners cleaned up on unmount
 */

import { useEffect, useRef, useCallback } from "react";

// ── Parallax config per layer ─────────────────────────────────────────────────
// scrollFactor: px moved per 1px scrolled (negative = moves up slower than scroll)
// mouseFactor:  max px offset at screen edge (desktop only)
const LAYERS = {
  sky:        { scrollFactor: -0.15, mouseFactor: 8  },
  foreground: { scrollFactor: -0.30, mouseFactor: 18 },
  brand:      { scrollFactor: -0.08, mouseFactor: 28 }, // raised from 5 → 28 for noticeable cursor response
} as const;

// Smooth interpolation factor for mouse easing (0 = no movement, 1 = instant)
const MOUSE_EASE = 0.06;

export function HeroSection() {
  const skyRef   = useRef<HTMLDivElement>(null);
  const fgRef    = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Current interpolated mouse offset (normalised -1 → +1)
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const applyTransform = useCallback(
    (el: HTMLDivElement | null, scrollY: number, mx: number, my: number, cfg: typeof LAYERS[keyof typeof LAYERS]) => {
      if (!el) return;
      const sy = scrollY * cfg.scrollFactor;
      const dx = mx * cfg.mouseFactor;
      const dy = my * cfg.mouseFactor;
      el.style.transform = `translate3d(${dx}px, calc(-50% + ${sy + dy}px), 0)`;
    },
    []
  );

  // Brand layer needs X centering baked into the transform so that
  // left:50% (mobile) and left:clamp(...) (desktop) both work correctly.
  // translate3d(calc(-50% + dx), calc(-50% + sy+dy), 0)
  const applyBrandTransform = useCallback(
    (el: HTMLDivElement | null, scrollY: number, mx: number, my: number) => {
      if (!el) return;
      const sy = scrollY * LAYERS.brand.scrollFactor;
      const dx = mx * LAYERS.brand.mouseFactor;
      const dy = my * LAYERS.brand.mouseFactor;
      el.style.transform = `translate3d(calc(-50% + ${dx}px), calc(-50% + ${sy + dy}px), 0)`;
    },
    []
  );

  useEffect(() => {
    // Detect reduced-motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mq.addEventListener("change", onMqChange);

    // Mouse move — only on non-touch devices
    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    const onMouseMove = (e: MouseEvent) => {
      if (isTouchDevice || prefersReducedMotion.current) return;
      // Normalise to -1 → +1 from screen center
      mouseTarget.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onMouseLeave = () => {
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    // RAF loop — runs continuously while mounted
    const tick = () => {
      const scrollY = window.scrollY;

      if (prefersReducedMotion.current) {
        // Reset all transforms — brand needs -50% X centering preserved
        if (skyRef.current)   skyRef.current.style.transform   = "translate3d(0, -50%, 0)";
        if (fgRef.current)    fgRef.current.style.transform    = "translate3d(0, -50%, 0)";
        if (brandRef.current) brandRef.current.style.transform = "translate3d(-50%, -50%, 0)";
      } else {
        // Ease mouse toward target
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * MOUSE_EASE;
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * MOUSE_EASE;

        const mx = mouseCurrent.current.x;
        const my = mouseCurrent.current.y;

        applyTransform(skyRef.current,   scrollY, mx, my, LAYERS.sky);
        applyTransform(fgRef.current,    scrollY, mx, my, LAYERS.foreground);
        applyBrandTransform(brandRef.current, scrollY, mx, my);
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      mq.removeEventListener("change", onMqChange);
    };
  }, [applyTransform, applyBrandTransform]);

  return (
    <section
      aria-label="Hero — AIESEC in Bardo"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* ── 1. Base warm gradient fill ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #1a0a00 0%, #3d1a00 25%, #7a3510 55%, #c4621a 80%, #e8892a 100%)",
        }}
      />

      {/* ── 2. Sky image layer ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{
          top: "50%",
          transform: "translate3d(0, -50%, 0)",
          willChange: "transform",
        }}
        ref={skyRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/Sky Backgound.png"
          alt=""
          className="w-full h-auto block"
          style={{
            filter: "blur(0.5px) brightness(0.92) saturate(1.15)",
            minHeight: "100svh",
            objectFit: "cover",
          }}
          draggable={false}
        />
      </div>

      {/* ── 3. Atmospheric haze overlay ─────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,6,0,0.55) 0%, rgba(60,20,0,0.18) 35%, rgba(180,80,10,0.10) 65%, rgba(220,110,20,0.30) 100%)",
        }}
      />

      {/*
       * ── 4. Branding mark — sits BEHIND the aqueduct (z-25) ───────────
       *
       * Positioning strategy:
       *  - top:  clamp(30svh … 50svh) — rises as viewport shrinks (prev commit)
       *  - left: desktop = clamp(5%, calc(44% - 20vw), 45%)
       *          phone (≤640px) = 50% — true horizontal center
       *
       * Width:
       *  - desktop/tablet: min(480px, 72vw)
       *  - phone (≤640px):  min(92vw, 420px) — wider, fills more of the screen
       *
       * The RAF loop writes translate3d(dx, calc(-50% + sy+dy), 0).
       * X = dx is pure mouse wiggle (no centering offset needed — left handles it).
       * Y = calc(-50% + ...) centers vertically around the `top` anchor.
       *
       * On phone, left:50% + the element's own width being centered via the
       * hero-brand-mobile CSS rule (margin-left: -50% of element width) would
       * require knowing the width. Instead we use a wrapper approach:
       * the RAF ref sits on the outer wrapper (handles top/left + transform),
       * and the inner img wrapper carries the responsive width. The outer
       * wrapper has zero intrinsic size so -50% Y in transform is fine
       * (it's relative to the wrapper height = auto = content height).
       *
       * Actually simpler: inject a <style> tag with @media to override left
       * and width on the same element. The RAF transform X (dx) is just a
       * small mouse wiggle (±28px max) — centering via left:50% is accurate
       * enough since dx is decorative, not structural.
       */}
      <style>{`
        .hero-brand {
          left: clamp(5%, calc(44% - 20vw), 45%);
          width: min(480px, 72vw);
        }
        @media (max-width: 640px) {
          .hero-brand {
            left: 50%;
            width: min(92vw, 420px);
          }
        }
      `}</style>
      <div
        className="hero-brand absolute z-[25] pointer-events-none"
        style={{
          top: "clamp(30svh, calc(50svh - 20svh * (1280px - 100vw) / 905px), 50svh)",
          transform: "translate3d(-50%, -50%, 0)",
          willChange: "transform",
        }}
        ref={brandRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/Live it with Bardo.png"
          alt="Live it with AIESEC in Bardo"
          className="w-full h-auto block"
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.50))" }}
          draggable={false}
        />
      </div>

      {/* ── 5. Foreground / aqueduct layer — occludes branding ──────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 z-30 pointer-events-none"
        style={{
          top: "50%",
          transform: "translate3d(0, -50%, 0)",
          willChange: "transform",
        }}
        ref={fgRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/Foreground.png"
          alt=""
          className="w-full h-auto block"
          style={{
            minHeight: "100svh",
            objectFit: "cover",
            objectPosition: "center bottom",
          }}
          draggable={false}
        />
      </div>

      {/* ── 6. Vignette — focus toward center ───────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(10,3,0,0.55) 100%)",
        }}
      />

      {/* ── 7. Bottom fade — very subtle atmospheric softening ──────────── */}
      {/*    height 8%, max opacity 0.25 — barely visible, not milky        */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{
          height: "8%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.25) 100%)",
        }}
      />
    </section>
  );
}
