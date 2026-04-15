# Implementation Tasks

## Phase 1 — Dependencies and Configuration

- [x] 1.1 Install `react-globe.gl` and its peer dependency `three` via npm
- [x] 1.2 Add `globe.gl` and `three` to `transpilePackages` in `next.config.mjs` if required for ESM compatibility
- [x] 1.3 Verify `npx tsc --noEmit` still passes after install

## Phase 2 — Data Layer (new files)

- [x] 2.1 Create `data/globe-routes.ts` — `GlobeArc` interface, `TUNISIA_COORDS`, `globeArcs[]` with 8–12 real country coordinates (mix of inbound/outbound)
- [x] 2.2 Create `data/projects.ts` — `SDG` type, `ProjectCategory` type, `Project` interface, `projects[]` with 8–10 realistic placeholder entries
- [x] 2.3 Create `data/discover-bardo.ts` — `WhyReason`, `Persona`, `JourneyStep`, `ExperienceHighlight` interfaces and populated arrays
- [x] 2.4 Create `data/lifestyle.ts` — `TransportOption`, `ClimateMonth`, `LanguagePhrase`, `EtiquetteTip`, `SafetyTip`, `PackingItem` interfaces and populated arrays
- [x] 2.5 Create `data/knowledge-base.ts` — `KnowledgeEntry` interface, `KnowledgeTopic` and `KnowledgeSource` types, `buildKnowledgeBase()` function aggregating from faq, lifestyle, discover-bardo, and projects data
- [x] 2.6 Update `lib/utils.ts` — change `matchFaq` signature to accept `KnowledgeEntry[]` (backward compatible with existing `FaqEntry[]` shape)

## Phase 3 — Navbar Refactor

- [x] 3.1 Rewrite `components/layout/Navbar.tsx` — replace anchor `href="#section"` links with `next/link` page routes (`/`, `/discover-bardo`, `/our-projects`, `/tunisian-lifestyle`, `/faq`)
- [x] 3.2 Add `usePathname()` active state — active link gets `text-white border-b-2 border-accent` styling
- [x] 3.3 Update mobile menu to use `next/link` and close on navigation

## Phase 4 — Root Layout Update

- [x] 4.1 Move `<ChatAgent />` from `app/page.tsx` into `app/layout.tsx` so it persists across all pages
- [x] 4.2 Update `ChatAgent` to import `knowledgeBase` from `data/knowledge-base.ts` instead of `faqEntries` from `data/faq.ts`

## Phase 5 — 3D Globe (Home page replacement for MapSection)

- [x] 5.1 Create `components/globe/GlobeCanvas.tsx` — `"use client"` component wrapping `react-globe.gl` with typed props (`arcs: GlobeArc[]`, `reducedMotion: boolean`); configure dark style, arc colors by direction, slow auto-rotate, Tunisia highlight polygon
- [x] 5.2 Create `components/globe/GlobeSection.tsx` — section wrapper that uses `useInView` to conditionally mount `GlobeCanvas` only when visible; uses `next/dynamic` with `ssr: false` and a static dark-circle loading fallback; reads `useReducedMotion()` and passes it to canvas
- [x] 5.3 Update `app/page.tsx` — remove `MapSection` import, add `GlobeSection`

## Phase 6 — Home Page Completion

- [x] 6.1 Create `components/home/PageTeasers.tsx` — three teaser cards using `next/link` linking to `/discover-bardo`, `/our-projects`, `/tunisian-lifestyle`; each card has title, description, and visual cue
- [x] 6.2 Update `app/page.tsx` — final composition: `HeroSection`, `StatsSection`, `GlobeSection`, `PageTeasers`, `CtaSection`; remove `FoodSection`, `PlacesSection`, `EstimatorSection` (they move to lifestyle page)

## Phase 7 — Discover Bardo Page

- [x] 7.1 Create `components/discover/WhyTunisiaGrid.tsx` — grid of reason cards from `whyReasons[]`
- [x] 7.2 Create `components/discover/PersonaCards.tsx` — persona cards from `personas[]`
- [x] 7.3 Create `components/discover/JourneyTimeline.tsx` — vertical or horizontal timeline from `journeySteps[]`
- [x] 7.4 Create `components/discover/SupportSection.tsx` — two-column layout: pre-arrival and during-exchange support content
- [x] 7.5 Create `components/discover/ExperienceHighlights.tsx` — quote/highlight cards from `experienceHighlights[]`
- [x] 7.6 Create `app/discover-bardo/page.tsx` — assembles: page hero, What is Bardo, What AIESEC does, `WhyTunisiaGrid`, `PersonaCards`, `JourneyTimeline`, `SupportSection`, `ExperienceHighlights`, `CtaSection` (linking to /our-projects)

