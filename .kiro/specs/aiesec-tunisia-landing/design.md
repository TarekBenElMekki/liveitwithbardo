# Design Document: AIESEC Tunisia — Bardo Multi-Page Platform

## Overview

A production-grade, multi-page website for AIESEC Tunisia / Bardo. Five pages serve distinct user purposes: an immersive home entry point, a Discover Bardo explainer, a filterable project listing, a practical Tunisian lifestyle guide, and a searchable FAQ. A floating chat agent powered by a unified knowledge base persists across all pages.

Built with Next.js 14+ App Router, TypeScript, Tailwind CSS, and Framer Motion. All content is driven by a typed data layer under `/data`. The 3D globe on the home page uses `react-globe.gl` loaded as a client-only dynamic import.

### Content Quality Note

> **Discover Bardo** and **Tunisian Lifestyle** pages MUST prioritize practical, accurate value for a first-time visitor to Tunisia. Content in these pages — reasons to choose Tunisia, journey steps, lifestyle guidance, transport options, language phrases, etiquette tips, safety advice, and packing lists — must be grounded in real, useful information. Placeholder or filler content is not acceptable for these two pages. All data in `discover-bardo.ts` and `lifestyle.ts` must reflect genuine guidance a first-time exchange participant would need.

---

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js App Router                        │
│  app/                                                         │
│  ├── layout.tsx         (root layout — Navbar, Footer,        │
│  │                       ChatAgent persists here)             │
│  ├── page.tsx           (Home: Hero, Stats, Globe, Teasers,   │
│  │                       CTA)                                 │
│  ├── discover-bardo/page.tsx                                  │
│  ├── our-projects/page.tsx                                    │
│  ├── our-projects/[slug]/page.tsx  (reserved placeholder)     │
│  ├── tunisian-lifestyle/page.tsx                              │
│  ├── faq/page.tsx                                             │
│  └── globals.css                                              │
├──────────────────────────────────────────────────────────────┤
│                     Component Layer                           │
│  components/                                                  │
│  ├── layout/        Navbar (next/link + active state),        │
│  │                  Footer                                    │
│  ├── sections/      Existing reusable sections                │
│  ├── globe/         GlobeSection, GlobeCanvas (client-only)   │
│  ├── home/          PageTeasers                               │
│  ├── discover/      WhyTunisiaGrid, PersonaCards,             │
│  │                  JourneyTimeline, SupportSection,          │
│  │                  ExperienceHighlights                      │
│  ├── projects/      ProjectCard, ProjectFilters, ProjectGrid  │
│  ├── lifestyle/     TransportSection, ClimateSection,         │
│  │                  LanguageSection, EtiquetteSection,        │
│  │                  SafetySection, PackingSection             │
│  ├── faq/           FaqSearch, FaqCategoryTabs, FaqAccordion  │
│  ├── ui/            Existing shared primitives (unchanged)    │
│  ├── chat/          ChatAgent, ChatPanel (expanded KB)        │
│  └── map/           TunisiaMap (kept, not on home)            │
├──────────────────────────────────────────────────────────────┤
│                      Data Layer                               │
│  data/                                                        │
│  ├── hero-media.ts        (keep)                              │
│  ├── stats.ts             (keep)                              │
│  ├── foods.ts             (keep)                              │
│  ├── places.ts            (keep)                              │
│  ├── faq.ts               (keep + expand)                     │
│  ├── globe-routes.ts      (new — GlobeArc[])                  │
│  ├── projects.ts          (new — Project[])                   │
│  ├── discover-bardo.ts    (new — reasons, personas, journey)  │
│  ├── lifestyle.ts         (new — transport, climate, etc.)    │
│  └── knowledge-base.ts    (new — unified KnowledgeEntry[])    │
├──────────────────────────────────────────────────────────────┤
│                       Lib Layer                               │
│  lib/                                                         │
│  ├── hooks/  useInView, useParallax, useCounter (keep)        │
│  └── utils.ts  cn(), matchFaq() — accepts KnowledgeEntry[]   │
└──────────────────────────────────────────────────────────────┘
```

### Rendering Strategy

- Pages and static sections: React Server Components by default
- Interactive components (Hero, Stats, Globe, Estimator, Filters, FAQ accordion, ChatAgent): Client Components with `"use client"`
- Data layer: pure TypeScript modules, imported at build time, zero runtime fetching
- Globe: `next/dynamic` with `ssr: false` — never server-rendered

---

## File / Folder Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── discover-bardo/page.tsx
│   ├── our-projects/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── tunisian-lifestyle/page.tsx
│   └── faq/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── FoodSection.tsx
│   │   ├── PlacesSection.tsx
│   │   ├── EstimatorSection.tsx
│   │   └── CtaSection.tsx
│   ├── globe/
│   │   ├── GlobeSection.tsx
│   │   └── GlobeCanvas.tsx
│   ├── home/
│   │   └── PageTeasers.tsx
│   ├── discover/
│   │   ├── WhyTunisiaGrid.tsx
│   │   ├── PersonaCards.tsx
│   │   ├── JourneyTimeline.tsx
│   │   ├── SupportSection.tsx
│   │   └── ExperienceHighlights.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectFilters.tsx
│   │   └── ProjectGrid.tsx
│   ├── lifestyle/
│   │   ├── TransportSection.tsx
│   │   ├── ClimateSection.tsx
│   │   ├── LanguageSection.tsx
│   │   ├── EtiquetteSection.tsx
│   │   ├── SafetySection.tsx
│   │   └── PackingSection.tsx
│   ├── faq/
│   │   ├── FaqSearch.tsx
│   │   ├── FaqCategoryTabs.tsx
│   │   └── FaqAccordion.tsx
│   ├── ui/
│   │   ├── MediaCard.tsx
│   │   ├── FoodCard.tsx
│   │   ├── PlaceCard.tsx
│   │   ├── StatCounter.tsx
│   │   └── Slider.tsx
│   ├── chat/
│   │   ├── ChatAgent.tsx
│   │   └── ChatPanel.tsx
│   └── map/
│       └── TunisiaMap.tsx
├── data/
│   ├── hero-media.ts
│   ├── stats.ts
│   ├── foods.ts
│   ├── places.ts
│   ├── faq.ts
│   ├── globe-routes.ts
│   ├── projects.ts
│   ├── discover-bardo.ts
│   ├── lifestyle.ts
│   └── knowledge-base.ts
├── lib/
│   ├── hooks/
│   │   ├── useInView.ts
│   │   ├── useParallax.ts
│   │   └── useCounter.ts
│   └── utils.ts
├── public/
│   ├── images/
│   └── reels/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.js
├── tailwind.config.ts
└── README.md
```

