# TeenyImage

> Free, 100% client-side browser image toolkit. Your files never leave your device.

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/fluvosoft-researchanddevelopmnent/TeenyImage)
[![Organization](https://img.shields.io/badge/org-FluvoSoft-red)](https://github.com/fluvosoft-researchanddevelopmnent)

**TeenyImage** is a privacy-first web image suite inspired by iLoveIMG and directly siblinged with [TeenyPDF](https://www.teenypdf.com). All processing executes strictly inside the user''s browser using the HTML5 Canvas API, WebAssembly, and client-side libraries. No file uploads to servers, no content tracking, and no login required.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Material UI (MUI v9)
- **Icons & Typography:** Lucide React + Poppins (Google Fonts)
- **Client Processing:** HTML5 Canvas, `browser-image-compression`, `jsPDF`, `jszip`, `@imgly/background-removal`

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build check
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
src/
├── app/           # App Router pages (Home + 16 Tools + Blog + 404)
├── components/    # Reusable UI primitives, layouts, and page sections
├── constants/     # Centralized tool registry (IMAGE_TOOLS) & navigation
├── context/       # Session-only global state (AppContext)
├── lib/image/     # 16 client-side image processing modules
├── lib/theme/     # Material UI theme registry & styling tokens
└── types/         # Shared TypeScript interfaces & types
```

---

## 🧰 Supported Tools (16)

| Category | Available Tools |
|---|---|
| **Optimize** | Compress Image, Upscale Image, Remove Background |
| **Edit** | Resize Image, Crop Image, Rotate Image, Flip Image |
| **Convert** | Convert to JPG, Convert from JPG, Convert to PNG, Image to PDF, HTML to Image |
| **Create** | Photo Editor, Meme Generator |
| **Security** | Watermark Image, Blur Face |

---

## 📖 Key Documentation

- [AI Agent Guide (`AGENTS.md`)](./AGENTS.md) — Operational instructions, scope boundaries, and self-assessment checks for AI coding agents
- [Product Requirements (`docs/PRD.md`)](./docs/PRD.md) — Detailed feature specs, UI requirements, and UX expectations
- [Work Division (`docs/WORK_DIVISION.md`)](./docs/WORK_DIVISION.md) — Architecture pillars and modular task checklists
- [Contributing Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md) — Git branching model, Conventional Commits, and code standards

---

## 📄 License

Proprietary — FluvoSoft Research & Development