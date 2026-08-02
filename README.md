# TeenyPDF Web

A modular Next.js application for PDF tools, built with Material UI, Tailwind CSS, and Lucide icons.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Material UI v9**
- **Lucide React** (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & layouts
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, Icon)
│   └── layout/           # Layout components (Header, Footer, Container)
├── constants/            # App-wide constants
├── hooks/                # Custom React hooks
├── lib/
│   ├── theme/            # MUI theme & ThemeRegistry
│   └── utils/            # Utility functions (cn, etc.)
└── types/                # Shared TypeScript types
```

## Component Conventions

Each component lives in its own folder with a barrel export:

```
components/ui/Button/
├── Button.tsx
└── index.ts
```

Import via path aliases:

```tsx
import { Button, Card, Icon } from "@/components/ui";
import { Header, Container } from "@/components/layout";
```

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm run start` | Start production server |
| `npm run lint`  | Run ESLint             |
