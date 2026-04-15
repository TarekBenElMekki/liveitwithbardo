# Requirements Document

## Introduction

A production-grade, multi-page website for the AIESEC Tunisia / Bardo experience platform. The platform is designed to be genuinely useful for someone discovering Tunisia for the first time — covering cultural exchange opportunities, Tunisian lifestyle guidance, filterable project listings, and a comprehensive FAQ. Built with Next.js 14+ App Router, TypeScript, Tailwind CSS, and Framer Motion.

The site consists of five pages: Home (`/`), Discover Bardo (`/discover-bardo`), Our Projects (`/our-projects`), Tunisian Lifestyle (`/tunisian-lifestyle`), and FAQ (`/faq`). A floating chat agent persists across all pages and draws from a unified knowledge base.

## Glossary

- **Platform**: The full multi-page Next.js website served at the root of the workspace
- **Home_Page**: The root route `/` — immersive entry point with hero, stats, globe, page teasers, and CTA
- **Discover_Page**: The `/discover-bardo` route — explains Bardo, AIESEC Tunisia, and the exchange journey
- **Projects_Page**: The `/our-projects` route — filterable listing of exchange opportunities
- **Lifestyle_Page**: The `/tunisian-lifestyle` route — practical discovery guide for first-time visitors
- **FAQ_Page**: The `/faq` route — searchable, categorized knowledge base with expandable answers
- **Hero_Section**: The full-viewport immersive media wall at the top of the Home_Page
- **Media_Card**: A rounded card displaying either an image or a looping video preview
- **Stats_Section**: The animated counter section displaying key program metrics
- **Globe_Section**: The 3D interactive globe on the Home_Page showing Tunisia's global connections
- **GlobeCanvas**: The client-only WebGL canvas component rendering the react-globe.gl instance
- **Globe_Arc**: A typed data record describing an animated connection arc on the globe
- **CTA_Section**: The full-width call-to-action section
- **Chat_Agent**: The floating chat panel anchored to the bottom-right of the viewport, present on all pages
- **Knowledge_Base**: The unified set of typed entries aggregated from all data domains for the Chat_Agent
- **Data_Layer**: All TypeScript files under `/data` supplying typed content to components
- **Project**: A typed exchange opportunity record with slug, SDGs, dates, city, category, and status
- **SDG**: UN Sustainable Development Goal, numbered 1–17
- **FAQ_Entry**: A typed question/answer record with keywords, topic category, and answer text
- **Accent_Color**: The primary brand highlight color (AIESEC blue/teal)
- **Viewport**: The visible area of the browser window

---

## Requirements

### Requirement 1: Project Structure and Multi-Page Configuration

**User Story:** As a developer, I want a clean Next.js 14+ App Router multi-page project at the workspace root, so that all five routes are accessible and the application runs immediately with `npm run dev`.

#### Acceptance Criteria

1. THE Platform SHALL be structured with the following app routes at the workspace root: `/`, `/discover-bardo`, `/our-projects`, `/tunisian-lifestyle`, and `/faq`.
2. THE Platform SHALL include root configuration files: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `tailwind.config.ts`, `app/globals.css`, and `README.md`.
3. WHEN a developer runs `npm run dev`, THE Platform SHALL start without errors and all five routes SHALL be reachable.
4. THE Platform SHALL use TypeScript for all source files under `/app`, `/components`, `/data`, and `/lib`.
5. THE Data_Layer SHALL export typed interfaces and content arrays from dedicated files under `/data`.
6. THE Platform SHALL use `next/link` for all internal navigation between pages.
7. THE Navbar SHALL use `usePathname()` to apply an active visual state to the link matching the current route.
8. THE Chat_Agent SHALL be rendered in `app/layout.tsx` so it persists across all five pages without remounting.

---

### Requirement 2: Hero Immersive Media Wall (Home)

**User Story:** As a visitor, I want to see a cinematic full-viewport media wall on the home page, so that I am immediately immersed in the AIESEC Tunisia experience.

#### Acceptance Criteria

