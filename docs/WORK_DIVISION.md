# 👥 TeenyImage — Work Division, Architecture Pillars & AI Agent Execution Plan

> **Organization:** FluvoSoft Research & Development  
> **Team Members:** `@obsessus` (Lead Architect), `@ratulanik`, `@shafinSI`  
> **Total Pages:** 20 (Home + 16 Tool Pages + Blog Index + Dynamic Blog Posts + 404)  
> **Total Tools:** 16 (100% Client-Side in browser)  
> **AI Agent Guide:** Refer to [AGENTS.md](../AGENTS.md) for automated execution rules.

---

## 🏛️ The 8 Pillars of a Complete Production Application

Building a world-class application requires far more than just individual feature pages. Work is structured around **8 core pillars** so that when all branches merge, the final software is robust, production-ready, performant, and fully shippable.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        THE 8 ARCHITECTURE PILLARS                       │
├────────────────────────────────┬────────────────────────────────────────┤
│ 1. Core Foundation & Scaffold  │ 5. Content & Blog Engine               │
│ 2. Tool Processing Logic & UI  │ 6. Error Handling & 404 Resilience     │
│ 3. Brand Assets & Visual Media │ 7. Performance & Bundle Optimization   │
│ 4. Search Engine Optimization  │ 8. CI/CD & Production Deployment       │
└────────────────────────────────┴────────────────────────────────────────┘
```

---

## 🌿 Git Synchronization Model

```
                                      main (Release)
                                       ▲
                                       │ (PR upon complete QA)
                                  development
                                       ▲
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
          @ratulanik               @shafinSI              @obsessus
   feature/optimize-and-convert feature/edit-security  feature/seo-assets-infra
        (Pillars 2, 6)          (Pillars 2, 6)        (Pillars 3, 4, 5, 7, 8)