---

## Data Models

### `/data/globe-routes.ts`

```typescript
export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  label: string;
  direction: "outbound" | "inbound";
}

export const TUNISIA_COORDS = { lat: 33.8869, lng: 9.5375 };
export const globeArcs: GlobeArc[] = [ /* 15–20 real country coordinates */ ];
```

### `/data/projects.ts`

```typescript
export type SDG = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
export type ProjectCategory = "volunteer" | "internship" | "cultural";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  sdgs: SDG[];
  startDate: string;   // ISO 8601 "YYYY-MM-DD"
  endDate: string;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
}

export const projects: Project[] = [ /* ... */ ];
```

### `/data/discover-bardo.ts`

```typescript
export interface WhyReason {
  id: string;
  icon: string;       // lucide icon name or emoji
  title: string;
  description: string;
}

export interface Persona {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

export interface JourneyStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

export interface ExperienceHighlight {
  id: string;
  quote: string;
  author: string;
  country: string;
  program: string;
}

export const whyReasons: WhyReason[] = [ /* ... */ ];
export const personas: Persona[] = [ /* ... */ ];
export const journeySteps: JourneyStep[] = [ /* ... */ ];
export const experienceHighlights: ExperienceHighlight[] = [ /* ... */ ];
```

### `/data/lifestyle.ts`

