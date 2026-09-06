# 👥 TeenyImage — Work Division & Developer Task Assignments

> **Team size:** 3 developers
> **Total pages:** 19 (1 home + 16 tools + 2 blog)
> **Total tools:** 16

---

## Branch Overview

```
main
  └── development
        ├── feature/foundation-and-core           ← Dev 1 (Team Lead) — MUST MERGE FIRST
        ├── feature/optimize-and-convert-tools    ← Dev 2 (ratulanik) — starts after Dev 1 merges
        └── feature/edit-security-create-tools    ← Dev 3 (shafinSI) — starts after Dev 1 merges
```

> IMPORTANT: Dev 2 and Dev 3 must wait for Dev 1's branch to merge into development before starting. This ensures shared components, theme, and constants are ready.

---

## Dev 1 — Team Lead (You)

**Branch:** `feature/foundation-and-core`

This is the most critical branch. It establishes everything that Dev 2 and Dev 3 depend on.

### Task Checklist

#### Project Setup
- [ ] Initialize Next.js 16 project with TypeScript and App Router
- [ ] Configure `package.json` — add all dependencies (MUI, Tailwind, Lucide, etc.)
- [ ] Configure `tsconfig.json` with path aliases (`@/` → `src/`)
- [ ] Configure `next.config.ts`
- [ ] Configure `eslint.config.mjs`
- [ ] Configure `postcss.config.mjs`
- [ ] Set up `src/app/globals.css` with Tailwind directives and CSS custom properties

#### Theme & Foundation
- [ ] `src/lib/theme/theme.ts` — MUI theme with brand color, typography, border radius
- [ ] `src/lib/theme/ThemeRegistry.tsx` — MUI emotion cache for Next.js SSR
- [ ] `src/lib/theme/index.ts` — barrel export
- [ ] `src/lib/utils/cn.ts` — Tailwind class merging utility

#### Types
- [ ] `src/types/index.ts` — all shared TypeScript types (ToolFilterCategory, BaseComponentProps, WithIcon, ProcessedFileRecord, Tool re-export)

#### Constants
- [ ] `src/constants/tools.ts` — IMAGE_TOOLS array with all 16 tool definitions (title, description, href, categories, icon, iconClassName, isNew)
- [ ] `src/constants/index.ts` — HERO_CONTENT, NAV_LINKS (with hasDropdown for All Tools), HERO_FILTERS array

#### Context
- [ ] `src/context/AppContext.tsx` — AppProvider with searchQuery state and recentFiles state

#### UI Components (src/components/ui/)
- [ ] `Button/Button.tsx` and `Button/index.ts`
- [ ] `Card/Card.tsx` and `Card/index.ts`
- [ ] `Icon/Icon.tsx` and `Icon/index.ts`
- [ ] `Logo/Logo.tsx` and `Logo/index.ts` — TeenyImage logo with icon
- [ ] `FilterChip/FilterChip.tsx` and `FilterChip/index.ts`
- [ ] `ToolCard/ToolCard.tsx` and `ToolCard/index.ts` — colored icon box + New badge + title + description
- [ ] `components/ui/index.ts` — barrel export for all UI components

#### Layout Components (src/components/layout/)
- [ ] `Container/Container.tsx` and `Container/index.ts` — max-width wrapper
- [ ] `Header/Header.tsx` and `Header/index.ts` — sticky, backdrop-blur, logo + nav + search + hamburger
- [ ] `Footer/Footer.tsx` and `Footer/index.ts` — simple copyright footer
- [ ] `components/layout/index.ts` — barrel export

#### Common Section Components (src/components/common/)
- [ ] `HeroSection/HeroSection.tsx` and `HeroSection/index.ts`
- [ ] `ToolsSection/ToolsSection.tsx` and `ToolsSection/index.ts` — filter chips + tool grid
- [ ] `RecentFilesSection/RecentFilesSection.tsx` and `RecentFilesSection/index.ts`
- [ ] `WorkYourWaySection/WorkYourWaySection.tsx` and `WorkYourWaySection/index.ts` — 3 promo cards
- [ ] `FeatureTrustSection/FeatureTrustSection.tsx` and `FeatureTrustSection/index.ts` — privacy promo + trust badges
- [ ] `ConversionPageLayout.tsx` — shared tool page shell (dropzone + options slot + action button + success state)
- [ ] `components/common/index.ts` — barrel export

#### Tool Layout
- [ ] `src/components/tools/ToolWorkspaceLayout.tsx` — alternative tool page shell

#### App Pages
- [ ] `src/app/layout.tsx` — root layout wrapping AppProvider + ThemeRegistry + Header + Footer
- [ ] `src/app/page.tsx` — home page with all 5 sections
- [ ] `src/app/globals.css` — global styles
- [ ] `src/app/blog/page.tsx` — blog listing page (static placeholder or basic grid)
- [ ] `src/app/blog/[slug]/page.tsx` — blog post page (static placeholder or MDX)

#### Documentation
- [ ] Update `README.md` — full setup guide, tech stack, project structure, scripts

#### Completion Criteria
- `npm run dev` starts without errors
- Homepage renders with all 5 sections
- All 16 tool cards appear in the tools grid
- Header search works (filters tools)
- Blog pages render (even as placeholders)
- `npm run build` succeeds
- Open PR to `development` — tag Dev 2 and Dev 3 to review and then start their work

---

## Dev 2 — ratulanik

**Branch:** `feature/optimize-and-convert-tools`

> Wait for Dev 1's PR to merge into `development`, then:
> `git checkout development && git pull && git checkout -b feature/optimize-and-convert-tools`

### Task Checklist — 8 Tools