## Phase 8 — Our Projects Page

- [x] 8.1 Create `components/projects/ProjectCard.tsx` — displays title, description, image, city, category badge, SDG badges, date range, open/closed status chip
- [x] 8.2 Create `components/projects/ProjectFilters.tsx` — `"use client"` component with filter controls for category, SDG (multi-select), city, status, date range; renders active filter chips with individual remove; "Clear all" button
- [x] 8.3 Create `components/projects/ProjectGrid.tsx` — receives filtered `Project[]`, renders grid with staggered entrance animation; renders empty state when array is empty
- [x] 8.4 Add `filterProjects(projects: Project[], filters: FilterState): Project[]` pure function to `lib/utils.ts`
- [x] 8.5 Create `app/our-projects/page.tsx` — assembles page hero, `ProjectFilters`, `ProjectGrid`; filter state lifted to page level
- [x] 8.6 Create `app/our-projects/[slug]/page.tsx` — placeholder page returning a "Coming soon" message or 404; reserves the route for future detail pages

## Phase 9 — Tunisian Lifestyle Page

- [x] 9.1 Create `components/lifestyle/TransportSection.tsx` — card grid from `transportOptions[]`
- [x] 9.2 Create `components/lifestyle/ClimateSection.tsx` — month cards or season blocks from `climateMonths[]`
- [x] 9.3 Create `components/lifestyle/LanguageSection.tsx` — phrase table/cards from `languagePhrases[]`
- [x] 9.4 Create `components/lifestyle/EtiquetteSection.tsx` — do/don't cards from `etiquetteTips[]`
- [x] 9.5 Create `components/lifestyle/SafetySection.tsx` — tip cards from `safetyTips[]`
- [x] 9.6 Create `components/lifestyle/PackingSection.tsx` — checklist grouped by category from `packingItems[]`
- [x] 9.7 Create `app/tunisian-lifestyle/page.tsx` — assembles: page hero, `FoodSection`, `PlacesSection`, `EstimatorSection`, `TransportSection`, `ClimateSection`, `LanguageSection`, `EtiquetteSection`, `SafetySection`, `PackingSection`, `CtaSection`

## Phase 10 — FAQ Page

- [x] 10.1 Create `components/faq/FaqSearch.tsx` — `"use client"` controlled input that emits search query string
- [x] 10.2 Create `components/faq/FaqCategoryTabs.tsx` — `"use client"` tab bar for Cost / Tunisia / AIESEC / General / All; emits active category
- [x] 10.3 Create `components/faq/FaqAccordion.tsx` — `"use client"` accordion list; each item has `<button>` trigger with `aria-expanded` and `aria-controls`, answer panel with `max-height` + `opacity` CSS transitions, chevron `rotate` transform transition; keyboard navigable (Enter/Space toggle, arrow keys move focus)
- [x] 10.4 Create `app/faq/page.tsx` — assembles: page hero, `FaqSearch`, `FaqCategoryTabs`, `FaqAccordion` (receives filtered entries), handoff CTA with email and Instagram links; search + category filters applied simultaneously; empty state when no results

## Phase 11 — Per-Page Metadata

- [x] 11.1 Add `export const metadata` to `app/discover-bardo/page.tsx`
- [x] 11.2 Add `export const metadata` to `app/our-projects/page.tsx`
- [x] 11.3 Add `export const metadata` to `app/tunisian-lifestyle/page.tsx`
- [x] 11.4 Add `export const metadata` to `app/faq/page.tsx`

## Phase 12 — Accessibility Pass

- [x] 12.1 Verify all new interactive components have correct ARIA attributes (`aria-expanded`, `aria-controls`, `role="tablist"`, `role="tab"`, `role="tabpanel"`)
- [x] 12.2 Verify focus management: FAQ accordion keyboard navigation, filter chips removable via keyboard, globe section has a text fallback for screen readers
- [x] 12.3 Verify all new `next/image` usages have non-empty `alt` sourced from data layer

## Phase 13 — Final Verification

- [x] 13.1 Run `npx next build` — zero errors
- [x] 13.2 Run `npx tsc --noEmit` — zero errors
- [x] 13.3 Verify all five routes render without runtime errors
- [x] 13.4 Verify globe loads only on viewport entry and shows fallback before mount
- [x] 13.5 Verify ChatAgent persists across page navigations without remounting
- [x] 13.6 Verify Navbar active state updates correctly on each route
- [x] 13.7 Verify project filters produce correct results and empty state renders
- [x] 13.8 Verify FAQ search + category filter work simultaneously
