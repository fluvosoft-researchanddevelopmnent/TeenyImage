# 🤖 AGENTS.md — AI Coding Agent Guide for TeenyImage

> **Welcome, AI Coding Agent!**  
> This file is your operational instruction manual. Whether you are running inside Cursor, Claude Code, GitHub Copilot, Antigravity, Windsurf, or any terminal agent, **read this file first** to understand the architecture, boundaries, rules, and success criteria.

---

## 1. Project Mission & Non-Negotiable Constraint

**TeenyImage** is an open, private, browser-based image toolkit built by FluvoSoft, inspired by iLoveIMG and directly siblinged with [TeenyPDF](https://www.teenypdf.com).

### 🚨 THE GOLDEN RULE: 100% CLIENT-SIDE PROCESSING
- **ALL image processing must execute strictly in the user''s browser** (HTML5 Canvas API, WebAssembly, browser libraries).
- **NO image data or files may ever be sent to any remote server, backend, or cloud service.**
- **NO user login, NO tracking, NO analytics on user file contents.**
- All state is session-only in React state (`AppContext`).

---

## 2. Team Members & Work Assignment

Work is distributed strictly among three developers by GitHub handle:

| Developer | Role | Branch | Assigned Scope |
|---|---|---|---|
| **`@obsessus`** | Team Lead & Systems Architect | `feature/foundation-and-core` / `development` | Core foundation, layout, theme, SEO, visual assets, blog, sitemap/robots, 404, bundle optimization, CI/CD, PR reviews |
| **`@ratulanik`** | Conversion & Optimization Engineer | `feature/optimize-and-convert-tools` | 8 Tools: Compress, Resize, Upscale, Convert to JPG, Convert from JPG, Convert to PNG, Image to PDF, HTML to Image |
| **`@shafinSI`** | Creative, Security & Editing Engineer | `feature/edit-security-create-tools` | 8 Tools: Crop, Rotate, Flip, Photo Editor, Meme Generator, Remove Background, Watermark, Blur Face |

---

## 3. How You (the Agent) Must Start

When an AI agent is prompted in this repository, perform this initial sequence:

1. **Detect which branch you are on:**
   ```bash
   git branch --show-current
   ```
2. **Identify the developer and scope:**
   - If on `feature/optimize-and-convert-tools` ➔ You are assisting **`@ratulanik`**. Focus **only** on `@ratulanik`''s 8 tools.
   - If on `feature/edit-security-create-tools` ➔ You are assisting **`@shafinSI`**. Focus **only** on `@shafinSI`''s 8 tools.
   - If on `feature/foundation-and-core` or `development` ➔ You are assisting **`@obsessus`**.
3. **Read the corresponding checklist in `docs/WORK_DIVISION.md`:**
   - Review the detailed specifications in `docs/PRD.md`.
   - Never deviate from the pre-established file paths and naming conventions.

---

## 4. Architectural Boundaries (Zero Merge Conflicts)

To guarantee that multiple developers and agents can work simultaneously without breaking the build or creating merge conflicts:

### ⛔ RULES OF ISOLATION
1. **NEVER touch files assigned to another developer.**
   - `@ratulanik`''s agent touches only: `src/lib/image/{compressImage,resizeImage,upscaleImage,convertToJpg,convertFromJpg,convertToPng,imageToPdf,htmlToImage}.ts` and `src/app/{compress-image,resize-image,upscale-image,convert-to-jpg,jpg-to-image,convert-to-png,image-to-pdf,html-to-image}/page.tsx`.
   - `@shafinSI`''s agent touches only: `src/lib/image/{cropImage,rotateImage,flipImage,photoEditor/*,removeBackground,watermarkImage,blurFace}.ts` and `src/app/{crop-image,rotate-image,flip-image,photo-editor,meme-generator,remove-background,watermark-image,blur-face}/page.tsx`.
   - Only `@obsessus` modifies shared infrastructure files (`constants/`, `components/layout/`, `components/ui/`, `context/`, `lib/theme/`).
2. **ALWAYS reuse shared UI components:**
   - Standard tool pages MUST use `ConversionPageLayout` from `@/components/common`.
   - Do NOT build custom dropzones or upload boxes from scratch unless building a fullscreen portal (like Photo Editor).
3. **ALWAYS use TypeScript path alias `@/`:**
   - Good: `import { Button } from "@/components/ui";`
   - Bad: `import { Button } from "../../components/ui";`

---

## 5. Tool Implementation Standard

Every tool implementation consists of **two parts**:

### Part A: Pure Logic Function (`src/lib/image/[toolName].ts`)
- Pure, reusable TypeScript function.
- Takes `File` / `File[]` / `ImageData` and options.
- Returns `Promise<Blob | Blob[] | File | File[]>`.
- Uses Canvas 2D context or lightweight client-side libraries (`browser-image-compression`, `jsPDF`, `jszip`, `@imgly/background-removal`).
- Handles memory cleanup (`canvas.width = 0; canvas.height = 0;` and revoking object URLs).

### Part B: Tool Page Component (`src/app/[tool-route]/page.tsx`)
- Wrapped in `ConversionPageLayout`.
- Provides tool options UI (sliders, toggles, position grids, dropdowns) into the `children` slot of `ConversionPageLayout`.
- Connects the processing function to `onProcess`.
- Handles edge cases:
  - Empty files or unsupported file formats (show user-friendly error).
  - Corrupt images (show error toast/alert).
  - Multi-file operations (trigger ZIP download when multiple files are processed).

---

## 6. Definition of Done (Self-Assessment Checklist)

Before an agent declares a task complete or prompts the developer to commit/push, you MUST self-assess against this checklist:

- [ ] **1. Compilation Check:**
  ```bash
  npm run build
  ```
  `next build` must complete with **0 errors** and **0 TypeScript failures**.
- [ ] **2. Client-Side Guarantee:**
  Verify no API routes (`/api/*`) were created for image processing and no network fetch requests upload image data to external servers.
- [ ] **3. Error Handling:**
  If an invalid or corrupted file is selected, does the UI handle it gracefully without crashing React?
- [ ] **4. Memory Safety:**
  Are object URLs properly cleaned up with `URL.revokeObjectURL(url)`?
- [ ] **5. Clean Code:**
  No leftover `console.log`, no unused imports, no `any` types.
- [ ] **6. Git Commit Standard:**
  Commit messages must strictly adhere to Conventional Commits:
  `feat([tool-name]): implement [specific capability]`

---

## 7. Useful Reference Paths

- **Product Specifications:** `docs/PRD.md`
- **Developer Checklists:** `docs/WORK_DIVISION.md`
- **Coding & Git Standards:** `CONTRIBUTING.md`
- **Shared Tool Page Layout:** `src/components/common/ConversionPageLayout.tsx`
- **Tool Registry:** `src/constants/tools.ts`
- **App Context:** `src/context/AppContext.tsx`