# Implementation Plan: Hero Visual Editor (Phase 1)

## Overview

Implement a config-driven hero layout editor for the AIESEC Tunisia Next.js site. The work proceeds in layers: types → defaults → storage → API → preview component → public page refactor → editor UI. Each task is independently deployable and builds on the previous.

## Tasks

- [x] 1. Define types and default config
  - [x] 1.1 Create `lib/hero-layout-types.ts` with all interfaces
    - Define `LayerProps`, `ParallaxConfig`, `LayerType`
    - Define `ImageLayerConfig`, `BadgeGroupConfig`, `TextOverlayConfig`, `AnyLayer`
    - Define `HeroLayoutConfig { id: "hero"; version: number; layers: AnyLayer[] }`
    - Export all types
    - _Requirements: schema section of approved architecture_

  - [x] 1.2 Create `lib/hero-layout-defaults.ts` with `DEFAULT_HERO_CONFIG`
    - Hardcode all 6 layers matching current `HeroSection.tsx` values exactly:
      - `bg`: background, z:0, yFactor:-0.05, assetPath:"/hero/bg.png"
      - `main-1`: image, z:10, yFactor:-0.12, assetPath:"/hero/main-1.png"
      - `badge-group`: z:20, yFactor:-0.20, radius:38, startAngleDeg:-90, centerBadgeIndex:0, 6 badges from `/badges/badge-1..6.png`
      - `main-2`: image, z:30, yFactor:-0.30, assetPath:"/hero/main-2.png"
      - `main-3`: image, z:40, yFactor:-0.42, assetPath:"/hero/main-3.png"
      - `text-overlay`: z:50, maxWidth:384, textAlign:"center", showEyebrow:false, showSubtitle:true
    - Desktop and mobile `LayerProps` for each layer should reflect current hardcoded positions
    - _Requirements: default config section of approved architecture_

- [x] 2. Implement storage layer
  - [x] 2.1 Create `data/layouts/.gitkeep` placeholder file
    - Ensures the directory is tracked in git
    - _Requirements: storage abstraction section_

  - [x] 2.2 Create `lib/layout-store.ts` implementing `LayoutStore` interface
    - Import `fs/promises` and path utilities
    - `DRAFT_PATH = "data/layouts/hero.draft.json"`, `PUBLISHED_PATH = "data/layouts/hero.published.json"`
    - `loadDraft()`: read draft file, parse JSON, return `HeroLayoutConfig`; if file missing return `DEFAULT_HERO_CONFIG`
    - `saveDraft(config)`: write JSON to draft file, create directory if needed
    - `loadPublished()`: read published file, return `HeroLayoutConfig | null`; return null if missing
    - `publish(config)`: write JSON to published file
    - Export a singleton `layoutStore` instance
    - _Requirements: storage abstraction section_

  - [ ]* 2.3 Write unit tests for layout-store
    - Test `loadDraft` returns default when file missing
    - Test `saveDraft` then `loadDraft` round-trips correctly
    - Test `loadPublished` returns null when file missing
    - Test `publish` then `loadPublished` round-trips correctly
    - _Requirements: storage abstraction section_

- [x] 3. Implement API route
  - [x] 3.1 Create `app/api/admin/layout/hero/route.ts`
    - `GET`: call `layoutStore.loadDraft()`, return JSON response
    - `POST` with `{ action: "save", config }`: call `layoutStore.saveDraft(config)`, return `{ ok: true }`
    - `POST` with `{ action: "publish", config }`: call `layoutStore.saveDraft(config)` then `layoutStore.publish(config)`, return `{ ok: true }`
    - Validate request body shape; return 400 on invalid input
    - _Requirements: route structure and draft vs published sections_

- [x] 4. Build HeroSectionPreview component
  - [x] 4.1 Create `components/sections/HeroSectionPreview.tsx`
    - Accept props: `config: HeroLayoutConfig`, `mode: "desktop" | "mobile"`
    - Render each layer from `config.layers` sorted by the active breakpoint's `zIndex`
    - For each layer, read `layer[mode]` for `LayerProps` (x, y, width, zIndex, rotation, opacity, visible)
    - Apply `parallax.yFactor` via the existing `useVerticalParallax` pattern (import from `HeroSection` or inline)
    - Skip layers where `visible === false`
    - For `type === "background" | "image"`: render `<img>` with `position:absolute`, `left: x%`, `top: y%`, `width: width%`, `transform: rotate(rotation)`, `opacity`, `zIndex`
    - For `type === "badge-group"`: compute badge positions from `arrangement.radius`, `arrangement.startAngleDeg`, `arrangement.centerBadgeIndex`; render badges using same circular layout logic as current `HeroSection`
    - For `type === "text"`: render the existing text overlay markup, respecting `maxWidth`, `textAlign`, `showEyebrow`, `showSubtitle`
    - Wrap in `"use client"` directive (needs framer-motion scroll hooks)
    - _Requirements: HeroSectionPreview section_

  - [ ]* 4.2 Write unit tests for HeroSectionPreview
    - Test that layers with `visible: false` are not rendered
    - Test that layers are rendered in correct z-index order
    - Test badge-group circular position math matches expected coordinates
    - _Requirements: HeroSectionPreview section_

