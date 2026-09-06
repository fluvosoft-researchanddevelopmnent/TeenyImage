# TeenyImage

> Free, browser-based image tools. Your files never leave your device.

[![Live](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/fluvosoft-researchanddevelopmnent/TeenyImage)
[![Organization](https://img.shields.io/badge/org-FluvoSoft-red)](https://github.com/fluvosoft-researchanddevelopmnent)

**TeenyImage** is the image-focused sibling of [TeenyPDF](https://www.teenypdf.com). Inspired by iLoveIMG, it offers 16 browser-based image tools with complete privacy — no uploads, no tracking, no login.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Components | Material UI v9 |
| Icons | Lucide React |
| Font | Poppins |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/           # Next.js App Router pages (19 pages)
├── components/    # Shared UI, layout, and section components  
├── constants/     # Tool definitions and nav config
├── context/       # Global app state (AppContext)
├── lib/image/     # Image processing logic (16 tools)
├── lib/theme/     # MUI theme configuration
└── types/         # Shared TypeScript types
```

## Documentation

- [Product Requirements Document](./docs/PRD.md)
- [Work Division & Task Assignments](./docs/WORK_DIVISION.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Tools (16)

| Category | Tools |
|---|---|
| Optimize | Compress Image, Upscale Image, Remove Background |
| Edit | Resize Image, Crop Image, Rotate Image, Flip Image |
| Convert | Convert to JPG, Convert from JPG, Convert to PNG, Image to PDF, HTML to Image |
| Create | Photo Editor, Meme Generator |
| Security | Watermark Image, Blur Face |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch strategy, commit conventions, and PR guidelines.

## License

Proprietary — FluvoSoft Research & Development
