# 🤝 Contributing to TeenyImage

> This document defines the GitHub workflow, coding standards, and contribution guidelines for all developers on the TeenyImage project.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Branch Strategy](#2-branch-strategy)
3. [Commit Message Convention](#3-commit-message-convention)
4. [Pull Request Process](#4-pull-request-process)
5. [Code Style & Standards](#5-code-style--standards)
6. [Component Conventions](#6-component-conventions)
7. [File Naming Conventions](#7-file-naming-conventions)
8. [Review Guidelines](#8-review-guidelines)

---

## 1. Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher
- Git

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/fluvosoft-researchanddevelopmnent/TeenyImage.git

# 2. Navigate to the project directory
cd TeenyImage

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 2. Branch Strategy

We use a simplified Git Flow with three tiers:

```
main
  └── development
        ├── feature/[feature-name]
        ├── fix/[bug-description]
        └── docs/[doc-name]
```

### Branch Rules

| Branch | Purpose | Direct commits allowed? |
|---|---|---|
| `main` | Production-ready code only | NO — PR from development only |
| `development` | Integration branch for completed features | NO — PR from feature branches only |
| `feature/*` | Individual feature work | YES |
| `fix/*` | Bug fixes | YES |
| `docs/*` | Documentation updates | YES |

### Branch Naming Convention

```bash
# Feature branches
feature/compress-image
feature/photo-editor
feature/blog-section

# Bug fix branches
fix/header-mobile-menu
fix/compress-quality-slider

# Documentation branches
docs/update-readme
docs/add-prd
```

### Daily Workflow

```bash
# 1. Start of every work session — sync with development
git checkout development
git pull origin development

# 2. Sync your feature branch
git checkout feature/your-branch
git merge development

# 3. Do your work and commit regularly
git add .
git commit -m "feat(compress-image): add quality level selector"

# 4. Push your branch
git push origin feature/your-branch

# 5. When feature is complete — open a Pull Request to development
# NEVER open a PR directly to main
```

---

## 3. Commit Message Convention

We follow the **Conventional Commits** specification.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature or tool |
| `fix` | A bug fix |
| `style` | CSS/styling changes only |
| `refactor` | Code restructure without behavior change |
| `docs` | Documentation changes only |
| `chore` | Build system, dependencies, config changes |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

### Scope Examples

Use the tool route name or component name as scope:

```bash
feat(compress-image): add three quality level buttons
feat(watermark-image): implement 9-grid position selector
fix(header): fix mobile menu scroll lock on iOS
style(tool-card): adjust hover shadow color
docs(prd): update tool 14 remove background section
chore(deps): add browser-image-compression package
```

### Rules

- Use lowercase for type and scope
- Keep the description under 72 characters
- Use imperative mood: "add" not "added", "fix" not "fixed"
- Reference issues if relevant: `fix(crop): fix aspect ratio bug (closes #12)`

---

## 4. Pull Request Process

### Before Opening a PR

- [ ] Your feature branch is up to date with `development` (run `git merge development`)
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] Your code follows the conventions in this document
- [ ] All tool pages use the shared `ConversionPageLayout` or `ToolWorkspaceLayout`

### PR Title Format

Use the same format as commit messages:
```
feat(compress-image): complete compress image tool page and logic
```

### PR Description Template

```markdown
## What does this PR do?
[Brief description of the changes]

## Checklist
- [ ] Follows component conventions (folder + barrel export)
- [ ] Uses ConversionPageLayout or ToolWorkspaceLayout
- [ ] All images have alt text
- [ ] No console.log statements left in code
- [ ] lint passes
- [ ] build passes

## Screenshots (if UI changes)
[Add screenshots here]
```

### PR Rules

- All PRs must target `development` — NEVER `main`
- At least 1 review approval required before merging
- No force pushes to `development` or `main`
- Delete your feature branch after it is merged

---

## 5. Code Style & Standards

### TypeScript

- Always use explicit TypeScript types — avoid `any`
- Use `interface` for object shapes, `type` for unions and aliases
- Export types from `src/types/index.ts` when shared across files
- All component props must be typed

```tsx
// Good
interface CompressOptionsProps {
  quality: 'strong' | 'recommended' | 'high';
  onChange: (quality: string) => void;
}

// Bad
const CompressOptions = ({ quality, onChange }: any) => { ... }
```

### React / Next.js

- Use functional components only — no class components
- Use `"use client"` directive only when necessary (hooks, event handlers, browser APIs)
- Server components are default — keep them server-side when possible
- All image elements must use Next.js `<Image>` component (not `<img>`)
- All internal links must use Next.js `<Link>` component (not `<a>`)

### Tailwind CSS

- Use Tailwind utility classes for all styling
- Use `cn()` utility from `@/lib/utils/cn` for conditional class merging
- Do not write custom CSS unless absolutely necessary
- Follow mobile-first responsive design: `base → sm: → md: → lg: → xl:`

```tsx
// Good
import { cn } from "@/lib/utils/cn";

<div className={cn(
  "rounded-xl border border-border p-4",
  isActive && "border-brand bg-red-50"
)} />
```

### Imports Order

```tsx
// 1. React and Next.js
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. External libraries
import { Shield } from "lucide-react";
import Typography from "@mui/material/Typography";

// 3. Internal — components
import { Container } from "@/components/layout";
import { ToolCard } from "@/components/ui";

// 4. Internal — constants, context, lib, types
import { IMAGE_TOOLS } from "@/constants";
import { useApp } from "@/context/AppContext";
import type { Tool } from "@/types";
```

---

## 6. Component Conventions

### Folder Structure

Every component lives in its own folder:

```
components/ui/MyComponent/
├── MyComponent.tsx    # Component implementation
└── index.ts          # Barrel export
```

### Barrel Export Pattern

```ts
// index.ts
export { MyComponent } from "./MyComponent";
```

### Component Template

```tsx
// components/ui/MyComponent/MyComponent.tsx
"use client"; // only if needed

import type { BaseComponentProps } from "@/types";

interface MyComponentProps extends BaseComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick, className }: MyComponentProps) {
  return (
    <div className={cn("...", className)}>
      {title}
    </div>
  );
}
```

### Do NOT do this

```tsx
// Bad — default export
export default function MyComponent() { ... }

// Bad — inline styles
<div style={{ color: 'red' }}>

// Bad — missing types
function MyComponent({ title }) { ... }
```

---

## 7. File Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `ToolCard.tsx`, `HeroSection.tsx` |
| Pages (Next.js) | lowercase kebab via folder | `app/compress-image/page.tsx` |
| Utility functions | camelCase | `cn.ts`, `compressImage.ts` |
| Type definition files | camelCase | `index.ts` |
| Constants | camelCase | `tools.ts` |
| Barrel exports | lowercase | `index.ts` |

---

## 8. Review Guidelines

### As a Reviewer

- Review within 24 hours of PR being opened
- Be constructive — explain WHY a change is needed, not just what to change
- Approve if the code works and follows conventions, even if you would have done it differently
- Block only for: bugs, security issues, broken builds, missing types, or violations of conventions

### As an Author

- Keep PRs small — one feature or fix per PR
- Respond to review comments within 24 hours
- Do not merge your own PR without at least 1 approval
- Resolve all conversations before merging