- [x] 5. Refactor public HeroSection to use HeroSectionPreview
  - [x] 5.1 Modify `components/sections/HeroSection.tsx`
    - Remove all hardcoded layer rendering logic
    - Keep `"use client"` directive
    - Accept optional `config?: HeroLayoutConfig` prop
    - If no config provided, use `DEFAULT_HERO_CONFIG` as fallback
    - Delegate all rendering to `<HeroSectionPreview config={config} mode="desktop" />`
    - Preserve the section wrapper, `aria-label`, and bottom fade overlay
    - _Requirements: HeroSectionPreview and modified files sections_

  - [x] 5.2 Modify `app/[locale]/page.tsx`
    - Make `HomePage` an async server component
    - Call `layoutStore.loadPublished()` at the top
    - Fall back to `DEFAULT_HERO_CONFIG` if result is null
    - Pass `config` prop to `<HeroSection config={config} />`
    - _Requirements: draft vs published section_

- [x] 6. Checkpoint — verify public page still renders correctly
  - Ensure `HeroSection` renders identically to before the refactor when using `DEFAULT_HERO_CONFIG`
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Build admin shell and dashboard
  - [x] 7.1 Create `app/admin/layout.tsx`
    - Minimal shell layout: no auth, no locale wrapping
    - Render `{children}` inside a plain `<html><body>` with basic admin styles
    - Import `globals.css`
    - _Requirements: route structure section_

  - [x] 7.2 Create `app/admin/page.tsx`
    - Simple dashboard page with a heading and a link to `/admin/editor/hero`
    - Server component
    - _Requirements: route structure section_

- [x] 8. Build editor page and client shell
  - [x] 8.1 Create `app/admin/editor/hero/page.tsx`
    - Async server component
    - Call `layoutStore.loadDraft()` to get initial config
    - Render `<EditorClient initialConfig={config} />`
    - _Requirements: route structure and editor UI sections_

  - [x] 8.2 Create `app/admin/editor/hero/EditorClient.tsx` — state and toolbar
    - `"use client"` directive
    - Accept `initialConfig: HeroLayoutConfig` prop
    - Local state: `config`, `mode: "desktop" | "mobile"`, `selectedLayerId: string | null`, `status: "idle" | "saving" | "publishing"`
    - Toolbar: [Desktop | Mobile] tab buttons that set `mode`; status badge showing "Draft" or "Published"; [Save Draft] button calling `POST /api/admin/layout/hero` with `{ action: "save", config }`; [Publish] button calling `POST` with `{ action: "publish", config }`
    - Layout: two-column — canvas on left, panels on right
    - Wire `selectedLayerId` state between canvas and panels (pass as props)
    - _Requirements: editor UI section_

- [x] 9. Build editor canvas with drag positioning
  - [x] 9.1 Add canvas area to `EditorClient.tsx`
    - Render `<HeroSectionPreview config={config} mode={mode} />` inside a fixed-aspect-ratio container
    - Overlay click targets on each visible layer using `position:absolute` divs matching each layer's rendered bounds
    - Clicking a layer sets `selectedLayerId`
    - Highlight selected layer with a visible outline
    - _Requirements: editor UI — canvas section_

  - [x] 9.2 Implement drag-to-reposition on canvas
    - On `mousedown` on a layer overlay div, begin drag tracking
    - On `mousemove`, compute delta as percentage of canvas container dimensions
    - Update `config.layers[i][mode].x` and `.y` in state (immutable update)
    - On `mouseup`, end drag
    - Use `useRef` for the canvas container to compute percentage coordinates
    - _Requirements: phase 1 scope — drag positioning_

- [x] 10. Build layer list panel
  - [x] 10.1 Add layer list panel to `EditorClient.tsx`
    - Render ordered list of layers from `config.layers`, sorted by `layer[mode].zIndex` descending
    - Each row shows layer label and a visibility eye icon (toggle `layer[mode].visible`)
    - Clicking a row sets `selectedLayerId`
    - Highlight the selected layer row
    - _Requirements: editor UI — layer list panel_

  - [x] 10.2 Implement drag-to-reorder z-index in layer list
    - Use HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) on layer rows
    - On drop, reassign `zIndex` values for all layers in the current `mode` based on new order (top of list = highest z)
    - Update `config` state immutably
    - _Requirements: phase 1 scope — layer order_

- [x] 11. Build property panel
  - [x] 11.1 Add base property panel to `EditorClient.tsx`
    - Render below the layer list when `selectedLayerId` is not null
    - Show number inputs for: x (%), y (%), width (%), zIndex, rotation (deg)
    - Show opacity slider (0–1, step 0.01)
    - Show visible toggle checkbox (per current `mode`)
    - Show parallax yFactor number input (step 0.01)
    - Each input reads from `config.layers[selectedIndex][mode]` and updates state on change
    - _Requirements: editor UI — property panel_

  - [x] 11.2 Add badge-group specific controls to property panel
    - When selected layer `type === "badge-group"`, show:
      - Radius slider (0–100, step 1) bound to `arrangement.radius`
      - startAngleDeg number input bound to `arrangement.startAngleDeg`
    - _Requirements: editor UI — property panel badge-group controls_

  - [x] 11.3 Add text-overlay specific controls to property panel
    - When selected layer `type === "text"`, show:
      - maxWidth number input bound to `layer[mode].maxWidth`
      - textAlign select (left / center / right) bound to `layer[mode].textAlign`
      - showEyebrow toggle bound to `layer[mode].showEyebrow`
      - showSubtitle toggle bound to `layer[mode].showSubtitle`
    - _Requirements: editor UI — property panel text-overlay controls_

- [x] 12. Final checkpoint — full editor flow
  - Verify: load editor → drag a layer → save draft → publish → reload public page shows updated layout
  - Ensure all tests pass, ask the user if questions arise.
