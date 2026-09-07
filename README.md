# TeenyImage

> Free, browser-based image tools. Your files never leave your device.

[![Live](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/fluvosoft-researchanddevelopmnent/TeenyImage)
[![Organization](https://img.shields.io/badge/org-FluvoSoft-red)](https://github.com/fluvosoft-researchanddevelopmnent)

**TeenyImage** is the image-focused sibling of [TeenyPDF](https://www.teenypdf.com). Inspired by iLoveIMG, it offers 16 browser-based image tools with complete privacy — **no uploads, no tracking, no login**.

---

## 👥 Engineering Team

- **`@obsessus`** — Team Lead & Systems Architect (Core Foundation, Layout, SEO, Blog, Brand Assets, Performance, CI/CD)
- **`@ratulanik`** — Conversion & Optimization Engineer (8 Tools: Compress, Resize, Upscale, JPG/PNG Converters, Image to PDF, HTML to Image)
- **`@shafinSI`** — Creative, Security & Editing Engineer (8 Tools: Crop, Rotate, Flip, Photo Editor, Meme Generator, Background Remover, Watermark, Blur Face)

---

## 🤖 AI Coding Agents & Contributors

If you or your team use an AI coding assistant (Cursor, Claude Code, GitHub Copilot, Antigravity, Windsurf):
👉 **Read [AGENTS.md](./AGENTS.md) first** for full context, boundary rules, and self-assessment criteria.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Components | Material UI v9 |
| Icons | Lucide React |
| Font | Poppins |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build verification |
| `npm run lint` | Run ESLint check |

---

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages (20 routes)
│   ├── blog/      # Blog listing and dynamic article pages
│   ├── ...        # 16 individual tool route pages
├── components/    # Reusable UI, layout, and section components  
├── constants/     # Tool definitions, nav links, and filter configs
├── context/       # Global session state (AppContext)
├── lib/image/     # Core image processing logic (16 tools)
├── lib/theme/     # Material UI theme registry & configuration
└── types/         # Shared TypeScript interfaces and types
```

---

## 📖 Key Documentation

- [AI Agent Guide (`AGENTS.md`)](./AGENTS.md)
- [Product Requirements Document (`docs/PRD.md`)](./docs/PRD.md)
- [Work Division & Task Assignments (`docs/WORK_DIVISION.md`)](./docs/WORK_DIVISION.md)
- [Contributing & Git Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md)

---

## 🧰 Tools (16)

| Category | Tools | Route |
|---|---|---|
| **Optimize** | Compress Image, Upscale Image, Remove Background | `/compress-image`, `/upscale-image`, `/remove-background` |
| **Edit** | Resize Image, Crop Image, Rotate Image, Flip Image | `/resize-image`, `/crop-image`, `/rotate-image`, `/flip-image` |
| **Convert** | Convert to JPG, Convert from JPG, Convert to PNG, Image to PDF, HTML to Image | `/convert-to-jpg`, `/jpg-to-image`, `/convert-to-png`, `/image-to-pdf`, `/html-to-image` |
| **Create** | Photo Editor, Meme Generator | `/photo-editor`, `/meme-generator` |
| **Security** | Watermark Image, Blur Face | `/watermark-image`, `/blur-face` |

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for branch strategy, commit conventions, and pull request workflows.

---

## 📄 License

Proprietary — FluvoSoft Research & Development