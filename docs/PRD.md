# 📋 TeenyImage — Product Requirements Document (PRD)

> **Version:** 1.0.0
> **Organization:** FluvoSoft Research & Development
> **Status:** Active Development
> **Last Updated:** September 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Non-Goals](#2-goals--non-goals)
3. [Target Audience](#3-target-audience)
4. [Tech Stack](#4-tech-stack)
5. [Design System](#5-design-system)
6. [Site Architecture](#6-site-architecture)
7. [Global Layout](#7-global-layout)
8. [Homepage Specification](#8-homepage-specification)
9. [All 16 Tool Pages](#9-all-16-tool-pages)
10. [Blog Section](#10-blog-section)
11. [Component Architecture](#11-component-architecture)
12. [State Management](#12-state-management)
13. [Folder Structure](#13-folder-structure)
14. [Privacy & Security Requirements](#14-privacy--security-requirements)
15. [Performance Requirements](#15-performance-requirements)
16. [Browser Support](#16-browser-support)
17. [Accessibility Requirements](#17-accessibility-requirements)

---

## 1. Project Overview

**TeenyImage** is a free, browser-based image processing web application built by FluvoSoft. It is the image-focused sibling product of [TeenyPDF](https://www.teenypdf.com), which currently serves approximately 2,000 users.

TeenyImage is directly inspired by [iLoveIMG](https://www.iloveimg.com), offering a nearly identical feature set with one critical differentiator:

> **TeenyImage never uploads your files to a server. All processing happens 100% in your browser.**

This privacy-first approach is the core product identity — matching TeenyPDF's positioning in the PDF space.

### Relationship to Existing Products

| Product | Inspired By | Status |
|---|---|---|
| TeenyPDF | iLovePDF | Live at teenypdf.com (~2,000 users) |
| **TeenyImage** | iLoveIMG | In Development |

TeenyImage must visually and structurally feel like it belongs to the same organization as TeenyPDF. Same brand color, same layout conventions, same component patterns, same privacy-first messaging.

---

## 2. Goals & Non-Goals

### Goals
- Replicate iLoveIMG's full tool suite (13 core tools + 3 additional)
- Process all images 100% client-side — no server uploads ever
- Match TeenyPDF's visual identity (same brand color, fonts, layout)
- Include a Blog section for SEO and organic traffic
- Support 16 image tools across 5 categories (Optimize, Edit, Convert, Create, Security)
- Be fully responsive (mobile, tablet, desktop)
- Achieve fast initial load and smooth UX

### Non-Goals
- User accounts, login, or signup — will NEVER be added
- Server-side image processing
- File storage or history saved to cloud
- Paid tiers or subscription model (for v1)
- Mobile native apps (web only)
- Dark mode (not in v1)

---

## 3. Target Audience

- Students and professionals who need quick image edits
- Privacy-conscious users who do not want to upload personal images to cloud services
- Users frustrated by iLoveIMG's login requirements and data tracking
- Content creators needing watermarks, meme generation, background removal
- Developers and designers doing batch image conversions

---

## 4. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | ^16.x |
| UI Library | React | ^19.x |
| Language | TypeScript | ^6.x |
| Styling | Tailwind CSS | v4 |
| Component Library | Material UI (MUI) | v9 |
| Icons | Lucide React | latest |
| Font | Poppins (Google Fonts) | 400, 500, 600, 700 |
| Image Processing | Browser Canvas API, browser-image-compression | latest |
| BG Removal | @imgly/background-removal (WASM, browser-side) | latest |
| PDF Generation | jsPDF | latest |
| Package Manager | npm | latest |

This is the exact same stack as TeenyPDF, ensuring consistent developer experience across both products.

---

## 5. Design System

### Brand Colors

| Token | Value | Usage |
|---|---|---|
| brand | #e5322d | CTAs, active states, badges, links |
| brand-dark | #d42b26 | Hover state |
| background | #faf9f7 | Page background |
| surface | #ffffff | Card and panel background |
| border | #e8e6e3 | Borders, dividers |
| text-primary | #000000 | Headings, body text |
| text-secondary | #333333 | Subtitles, descriptions |

### Typography (Poppins)

| Style | Weight | Size |
|---|---|---|
| H1 hero | 600 | 28px to 42px responsive |
| H2 section | 800 | 24px to 40px |
| H3 card title | 600 | 16px |
| Body | 400 | 14px to 17px |
| Nav links | 600 | 13px |
| Badge chip | 700 | 11px |

### Component Conventions

Every component lives in its own folder with a barrel export:

```
components/ui/Button/
├── Button.tsx
└── index.ts
```

Import via path aliases:

```tsx
import { Button, Card, ToolCard } from "@/components/ui";
import { Header, Footer, Container } from "@/components/layout";
import { HeroSection, ToolsSection } from "@/components/common";
```

---

## 6. Site Architecture

### All Pages (19 total)

| Page | Route | Type |
|---|---|---|
| Home | / | Landing page |
| Compress Image | /compress-image | Tool page |
| Resize Image | /resize-image | Tool page |
| Crop Image | /crop-image | Tool page |
| Rotate Image | /rotate-image | Tool page |
| Flip Image | /flip-image | Tool page |
| Convert to JPG | /convert-to-jpg | Tool page |
| Convert from JPG | /jpg-to-image | Tool page |
| Convert to PNG | /convert-to-png | Tool page |
| Image to PDF | /image-to-pdf | Tool page |
| HTML to Image | /html-to-image | Tool page |
| Photo Editor | /photo-editor | Tool page fullscreen |
| Meme Generator | /meme-generator | Tool page |
| Upscale Image | /upscale-image | Tool page |
| Remove Background | /remove-background | Tool page |
| Watermark Image | /watermark-image | Tool page |
| Blur Face | /blur-face | Tool page |
| Blog Listing | /blog | Blog index |
| Blog Post | /blog/[slug] | Individual article |

---

## 7. Global Layout

Every page uses the root layout defined in src/app/layout.tsx:

- Sticky Header with backdrop blur
- Main content area (varies per page)
- Footer with copyright

### Header Navigation (desktop)

| Label | Href | Notes |
|---|---|---|
| Compress Image | /compress-image | |
| Resize Image | /resize-image | |
| Crop Image | /crop-image | |
| Convert to JPG | /convert-to-jpg | |
| Blog | /blog | |
| All Tools | / | hasDropdown: true — shows ChevronDown icon |

Search bar: Real-time filter against all tool titles and descriptions. Shows dropdown of matching tools with icon, title, and description.

Mobile: Hamburger menu slides down. Body scroll locked when open.

### Footer

```
© 2026 TeenyImage. Built with FluvoSoft.
```

Centered, minimal. No additional navigation links.

---

## 8. Homepage Specification

The homepage renders 5 sections stacked vertically.

### Section 1 — HeroSection
- H1: Every image tool you need — free, private, in your browser
- Subtitle: Compress, resize, crop, convert, edit and more — 100% free, browser-based, and private.
- Decorative blurred red blobs in background (CSS only, aria-hidden)

### Section 2 — RecentFilesSection (conditional)
- Only shown if user processed images this session
- Clock icon + file count badge
- Search bar to filter by name or tool used
- Clear button with trash icon
- Grid of file cards: filename, tool used, timestamp, download button

### Section 3 — ToolsSection

Filter chips (horizontally scrollable on mobile, wraps on desktop):
```
All | Optimize | Edit | Convert | Create | Security
```

Tools grid (1 col to 2 to 3 to 4 to 6 cols responsive).

All 16 Tool Cards:

| Tool | Category | Icon Color |
|---|---|---|
| Compress Image | Optimize | Green #16a34a on #e8f7ef |
| Resize Image | Edit | Blue #2563eb on #e8f0fe |
| Crop Image | Edit | Teal #0891b2 on #e0f7fa |
| Rotate Image | Edit | Orange #ea580c on #fff0e6 |
| Flip Image | Edit | Purple #7c3aed on #f3e8ff |
| Convert to JPG | Convert | Yellow #ca8a04 on #fef9c3 |
| Convert from JPG | Convert | Yellow #ca8a04 on #fef9c3 |
| Convert to PNG | Convert | Indigo #6366f1 on #eef2ff |
| Image to PDF | Convert | Red #dc2626 on #fef2f2 |
| HTML to Image | Convert | Blue #3498db on #e8f0fe |
| Photo Editor | Create | Purple #7c3aed on #f3e8ff |
| Meme Generator | Create | Pink #db2777 on #fdf2f8 |
| Upscale Image | Optimize | Green #16a34a on #e8f7ef |
| Remove Background | Optimize | Green #5f8c30 on #e5f5d2 |
| Watermark Image | Security | Blue #4a7aab on #e8f0fe |
| Blur Face | Security | Gray #64748b on #f1f5f9 |

### Section 4 — WorkYourWaySection

Title: Work your way

3 promotional cards in a responsive grid:
1. Work offline with Desktop — Batch process images in your browser — private, local, and with no upload limits.
2. On-the-go with Mobile — Your favorite image tools, right in your pocket.
3. Built for business — Automate image workflows, onboard teams easily, and scale processing with flexible plans.

Each card has: image area with peach background, title, description, ArrowUpRight icon (animates red on hover).

### Section 5 — FeatureTrustSection

Sub-section A — Feature Highlight (2-column grid):
- Left: privacy-promo.png image in 4:3 aspect ratio rounded container
- Right: H2 "Image editing made simple with TeenyImage" + paragraph + "Explore all tools" outlined red button

Sub-section B — Trust Band:
- H2: The image tool built for private, everyday work
- 3 trust icons: 100% Browser-based (WifiOff icon), Private by design (Lock icon), No account required (ShieldCheck icon)

---

## 9. All 16 Tool Pages

### Shared ConversionPageLayout Structure
```
[Category badge] [H1 Title] [Description paragraph]
[Upload Card — white, rounded, shadow]
  Dashed dropzone
    Upload icon (red)
    Click to select file or filename
    Accepted formats label
  [Tool-specific options]
  [Action button — full width, red]
[Success State]
  Green check icon + filename
  [Download] [Process Another]
```

---

### Tool 1 — Compress Image
- Route: /compress-image
- Category: Optimize
- Accepted: JPG, PNG, SVG, GIF, WEBP
- Options: 3 quality level buttons — Strong (smallest file), Recommended (default), High Quality (larger file)
- After success: Shows original size → compressed size + percentage reduction
- Download: [filename]_compressed.[ext]

### Tool 2 — Resize Image
- Route: /resize-image
- Category: Edit
- Accepted: JPG, PNG, SVG, GIF, WEBP
- Options: Width input (px), Height input (px), Toggle between percentage and pixels, Checkbox to maintain aspect ratio (default on)
- Download: [filename]_resized.[ext]

### Tool 3 — Crop Image
- Route: /crop-image
- Category: Edit
- Accepted: JPG, PNG, GIF
- Options: Visual canvas crop editor with drag handles, X/Y/Width/Height pixel inputs, Aspect ratio presets (Free, 1:1, 4:3, 16:9, 3:2)
- Download: [filename]_cropped.[ext]

### Tool 4 — Rotate Image
- Route: /rotate-image
- Category: Edit
- Accepted: JPG, PNG, GIF
- Options: 90 degrees CW button, 90 degrees CCW button, 180 degrees button, Custom angle input (-360 to 360), Filter by landscape only or portrait only
- Multi-file: Yes — ZIP download for multiple files
- Download: [filename]_rotated.[ext]

### Tool 5 — Flip Image
- Route: /flip-image
- Category: Edit
- Accepted: JPG, PNG, GIF, WEBP
- Options: Flip Horizontal button, Flip Vertical button
- Download: [filename]_flipped.[ext]

### Tool 6 — Convert to JPG
- Route: /convert-to-jpg
- Category: Convert
- Accepted: PNG, GIF, TIF, SVG, WEBP, HEIC, BMP, ICO
- Options: JPEG quality slider (1 to 100, default 92)
- Multi-file: Yes — ZIP for multiple outputs
- Download: [filename].jpg

### Tool 7 — Convert from JPG
- Route: /jpg-to-image
- Category: Convert
- Accepted: JPG, JPEG
- Options: Output format selector — PNG, GIF, WEBP, or Animated GIF
- Multi-file: Yes — for animated GIF creation from multiple JPGs
- Download: Converted file or ZIP

### Tool 8 — Convert to PNG
- Route: /convert-to-png
- Category: Convert
- Accepted: JPG, WEBP, GIF, BMP, ICO, SVG
- Options: None (lossless conversion)
- Download: [filename].png

### Tool 9 — Image to PDF
- Route: /image-to-pdf
- Category: Convert
- Accepted: JPG, PNG, WEBP (multiple files allowed)
- Options: Page size (A4, Letter, Original), Orientation (Portrait, Landscape), Margin (None, Small, Medium, Large)
- Drag-to-reorder images before converting
- Download: Images_Converted_[timestamp].pdf

### Tool 10 — HTML to Image
- Route: /html-to-image
- Category: Convert
- Options: Tab switcher between Raw HTML Code textarea and Upload .html file. Output format selector (JPG or PNG)
- Download: HTML_Converted_[timestamp].[ext]

### Tool 11 — Photo Editor (Fullscreen)
- Route: /photo-editor
- Category: Create
- Layout: Fullscreen portal editor (same pattern as TeenyPDF Edit PDF)
- Toolbar tools: Select/Hand, Text, Pencil/Freehand, Highlighter, Shapes (rect/circle/triangle/line/arrow), Eraser, Image upload
- Color picker: 6 swatches + custom color input
- Font size control
- Layer management: move up, move down, delete
- Zoom in/out controls
- Undo/Redo
- Save and Export button
- Download: edited_image.[ext]

### Tool 12 — Meme Generator
- Route: /meme-generator
- Category: Create
- Accepted: JPG, PNG, GIF
- Options: Top text input, Bottom text input, Font size slider, Text color picker, Font style selector (Impact, Arial, Comic Sans)
- Live canvas preview updates as user types
- Download: meme_[timestamp].jpg

### Tool 13 — Upscale Image
- Route: /upscale-image
- Category: Optimize
- Accepted: JPG, PNG
- Options: Scale factor buttons — 2x (default) or 4x
- Uses Canvas API bicubic interpolation (AI upscaling is a future enhancement)
- Download: [filename]_upscaled.[ext]

### Tool 14 — Remove Background
- Route: /remove-background
- Category: Optimize
- Accepted: JPG, PNG, WEBP
- Options: None — fully automatic
- Uses @imgly/background-removal library (WASM, runs entirely in browser)
- Progress labels: Analyzing image → Removing background
- Download: [filename]_no_bg.png (always PNG to preserve transparency)

### Tool 15 — Watermark Image
- Route: /watermark-image
- Category: Security
- Accepted: JPG, PNG, WEBP
- Options: Watermark type (Text or Image), Text input field, Watermark image upload, Position (9-grid selector: TL/TC/TR/ML/MC/MR/BL/BC/BR), Opacity slider (0 to 100 percent), Font size (text only), Color picker (text only)
- Multi-file: Yes — apply same watermark to multiple images at once
- Download: [filename]_watermarked.[ext] or ZIP for multiple

### Tool 16 — Blur Face
- Route: /blur-face
- Category: Security
- Accepted: JPG, PNG, WEBP
- Options: Blur intensity (Low, Medium, High), Mode (Auto — detect faces, or Manual — draw blur region)
- Download: [filename]_blurred.[ext]

---

## 10. Blog Section

### /blog — Blog Listing Page
Grid of blog post cards. Each card shows: thumbnail image, category tag, post title, excerpt, publication date, estimated read time, and Read more link.

### /blog/[slug] — Individual Blog Post

Page structure:
```
Breadcrumb: Home > Blog > [Post Title]
[Date] · [Author]
[H1 Post Title]
[Top CTA button — links to relevant tool]
[Article body with H2 headings, paragraphs, inline red links to tools]
[Bottom CTA button]
Related image tools: [Tool 1] · [Tool 2] · [Tool 3] · [Tool 4]
```

Blog topics focus on:
- How-to guides for each image tool
- Image format comparisons (JPG vs PNG vs WEBP)
- Privacy and security explanations
- SEO-targeted tutorials

---

## 11. Component Architecture

```
RootLayout (layout.tsx)
└── AppProvider (context/AppContext.tsx)
    └── ThemeRegistry (lib/theme/ThemeRegistry.tsx)
        ├── Header
        │   ├── Logo
        │   └── Nav links from NAV_LINKS constant
        ├── main
        │   ├── HomePage (/)
        │   │   ├── HeroSection
        │   │   ├── RecentFilesSection
        │   │   ├── ToolsSection
        │   │   │   └── ToolCard (x16)
        │   │   ├── WorkYourWaySection
        │   │   └── FeatureTrustSection
        │   └── ToolPage (e.g. /compress-image)
        │       └── ConversionPageLayout
        │           └── Tool-specific UI
        └── Footer
```

### Reusable Components Reference

| Component | Location | Purpose |
|---|---|---|
| Button | components/ui/Button | Primary, secondary, outline variants |
| Card | components/ui/Card | Generic MUI Paper wrapper |
| Icon | components/ui/Icon | Lucide icon with consistent sizing |
| Logo | components/ui/Logo | TeenyImage brand logo with icon |
| FilterChip | components/ui/FilterChip | Category filter pill |
| ToolCard | components/ui/ToolCard | Tool listing card (icon, title, description) |
| Header | components/layout/Header | Global sticky header |
| Footer | components/layout/Footer | Global footer |
| Container | components/layout/Container | Max-width content wrapper |
| ConversionPageLayout | components/common | Standard tool page shell |
| ToolWorkspaceLayout | components/tools | Alternative tool page shell |
| HeroSection | components/common/HeroSection | Homepage hero |
| ToolsSection | components/common/ToolsSection | Homepage tool grid with filters |
| RecentFilesSection | components/common/RecentFilesSection | Recently processed files |
| WorkYourWaySection | components/common/WorkYourWaySection | 3 promo cards |
| FeatureTrustSection | components/common/FeatureTrustSection | Privacy promo and trust badges |

---

## 12. State Management

Global state is managed via AppContext using React Context and useState. No Redux, no Zustand, no external state library.

```tsx
interface AppContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recentFiles: ProcessedFileRecord[];
  addRecentFile: (file: ProcessedFileRecord) => void;
  clearRecentFiles: () => void;
}

interface ProcessedFileRecord {
  id: string;
  name: string;
  toolUsed: string;
  size: number;
  processedAt: string;
  downloadUrl?: string;
}
```

No localStorage. No server persistence. All state is session-only and cleared on page refresh. This is intentional for privacy.

---

## 13. Folder Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── compress-image/page.tsx
│   ├── resize-image/page.tsx
│   ├── crop-image/page.tsx
│   ├── rotate-image/page.tsx
│   ├── flip-image/page.tsx
│   ├── convert-to-jpg/page.tsx
│   ├── jpg-to-image/page.tsx
│   ├── convert-to-png/page.tsx
│   ├── image-to-pdf/page.tsx
│   ├── html-to-image/page.tsx
│   ├── photo-editor/page.tsx
│   ├── meme-generator/page.tsx
│   ├── upscale-image/page.tsx
│   ├── remove-background/page.tsx
│   ├── watermark-image/page.tsx
│   └── blur-face/page.tsx
├── components/
│   ├── index.ts
│   ├── ui/
│   ├── layout/
│   ├── common/
│   └── tools/
├── constants/
│   ├── index.ts
│   └── tools.ts
├── context/
│   └── AppContext.tsx
├── lib/
│   ├── image/
│   ├── theme/
│   └── utils/
└── types/
    └── index.ts
```

---

## 14. Privacy and Security Requirements

- Zero server uploads — all processing in browser via Canvas API, WASM, or JavaScript libraries
- No tracking of file content — files never sent to any external API
- No login required — no user accounts, no sessions stored server-side
- No cookies for tracking — only functional cookies if absolutely necessary
- Session-only memory — recent files exist only in React state and clear on refresh
- HTTPS required — production deployment must enforce HTTPS

Privacy label must appear on every upload dropzone:
```
100% Client-Side Processing — Your files never leave your device
```

---

## 15. Performance Requirements

| Metric | Target |
|---|---|
| Lighthouse Performance | 85 or higher |
| First Contentful Paint | 1.5 seconds or less |
| Time to Interactive | 3.0 seconds or less |
| Largest Contentful Paint | 2.5 seconds or less |
| Initial JS bundle | 300KB gzipped or less |

All heavy image processing libraries must be lazy loaded — only imported when a user navigates to that specific tool page.

---

## 16. Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome / Chromium | 90 or higher |
| Firefox | 88 or higher |
| Safari | 14 or higher |
| Edge | 90 or higher |
| Mobile Chrome (Android) | 90 or higher |
| Mobile Safari (iOS) | 14 or higher |

---

## 17. Accessibility Requirements

- All interactive elements must be keyboard navigable
- All images must have meaningful alt attributes
- Color contrast must meet WCAG AA standard (4.5:1 ratio for text)
- Form inputs must have associated labels
- Modal and portal components must trap focus and support Escape key to close
- aria-label required on all icon-only buttons
- Skip-to-content link should be present in header
