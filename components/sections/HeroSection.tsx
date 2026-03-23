"use client";

/**
 * HeroSection — layered parallax composition (desktop) / static image (mobile)
 *
 * Desktop (>768px):
 *  Layered parallax with scroll + mouse motion.
 *
 * Mobile (≤768px):
 *  Static image: /hero/Phone_Hero_Static.png — no parallax, no RAF loop.
 */

import { useEffect, useRef, useCallback, useState } from "react";

// ── Parallax config per layer ─────────────────────────────────────────────────
const LAYERS = {
  sky:        { scrollFactor: -0.15, mouseFactor: 16 },
  foreground: { scrollFactor: -0.30, mouseFactor: 36 },
  brand:      { scrollFactor: -0.08, mouseFactor: 56 },
} as const;

const MOUSE_EASE = 0.06;

// ── Static mobile hero ────────────────────────────────────────────────────────
function MobileHero() {
  return (
    <section
      aria-label="Hero — AIESEC in Bardo"
      className="relative w-full overflow-hidden"
      style={{ height: "100svh" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/Phone_Hero_Static.png"
        alt="Live it with AIESEC in Bardo"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center center" }}
        draggable={false}
      />
    </section>
  );
}

// ── Desktop parallax hero ─────────────────────────────────────────────────────
function DesktopHero() {
  const skyRef   = useRef<HTMLDivElement>(null);
  const fgRef    = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const mouseTarget  = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const rafId        = useRef<number>(0);
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

  // Brand: -50% X baked in so left:clamp(...) centers correctly
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
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => { prefersReducedMotion.current = e.matches; };
    mq.addEventListener("change", onMqChange);

    const isTouchDevice = window.matchMedia("(hover: none)").matches;

    const onMouseMove = (e: MouseEvent) => {
      if (isTouchDevice || prefersReducedMotion.current) return;
      mouseTarget.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseTarget.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onMouseLeave = () => { mouseTarget.current.x = 0; mouseTarget.current.y = 0; };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    const tick = () => {
      const scrollY = window.scrollY;
      if (prefersReducedMotion.current) {
        if (skyRef.current)   skyRef.current.style.transform   = "translate3d(0, -50%, 0)";
        if (fgRef.current)    fgRef.current.style.transform    = "translate3d(0, -50%, 0)";
        if (brandRef.current) brandRef.current.style.transform = "translate3d(-50%, -50%, 0)";
      } else {
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
      {/* 1. Base gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(180deg, #1a0a00 0%, #3d1a00 25%, #7a3510 55%, #c4621a 80%, #e8892a 100%)" }}
      />

      {/* 2. Sky */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 z-10 pointer-events-none"
        style={{ top: "50%", transform: "translate3d(0, -50%, 0)", willChange: "transform" }}
        ref={skyRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/Sky Backgound.png"
          alt=""
          className="w-full h-auto block"
          style={{ filter: "blur(0.5px) brightness(0.92) saturate(1.15)", minHeight: "100svh", objectFit: "cover" }}
          draggable={false}
        />
      </div>

      {/* 3. Atmospheric haze */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(20,6,0,0.55) 0%, rgba(60,20,0,0.18) 35%, rgba(180,80,10,0.10) 65%, rgba(220,110,20,0.30) 100%)" }}
      />

      {/* 4. Branding — behind aqueduct */}
      <style>{`.hero-brand { left: clamp(5%, calc(44% - 20vw), 45%); width: min(480px, 72vw); }`}</style>
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

      {/* 5. Foreground / aqueduct */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 z-30 pointer-events-none"
        style={{ top: "50%", transform: "translate3d(0, -50%, 0)", willChange: "transform" }}
        ref={fgRef}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/Foreground.png"
          alt=""
          className="w-full h-auto block"
          style={{ minHeight: "100svh", objectFit: "cover", objectPosition: "center bottom" }}
          draggable={false}
        />
      </div>

      {/* 6. Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(10,3,0,0.55) 100%)" }}
      />

      {/* 7. Bottom fade */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-50 pointer-events-none"
        style={{ height: "8%", background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.25) 100%)" }}
      />
    </section>
  );
}

// ── Exported component — switches based on viewport ──────────────────────────
export function HeroSection() {
  // null = not yet measured (SSR), true = mobile, false = desktop
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // During SSR / before hydration: render a placeholder to avoid layout shift
  if (isMobile === null) return <div style={{ height: "100svh" }} aria-hidden="true" />;

  return isMobile ? <MobileHero /> : <DesktopHero />;
}