1. THE Hero_Section SHALL render three horizontal rows of Media_Cards on desktop viewports (≥ 1024px).
2. WHEN the page loads on desktop, THE Hero_Section SHALL display each Media_Card in a grayscale, slightly darkened cinematic state by default.
3. WHEN a visitor hovers over a Media_Card on desktop, THE Hero_Section SHALL scale the card up, remove the grayscale filter, and bring the card visually forward using CSS transform and z-index.
4. WHEN a visitor hovers over a Media_Card containing a video on desktop, THE Hero_Section SHALL begin playing the video preview.
5. WHEN the visitor moves the cursor away from a Media_Card on desktop, THE Hero_Section SHALL revert the card to its default cinematic state and pause any playing video.
6. WHILE the page is scrolled on desktop, THE Hero_Section SHALL apply a parallax effect where adjacent rows scroll in opposite horizontal directions using transform-based animation only.
7. THE Hero_Section SHALL render a centered overlay with an abstract human silhouette and the text "Behind each exchange a STORY", where "STORY" is rendered in the Accent_Color.
8. THE Hero_Section SHALL render one or two vertical columns of Media_Cards on mobile viewports (< 1024px) with no hover interactions.
9. WHEN a Media_Card containing a video enters the Viewport on mobile, THE Hero_Section SHALL begin playing the video.
10. WHEN a Media_Card containing a video exits the Viewport on mobile, THE Hero_Section SHALL pause the video.
11. THE Hero_Section SHALL load all content from `/data/hero-media.ts`, supporting both image and video types with a `poster` field for videos.
12. THE Hero_Section SHALL set `preload="metadata"` on all video elements.
13. THE Hero_Section SHALL use only CSS `transform` and `opacity` for all animations.

---

### Requirement 3: Stats Counter Section (Home)

**User Story:** As a visitor, I want to see animated statistics about the AIESEC program, so that I understand the scale and impact of the exchange network.

#### Acceptance Criteria

1. THE Stats_Section SHALL display labeled numeric counters loaded from `/data/stats.ts`.
2. WHEN the Stats_Section enters the Viewport, THE Stats_Section SHALL animate each counter from 0 to its target value.
3. THE Stats_Section SHALL display suffix labels (e.g., "+", "k+") as defined in the data.
4. WHEN the animation has already played and the section re-enters the Viewport, THE Stats_Section SHALL NOT restart the animation.
5. THE Stats_Section SHALL complete each counter animation within 2000ms of entering the Viewport.

---

### Requirement 4: 3D Globe Section (Home)

**User Story:** As a visitor, I want to see a 3D globe showing Tunisia's global connections, so that I understand the international reach of the exchange program.

#### Acceptance Criteria

1. THE Globe_Section SHALL render a 3D interactive globe using `react-globe.gl`, loaded as a client-only dynamic import with `ssr: false`.
2. THE Globe_Section SHALL display Tunisia highlighted in the Accent_Color on the globe surface.
3. THE Globe_Section SHALL render animated arcs from Tunisia to destination countries (outbound) and from source countries to Tunisia (inbound), sourced from `/data/globe-routes.ts`. The initial implementation SHALL include 8–12 arcs for performance focus.
4. WHEN the Globe_Section enters the Viewport, THE GlobeCanvas SHALL initialize and begin rendering — it SHALL NOT initialize before the section is visible.
5. WHILE the GlobeCanvas is loading, THE Globe_Section SHALL display a static dark circular placeholder.
6. THE Globe_Section SHALL use a dark visual style consistent with the overall site theme.
7. THE Globe_Section SHALL auto-rotate slowly and stop rotation when the user interacts with the globe.
8. WHERE a visitor has enabled `prefers-reduced-motion`, THE Globe_Section SHALL disable arc animation and auto-rotation, displaying a static globe.
9. ON mobile viewports, THE Globe_Section SHALL reduce arc count and disable auto-rotation to maintain performance.
10. THE Globe_Section SHALL be responsive, fitting within its container on all viewport sizes.
11. Globe arc data SHALL be typed via the `GlobeArc` interface in `/data/globe-routes.ts`.

---

### Requirement 5: Page Teasers and CTA (Home)

**User Story:** As a visitor who has scrolled the home page, I want clear signposts to the other pages, so that I know where to go next.

#### Acceptance Criteria

1. THE Home_Page SHALL render a set of teaser cards linking to `/discover-bardo`, `/our-projects`, and `/tunisian-lifestyle` using `next/link`.
2. Each teaser card SHALL display a title, short description, and a visual cue.
3. THE CTA_Section SHALL span the full width of the viewport and display "Live your experience with Bardo" with a primary action button in the Accent_Color.