```typescript
export interface TransportOption {
  id: string;
  name: string;
  description: string;
  avgCost: string;
  icon: string;
}

export interface ClimateMonth {
  month: string;
  avgHigh: number;
  avgLow: number;
  description: string;
  icon: string;
}

export interface LanguagePhrase {
  id: string;
  arabic: string;
  french: string;
  english: string;
  pronunciation?: string;
}

export interface EtiquetteTip {
  id: string;
  type: "do" | "dont";
  tip: string;
}

export interface SafetyTip {
  id: string;
  category: string;
  tip: string;
}

export interface PackingItem {
  id: string;
  category: string;
  item: string;
  essential: boolean;
}

export const transportOptions: TransportOption[] = [ /* ... */ ];
export const climateMonths: ClimateMonth[] = [ /* ... */ ];
export const languagePhrases: LanguagePhrase[] = [ /* ... */ ];
export const etiquetteTips: EtiquetteTip[] = [ /* ... */ ];
export const safetyTips: SafetyTip[] = [ /* ... */ ];
export const packingItems: PackingItem[] = [ /* ... */ ];
```

### `/data/knowledge-base.ts`

```typescript
import { faqEntries, type FaqEntry } from "./faq";
import { projects, type Project } from "./projects";
import { whyReasons, journeySteps, experienceHighlights } from "./discover-bardo";
import { transportOptions, languagePhrases, safetyTips } from "./lifestyle";

export type KnowledgeTopic =
  | "cost" | "tunisia" | "aiesec" | "general"
  | "projects" | "lifestyle" | "bardo";

export type KnowledgeSource = "faq" | "lifestyle" | "discover" | "projects";

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  topic: KnowledgeTopic;
  source: KnowledgeSource;
}

export function buildKnowledgeBase(): KnowledgeEntry[] {
  // Normalizes and aggregates entries from all data sources
  // Returns KnowledgeEntry[] — same shape matchFaq() already expects
}

export const knowledgeBase: KnowledgeEntry[] = buildKnowledgeBase();
```

`matchFaq` in `lib/utils.ts` is updated to accept `KnowledgeEntry[]` (which is a superset of `FaqEntry[]` — same keyword/answer shape, backward compatible).

---

## Component Design

### Navbar (`components/layout/Navbar.tsx`)

Updated from anchor hashes to `next/link` page routes:

```typescript
const navLinks = [
  { href: "/",                   label: "Home" },
  { href: "/discover-bardo",     label: "Discover" },
  { href: "/our-projects",       label: "Projects" },
  { href: "/tunisian-lifestyle", label: "Lifestyle" },
  { href: "/faq",                label: "FAQ" },
];
```

Active state: `const pathname = usePathname()` → `pathname === link.href` → `text-white border-b-2 border-accent`.

### GlobeSection / GlobeCanvas (`components/globe/`)

**GlobeSection** — Server Component wrapper:
- Section layout, heading, description text
- Renders `<GlobeCanvas>` via `next/dynamic` with `ssr: false`
- Uses `useInView` to pass `isVisible` prop — GlobeCanvas only mounts when visible

**GlobeCanvas** — Client Component:
```typescript
"use client";
import Globe from "react-globe.gl";

interface GlobeCanvasProps {
  arcs: GlobeArc[];
  reducedMotion: boolean;
}
```

Config:
- `globeImageUrl`: dark Earth texture or `/images/globe-dark.png`
- `arcsData`: `globeArcs` from data layer
- `arcColor`: direction-based — outbound = accent, inbound = `rgba(255,255,255,0.6)`
- `arcDashAnimateTime`: `2000` (disabled when `reducedMotion`)
- `autoRotate`: `true` (disabled when `reducedMotion`)
- `autoRotateSpeed`: `0.3`
- `backgroundColor`: `rgba(0,0,0,0)`
- Tunisia highlight: `polygonsData` with Tunisia GeoJSON polygon, filled with accent color

Performance protections:
- `next/dynamic` with `ssr: false` and `loading` fallback (dark circle `<div>`)
- `useInView` threshold `0.2` — canvas only mounts when section is 20% visible
- `useReducedMotion()` from Framer Motion — disables animation and rotation
- Mobile: arc count capped at 8, `autoRotate: false`
- Canvas width/height bound to container via `ResizeObserver`

### ProjectFilters (`components/projects/ProjectFilters.tsx`)

**Client Component** — filter state management.

```typescript
interface FilterState {
  category: ProjectCategory | "all";
  sdgs: SDG[];
  city: string | "all";
  status: "open" | "closed" | "all";
  startDate: string;
  endDate: string;
}
```

- Filter state lives in `ProjectFilters` and is lifted to the page via callback
- Active filter chips rendered below the filter bar
- "Clear all" resets to default state
- `filterProjects(projects, filters)` pure function in `lib/utils.ts`

