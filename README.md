# AIESEC Tunisia / Bardo — Landing Page

A production-grade, immersive landing page for the AIESEC Tunisia / Bardo experience platform.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **lucide-react**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app              — Next.js App Router pages and layout
/components
  /layout         — Navbar, Footer
  /sections       — Page sections (Hero, Stats, Map, Food, Places, Estimator, CTA)
  /ui             — Shared UI primitives (MediaCard, FoodCard, PlaceCard, StatCounter, Slider)
  /chat           — ChatAgent, ChatPanel
  /map            — TunisiaMap SVG component
/data             — Typed content data files
/lib
  /hooks          — Custom React hooks (useInView, useParallax, useCounter)
  utils.ts        — Utility functions (cn, matchFaq)
/public
  /images         — Static images
  /reels          — Video files
```

## Content

All page content is driven by typed data files in `/data`:

- `hero-media.ts` — Hero section media cards
- `stats.ts` — Animated statistics
- `foods.ts` — Tunisian food showcase
- `places.ts` — Places to visit
- `faq.ts` — Chat agent FAQ responses

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run test      # Run tests (vitest)
npm run lint      # ESLint
```