---

### Requirement 6: Discover Bardo Page

**User Story:** As a first-time visitor, I want a page that explains what Bardo and AIESEC Tunisia are, so that I can decide whether this experience is right for me.

#### Acceptance Criteria

1. THE Discover_Page SHALL include a page hero with a tagline and background image.
2. THE Discover_Page SHALL include a "What is Bardo" section explaining the platform's purpose.
3. THE Discover_Page SHALL include a "What AIESEC does here" section covering AIESEC Tunisia's role and history.
4. THE Discover_Page SHALL include a "Why Tunisia" section with at least four distinct reasons, loaded from `/data/discover-bardo.ts`.
5. THE Discover_Page SHALL include a "Who is this for" section with persona cards (e.g., student, young professional, volunteer), loaded from `/data/discover-bardo.ts`.
6. THE Discover_Page SHALL include a participant journey timeline showing the steps from application to completion, loaded from `/data/discover-bardo.ts`.
7. THE Discover_Page SHALL include a support section describing pre-arrival and during-exchange support.
8. THE Discover_Page SHALL include an experience highlights section with at least three highlight blocks or quote cards, loaded from `/data/discover-bardo.ts`.
9. THE Discover_Page SHALL end with a CTA linking to `/our-projects`.
10. All content on THE Discover_Page SHALL be sourced from the Data_Layer — no hardcoded strings inside components.

---

### Requirement 7: Our Projects Page

**User Story:** As a prospective exchange participant, I want to browse and filter available projects, so that I can find an opportunity that matches my interests and timeline.

#### Acceptance Criteria

1. THE Projects_Page SHALL render a grid of Project cards loaded from `/data/projects.ts`.
2. Each Project card SHALL display: title, description, image, city, category, SDG badges, date range, and open/closed status.
3. THE Projects_Page SHALL provide a filter bar with controls for: category, SDG (multi-select), city, status (open/closed), and date range (start and end).
4. WHEN a visitor applies filters, THE Projects_Page SHALL update the displayed project list in real time without page reload.
5. THE Projects_Page SHALL display an active filter summary showing applied filters as removable chips.
6. THE Projects_Page SHALL provide a "Clear all filters" control that resets all filters simultaneously.
7. WHEN no projects match the active filters, THE Projects_Page SHALL display a friendly empty state with a reset CTA.
8. THE Projects_Page SHALL be future-ready for project detail pages: each Project SHALL have a `slug` field, and the route `/our-projects/[slug]` SHALL be reserved (returning a placeholder or 404 for now).
9. THE `Project` interface SHALL include: `id`, `slug`, `title`, `description`, `image`, `alt`, `sdgs` (SDG[]), `startDate`, `endDate`, `city`, `category`, `isOpen`.
10. Filter state SHALL be managed client-side with no server round-trips.

---

### Requirement 8: Tunisian Lifestyle Page

**User Story:** As a first-time visitor preparing for an exchange, I want a practical guide to life in Tunisia, so that I can arrive informed and confident.

#### Acceptance Criteria

1. THE Lifestyle_Page SHALL include a food section reusing the existing `FoodSection` component and `/data/foods.ts`.
2. THE Lifestyle_Page SHALL include a places-to-visit section reusing the existing `PlacesSection` component and `/data/places.ts`.
3. THE Lifestyle_Page SHALL include the interactive cost estimator reusing the existing `EstimatorSection` component.
4. THE Lifestyle_Page SHALL include a transport guide section with options (metro, bus, taxi, apps) loaded from `/data/lifestyle.ts`.
5. THE Lifestyle_Page SHALL include a climate and seasons section with month-by-month or season-based guidance loaded from `/data/lifestyle.ts`.
6. THE Lifestyle_Page SHALL include a language basics section with key phrases in Arabic and French loaded from `/data/lifestyle.ts`.
7. THE Lifestyle_Page SHALL include a local etiquette section with cultural do/don't guidance loaded from `/data/lifestyle.ts`.
8. THE Lifestyle_Page SHALL include a safety and daily life section with practical tips loaded from `/data/lifestyle.ts`.
9. THE Lifestyle_Page SHALL include a "what to pack" section with a checklist-style layout loaded from `/data/lifestyle.ts`.
10. All content on THE Lifestyle_Page SHALL be sourced from the Data_Layer — no hardcoded strings inside components.