### FAQ Accordion (`components/faq/FaqAccordion.tsx`)

**Client Component**:
- Each item: `<button>` trigger with `aria-expanded` + `aria-controls` pointing to the answer panel
- Answer panel: `overflow-hidden` container with `max-height` CSS transition (0 → measured content height) and simultaneous `opacity` transition (0 → 1)
- Chevron icon: `transform: rotate(0deg)` → `rotate(180deg)` CSS transition
- No layout-affecting properties other than `max-height` are animated
- Keyboard: Enter/Space toggles the focused item, arrow keys move focus between items

### ChatAgent — Knowledge Base Integration

`ChatAgent` imports `knowledgeBase` from `data/knowledge-base.ts` instead of `faqEntries` from `data/faq.ts`. The `matchFaq` call signature is unchanged — it receives `KnowledgeEntry[]` which satisfies the same interface.

Phase 2 path (not implemented now): replace `knowledgeBase` import with a `useSWR("/api/knowledge")` call. Zero changes to `ChatPanel` or `matchFaq`.

---

## Page Compositions

### `app/page.tsx` — Home
```
HeroSection
StatsSection
GlobeSection          ← replaces MapSection
PageTeasers           ← new: links to /discover-bardo, /our-projects, /tunisian-lifestyle
CtaSection
```

### `app/discover-bardo/page.tsx`
```
PageHero
WhatIsBardo           ← inline section, content from discover-bardo.ts
WhatAiesecDoes        ← inline section
WhyTunisiaGrid        ← data: whyReasons[]
PersonaCards          ← data: personas[]
JourneyTimeline       ← data: journeySteps[]
SupportSection        ← inline section
ExperienceHighlights  ← data: experienceHighlights[]
CtaSection            ← links to /our-projects
```

### `app/our-projects/page.tsx`
```
PageHero
ProjectFilters        ← client component, manages FilterState
ProjectGrid           ← receives filtered projects[]
```

### `app/tunisian-lifestyle/page.tsx`
```
PageHero
FoodSection           ← reused
PlacesSection         ← reused
EstimatorSection      ← reused
TransportSection      ← data: transportOptions[]
ClimateSection        ← data: climateMonths[]
LanguageSection       ← data: languagePhrases[]
EtiquetteSection      ← data: etiquetteTips[]
SafetySection         ← data: safetyTips[]
PackingSection        ← data: packingItems[]
CtaSection
```

### `app/faq/page.tsx`
```
PageHero
FaqSearch             ← client, manages search query state
FaqCategoryTabs       ← client, manages active category state
FaqAccordion          ← receives filtered faqEntries[]
HandoffCTA            ← inline: email + Instagram links
```

---

## Animation Patterns

All existing animation patterns from the original design are preserved (parallax, counter, video autoplay, reduced motion). New additions:

### FAQ Accordion
```
button click → toggle isOpen state
  ↓
answer panel: max-height: 0 → max-height: {contentHeight}px  (CSS transition)
              opacity: 0 → opacity: 1                         (CSS transition)
chevron:      rotate(0deg) → rotate(180deg)                   (CSS transform transition)
```
No layout-affecting properties other than max-height are animated.

### Project Card Entrance
```
useInView({ threshold: 0.1 }) on ProjectGrid
  ↓
motion.div staggered: initial={{ opacity: 0, y: 24 }} → animate={{ opacity: 1, y: 0 }}
  delay: index * 0.05
```

### Globe Arc (react-globe.gl built-in)
```
arcDashLength: 0.4
arcDashGap: 0.2
arcDashAnimateTime: 2000   (0 when reducedMotion)
```

---

## Performance and Accessibility

All original performance and accessibility patterns are preserved. Additions:

- `next/link` prefetching for all internal page navigation
- `react-globe.gl` loaded only via `next/dynamic` with `ssr: false`
- Globe canvas only mounts on viewport entry (IntersectionObserver via `useInView`)
- Project filtering is pure client-side — no network requests
- FAQ search is pure client-side string matching
- All new interactive components (accordion, filters, tabs) are keyboard accessible
- `aria-expanded`, `aria-controls`, `role="tablist"`, `role="tab"` used correctly on FAQ and filter components