```

> **Zero Merge Conflicts Rule:** Each developer operates strictly in dedicated files. Shared components (`ConversionPageLayout`, `Header`, `Footer`, `Theme`) are pre-built in `development` and consumed without cross-branch modification.

---

## 👤 @obsessus — Team Lead & Systems Architect

**Branches:** `feature/foundation-and-core` (COMPLETED ✅) ➔ `feature/seo-assets-infra`  
**Primary Focus:** Pillars 1, 3, 4, 5, 7, 8 & System Integration

### Task Checklist

#### Pillar 1: Core Foundation & Shared Infrastructure (COMPLETED)
- [x] Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + MUI v9 setup
- [x] Root layout (`src/app/layout.tsx`) with Poppins font and metadata shells
- [x] MUI Theme Registry (`src/lib/theme/ThemeRegistry.tsx`) & Emotion cache
- [x] Global design tokens & styling in `src/app/globals.css`
- [x] Shared UI primitives (`Button`, `Card`, `Icon`, `Logo`, `FilterChip`, `ToolCard`)
- [x] Global layout components (`Header` with real-time search, `Footer`, `Container`)
- [x] Central tool registry in `src/constants/tools.ts` (16 tools, categories, icons, color tokens)
- [x] Navigation & filter constants in `src/constants/index.ts`
- [x] Global session state in `src/context/AppContext.tsx` (Search & Recent Files)
- [x] Shared tool page shell: `src/components/common/ConversionPageLayout.tsx`
- [x] Alternative workspace layout: `src/components/tools/ToolWorkspaceLayout.tsx`
- [x] Homepage sections: `HeroSection`, `ToolsSection`, `WorkYourWaySection`, `FeatureTrustSection`, `RecentFilesSection`
- [x] Scaffold 16 placeholder tool pages with route verification
- [x] Documentation & Guides: `PRD.md`, `WORK_DIVISION.md`, `CONTRIBUTING.md`, `AGENTS.md`

#### Pillar 3: Visual Identity & Brand Assets
- [ ] Design and produce high-resolution `/favicon.svg` and multi-size `/favicon.ico`
- [ ] Create `/images/og-image.png` (1200x630) for OpenGraph and Twitter social sharing
- [ ] Create promo card illustrations in `public/images/work-your-way/`:
  - `desktop.png` (Desktop batch processing promo)
  - `mobile.png` (Mobile responsive tools promo)
  - `business.png` (Business & professional privacy promo)
- [ ] Create `public/images/feature/privacy-promo.png` (Security & privacy highlight)

#### Pillar 4: SEO, Metadata, Sitemap & Robots
- [ ] Implement dynamic or comprehensive per-route `metadata` for all 20 pages
- [ ] Generate dynamic `src/app/sitemap.ts` (lists all 16 tools, home, blog)
- [ ] Create `src/app/robots.ts` with proper indexing instructions
- [ ] Add JSON-LD Structured Data (`WebSite`, `SoftwareApplication`) for high Google CTR

#### Pillar 5: Blog & Editorial Engine
- [ ] Build functional blog index in `src/app/blog/page.tsx` with category filters and article cards
- [ ] Implement article template in `src/app/blog/[slug]/page.tsx` with breadcrumbs, author, date, top CTA, related tool links, and bottom CTA
- [ ] Author 3 starter SEO-targeted articles:
  1. *How to Compress Images for the Web Without Losing Quality*
  2. *JPG vs PNG vs WEBP: Which Image Format Should You Use?*
  3. *Why Client-Side Image Processing Protects Your Sensitive Photos*

#### Pillar 6 & 7: Resilience, 404 & Performance Optimization
- [ ] Build custom branded 404 page in `src/app/not-found.tsx`
- [ ] Create global error boundary in `src/app/error.tsx`
- [ ] Optimize bundle: Ensure heavy client-side libraries (WASM, jsPDF) are dynamically loaded (`React.lazy` / dynamic imports) on demand

#### Pillar 8: CI/CD & Release Management
- [ ] Review and merge PRs from `@ratulanik` and `@shafinSI` into `development`
- [ ] Configure GitHub Actions workflow for automated type-check and linting on PR
- [ ] Final integration QA on `development`
- [ ] Release PR: `development` ➔ `main`

---

## 👤 @ratulanik — Conversion & Optimization Engineer

**Branch:** `feature/optimize-and-convert-tools`  
**Primary Focus:** Pillar 2 (8 Conversion & Optimization Tools) & Pillar 6 (Tool-level UX Resilience)

### AI Agent / Developer Start Condition
```bash
git checkout development
git pull origin development
git checkout -b feature/optimize-and-convert-tools
```

### Task Checklist — 8 Tools

#### 1. Compress Image (`/compress-image`)
- [ ] Logic: `src/lib/image/compressImage.ts` (using `browser-image-compression` or Canvas quality scaling)
- [ ] UI: `src/app/compress-image/page.tsx` (Quality selector: Strong, Recommended, High Quality)
- [ ] UX: Displays original file size vs compressed size + reduction % badge

#### 2. Resize Image (`/resize-image`)
- [ ] Logic: `src/lib/image/resizeImage.ts` (Canvas-based pixel / percentage resizing)
- [ ] UI: `src/app/resize-image/page.tsx` (Width/Height inputs, Aspect Ratio lock toggle, % vs px toggle)

#### 3. Upscale Image (`/upscale-image`)
- [ ] Logic: `src/lib/image/upscaleImage.ts` (Canvas 2x / 4x bicubic scaling)
- [ ] UI: `src/app/upscale-image/page.tsx` (2x and 4x scale buttons, before/after resolution preview)

#### 4. Convert to JPG (`/convert-to-jpg`)
- [ ] Logic: `src/lib/image/convertToJpg.ts` (Supports PNG, GIF, WEBP, SVG, BMP ➔ JPG)
- [ ] UI: `src/app/convert-to-jpg/page.tsx` (Quality slider 1–100, batch files upload)
- [ ] UX: Multi-file batch convert with ZIP download via JSZip

#### 5. Convert from JPG (`/jpg-to-image`)
- [ ] Logic: `src/lib/image/convertFromJpg.ts` (JPG ➔ PNG, WEBP, GIF)
- [ ] UI: `src/app/jpg-to-image/page.tsx` (Target format dropdown, quality controls)

#### 6. Convert to PNG (`/convert-to-png`)
- [ ] Logic: `src/lib/image/convertToPng.ts` (Lossless conversion to PNG format)
- [ ] UI: `src/app/convert-to-png/page.tsx` (Drag-and-drop batch upload, direct lossless convert)

#### 7. Image to PDF (`/image-to-pdf`)
- [ ] Logic: `src/lib/image/imageToPdf.ts` (Client-side PDF compilation via `jsPDF`)
- [ ] UI: `src/app/image-to-pdf/page.tsx` (Page size A4/Letter/Original, Orientation portrait/landscape, Margins)
- [ ] UX: Thumbnail reordering list prior to PDF compilation

#### 8. HTML to Image (`/html-to-image`)
- [ ] Logic: `src/lib/image/htmlToImage.ts` (Render raw HTML / SVG to canvas ➔ JPG/PNG)
- [ ] UI: `src/app/html-to-image/page.tsx` (Tabs: Raw HTML textarea / File upload, Output format switch)

### Stop & Self-Assessment Criteria
- [ ] All 8 tool pages compile with `npm run build` without TypeScript errors
- [ ] Corrupt image upload shows a clean, non-crashing error notification
- [ ] Object URLs are revoked after download to prevent memory leaks
- [ ] Commit history follows `feat(tool-name): message` format
- [ ] PR created targeting `development` branch (reviewed by `@obsessus`)

---

## 👤 @shafinSI — Creative, Security & Editing Engineer

**Branch:** `feature/edit-security-create-tools`  
**Primary Focus:** Pillar 2 (8 Editing, Security & Creative Tools) & Pillar 6 (Tool-level UX Resilience)

### AI Agent / Developer Start Condition
```bash
git checkout development
git pull origin development
git checkout -b feature/edit-security-create-tools
```

### Task Checklist — 8 Tools

#### 1. Crop Image (`/crop-image`)
- [ ] Logic: `src/lib/image/cropImage.ts` (Canvas sub-rectangle extraction)
- [ ] UI: `src/app/crop-image/page.tsx` (Interactive draggable crop box, aspect ratio presets: Free, 1:1, 4:3, 16:9)

#### 2. Rotate Image (`/rotate-image`)
- [ ] Logic: `src/lib/image/rotateImage.ts` (Canvas rotation with canvas bounds re-calculation)
- [ ] UI: `src/app/rotate-image/page.tsx` (Rotate 90° CW, 90° CCW, 180°, custom angle slider)
- [ ] UX: Batch rotate with ZIP download

#### 3. Flip Image (`/flip-image`)
- [ ] Logic: `src/lib/image/flipImage.ts` (Canvas `scale(-1, 1)` and `scale(1, -1)`)
- [ ] UI: `src/app/flip-image/page.tsx` (Flip Horizontal & Flip Vertical buttons, live preview)

#### 4. Photo Editor (`/photo-editor`)
- [ ] Logic: `src/lib/image/photoEditor/exportEditedImage.ts` & `types.ts`
- [ ] UI: `src/app/photo-editor/page.tsx` (Fullscreen portal editor modeled after TeenyPDF Edit PDF)
- [ ] Features: Select tool, Freehand pencil, Text overlays, Shapes (Rectangle, Circle, Arrow), Color picker, Undo/Redo, Zoom, Layer controls

#### 5. Meme Generator (`/meme-generator`)
- [ ] Logic: Canvas text overlay with black stroke and white fill (Impact font standard)
- [ ] UI: `src/app/meme-generator/page.tsx` (Top text, Bottom text, Font size, Live canvas preview)

#### 6. Remove Background (`/remove-background`)
- [ ] Logic: `src/lib/image/removeBackground.ts` (Client-side `@imgly/background-removal` via WASM)
- [ ] UI: `src/app/remove-background/page.tsx` (One-click auto removal, transparency checkerboard preview, PNG export)

#### 7. Watermark Image (`/watermark-image`)
- [ ] Logic: `src/lib/image/watermarkImage.ts` (Overlay text or image with alpha opacity)
- [ ] UI: `src/app/watermark-image/page.tsx` (Text / Image mode, 9-point anchor grid selector, Opacity slider, Font styling)
- [ ] UX: Apply watermark to batch images with ZIP download

#### 8. Blur Face (`/blur-face`)
- [ ] Logic: `src/lib/image/blurFace.ts` (Pixelate / Gaussian blur filter over selected canvas coordinates)
- [ ] UI: `src/app/blur-face/page.tsx` (Manual selection blur box + Blur intensity slider Low/Med/High)

### Stop & Self-Assessment Criteria
- [ ] All 8 tool pages compile with `npm run build` without TypeScript errors
- [ ] Photo Editor launches in full screen and exports clear images
- [ ] Corrupt file upload handles errors gracefully
- [ ] Object URLs are revoked after download to prevent memory leaks
- [ ] Commit history follows `feat(tool-name): message` format
- [ ] PR created targeting `development` branch (reviewed by `@obsessus`)

---

## 📅 Milestones & Convergence Schedule

| Milestone | Deliverables | Responsible | Target |
|---|---|---|---|
| **M1: Foundation** | Project scaffold, layout, types, constants, 20 route shells | `@obsessus` | ✅ DONE |
| **M2: Core Features** | 8 Conversion & Optimization tools | `@ratulanik` | In Progress |
| **M3: Creative Features**| 8 Editing, Security & Creative tools | `@shafinSI` | In Progress |
| **M4: Production Polish**| Assets, SEO, Blog, 404, Performance lazy-loading | `@obsessus` | In Progress |
| **M5: Integration QA** | Complete end-to-end testing on `development` | All three | Milestone 4 + 1 day |
| **M6: Launch** | PR merge `development` ➔ `main` | `@obsessus` | Launch day |