---

### Requirement 9: FAQ Page

**User Story:** As a visitor with specific questions, I want a searchable, categorized FAQ page, so that I can quickly find answers and feel confident about the exchange.

#### Acceptance Criteria

1. THE FAQ_Page SHALL render all entries from `/data/faq.ts` as expandable accordion items.
2. THE FAQ_Page SHALL provide a search input that filters visible entries in real time by matching against question text and keywords.
3. THE FAQ_Page SHALL provide category tabs (Cost, Tunisia, AIESEC, General) that filter entries by topic.
4. WHEN both a search query and a category are active, THE FAQ_Page SHALL apply both filters simultaneously.
5. WHEN no entries match the active search and category, THE FAQ_Page SHALL display a friendly empty state.
6. THE FAQ_Page SHALL display a handoff CTA at the bottom: "Still have questions? Contact AIESEC Tunisia" with email and Instagram links.
7. Each accordion item SHALL animate open and closed using a `max-height` CSS transition on the answer panel combined with an `opacity` transition, and a `transform: rotate` transition on the chevron icon. Layout-affecting properties other than `max-height` SHALL NOT be animated.
8. THE FAQ_Page SHALL be keyboard accessible: accordion items SHALL be operable via Enter/Space, and focus SHALL move logically through the list.

---

### Requirement 10: Floating Chat Agent (All Pages)

**User Story:** As a visitor on any page, I want a floating chat assistant I can open at any time, so that I can get quick answers without navigating away.

#### Acceptance Criteria

1. THE Chat_Agent SHALL be anchored to the bottom-right corner of the Viewport and remain visible during scroll on all five pages.
2. THE Chat_Agent SHALL display an animated AIESEC-style SVG character with a continuous idle floating animation.
3. WHEN a visitor clicks the Chat_Agent trigger, THE Chat_Agent SHALL open a chat panel.
4. WHEN a visitor clicks the trigger while the panel is open, THE Chat_Agent SHALL close the panel.
5. THE Chat_Agent SHALL operate entirely on the frontend with no external API calls.
6. THE Chat_Agent SHALL match user input against the unified Knowledge_Base built from `/data/knowledge-base.ts`.
7. THE Knowledge_Base SHALL aggregate entries from: `faq.ts`, `lifestyle.ts`, `discover-bardo.ts`, and `projects.ts`.
8. Each Knowledge_Base entry SHALL conform to the `KnowledgeEntry` interface with fields: `id`, `keywords`, `question`, `answer`, `topic`, `source`.
9. WHEN no Knowledge_Base entry matches the visitor's input, THE Chat_Agent SHALL display a fallback message directing the visitor to contact AIESEC Tunisia.
10. THE Chat_Agent panel SHALL be keyboard accessible with focus trapped inside while open, and closeable via Escape key.
11. THE `matchFaq` utility in `lib/utils.ts` SHALL accept `KnowledgeEntry[]` so it works with the expanded knowledge base without interface changes.

---

### Requirement 11: Performance and Accessibility (All Pages)

**User Story:** As a developer and end user, I want the platform to load fast and be accessible, so that all visitors can use it regardless of device or ability.

#### Acceptance Criteria

1. THE Platform SHALL use `next/image` for all static images.
2. THE Platform SHALL lazy-load all video elements using `preload="metadata"` and only autoplay when in the Viewport.
3. THE Platform SHALL use only CSS `transform` and `opacity` for all animations.
4. THE Platform SHALL include descriptive `alt` attributes on all images, sourced from the Data_Layer.
5. THE Platform SHALL use semantic HTML (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<button>`, `<h1>`–`<h3>`) throughout.
6. WHERE `prefers-reduced-motion` is enabled, THE Platform SHALL disable or reduce all non-essential animations, including globe rotation and arc animation.
7. THE Platform SHALL ensure all interactive elements are keyboard navigable.
8. THE Platform SHALL maintain a mobile-first responsive layout using Tailwind breakpoints at `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`.
9. THE GlobeCanvas SHALL only be initialized when its section enters the Viewport, preventing unnecessary WebGL context creation on page load.