#### Tool 1 — Compress Image
- [ ] `src/lib/image/compressImage.ts` — compression logic using browser-image-compression
- [ ] `src/app/compress-image/page.tsx` — UI with 3 quality level buttons, progress, success with size stats

#### Tool 2 — Resize Image
- [ ] `src/lib/image/resizeImage.ts` — canvas-based resize logic
- [ ] `src/app/resize-image/page.tsx` — width/height inputs, px/percent toggle, aspect ratio lock

#### Tool 3 — Upscale Image
- [ ] `src/lib/image/upscaleImage.ts` — canvas bicubic upscaling
- [ ] `src/app/upscale-image/page.tsx` — 2x/4x scale factor buttons

#### Tool 4 — Convert to JPG
- [ ] `src/lib/image/convertToJpg.ts` — canvas toDataURL conversion
- [ ] `src/app/convert-to-jpg/page.tsx` — quality slider, multi-file support, ZIP download

#### Tool 5 — Convert from JPG
- [ ] `src/lib/image/convertFromJpg.ts` — JPG to PNG/GIF/WEBP/animated GIF
- [ ] `src/app/jpg-to-image/page.tsx` — output format selector, animated GIF from multiple files

#### Tool 6 — Convert to PNG
- [ ] `src/lib/image/convertToPng.ts` — lossless conversion to PNG
- [ ] `src/app/convert-to-png/page.tsx` — simple single-option page

#### Tool 7 — Image to PDF
- [ ] `src/lib/image/imageToPdf.ts` — multi-image to PDF using jsPDF
- [ ] `src/app/image-to-pdf/page.tsx` — multi-file upload, drag to reorder, page size/orientation/margin options

#### Tool 8 — HTML to Image
- [ ] `src/lib/image/htmlToImage.ts` — HTML string to canvas to image
- [ ] `src/app/html-to-image/page.tsx` — tab switcher (raw HTML textarea or file upload), output format selector

### Completion Criteria
- All 8 tool pages render correctly
- All 8 tools process files and produce correct downloads
- No TypeScript errors
- Uses ConversionPageLayout for all pages
- `npm run lint` and `npm run build` pass
- Open PR to `development`

---

## Dev 3 — shafinSI

**Branch:** `feature/edit-security-create-tools`

> Wait for Dev 1's PR to merge into `development`, then:
> `git checkout development && git pull && git checkout -b feature/edit-security-create-tools`

### Task Checklist — 8 Tools

#### Tool 1 — Crop Image
- [ ] `src/lib/image/cropImage.ts` — canvas crop logic
- [ ] `src/app/crop-image/page.tsx` — visual crop editor with drag handles, X/Y/W/H inputs, aspect ratio presets

#### Tool 2 — Rotate Image
- [ ] `src/lib/image/rotateImage.ts` — canvas rotate logic
- [ ] `src/app/rotate-image/page.tsx` — 90 CW, 90 CCW, 180 buttons + custom angle input, multi-file ZIP download

#### Tool 3 — Flip Image
- [ ] `src/lib/image/flipImage.ts` — canvas horizontal/vertical flip
- [ ] `src/app/flip-image/page.tsx` — Flip Horizontal and Flip Vertical buttons

#### Tool 4 — Photo Editor (Fullscreen)
- [ ] `src/lib/image/photoEditor/types.ts` — canvas element types
- [ ] `src/lib/image/photoEditor/exportEditedImage.ts` — export canvas to file
- [ ] `src/app/photo-editor/page.tsx` — fullscreen portal editor with toolbar (Select, Text, Pencil, Shapes, Eraser, Image), color picker, undo/redo, zoom, layer management

#### Tool 5 — Meme Generator
- [ ] `src/app/meme-generator/page.tsx` — canvas-based meme editor, top/bottom text inputs, font controls, live preview, download

#### Tool 6 — Remove Background
- [ ] `src/lib/image/removeBackground.ts` — wrapper for @imgly/background-removal (WASM)
- [ ] `src/app/remove-background/page.tsx` — simple upload and auto-process, progress labels, PNG download

#### Tool 7 — Watermark Image
- [ ] `src/lib/image/watermarkImage.ts` — canvas watermark overlay logic (text and image)
- [ ] `src/app/watermark-image/page.tsx` — text/image type toggle, 9-grid position selector, opacity slider, font size, color picker, multi-file ZIP

#### Tool 8 — Blur Face
- [ ] `src/lib/image/blurFace.ts` — canvas blur region logic
- [ ] `src/app/blur-face/page.tsx` — blur intensity selector, auto/manual mode toggle

### Completion Criteria
- All 8 tool pages render correctly
- All 8 tools process files and produce correct downloads
- Photo Editor launches as fullscreen portal and exports correctly
- No TypeScript errors
- `npm run lint` and `npm run build` pass
- Open PR to `development`

---

## Shared Responsibility

These items are the responsibility of ALL developers:

| Item | Standard |
|---|---|
| Commit messages | Follow Conventional Commits (see CONTRIBUTING.md) |
| PR descriptions | Use the PR template in CONTRIBUTING.md |
| TypeScript | No `any` types — always explicit |
| Component imports | Always use path aliases (@/) never relative (../../) |
| Console logs | Remove all console.log before opening a PR |
| Accessibility | alt text on images, aria-labels on icon buttons |
| Privacy label | Every upload area must show the privacy label |

---

## Timeline Suggestion

| Phase | Who | Duration |
|---|---|---|
| Foundation | Dev 1 | 3-5 days |
| Parallel tool development | Dev 2 + Dev 3 | 5-7 days |
| Integration testing | All 3 | 1-2 days |
| Bug fixes and polish | All 3 | 1-2 days |
| Release: development → main | Dev 1 | 1 day |

**Estimated total: 10-16 days**
