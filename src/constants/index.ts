export const APP_NAME = "TeenyPDF";
export const APP_DESCRIPTION = "Lightweight PDF tools for the web";

export const NAV_LINKS = [
  { label: "Merge PDF", href: "/merge-pdf" },
  { label: "Split PDF", href: "/split-pdf" },
  { label: "Compress PDF", href: "/compress-pdf" },
  { label: "Convert PDF", href: "/convert-pdf", hasDropdown: true },
  { label: "All PDF tools", href: "/tools", hasDropdown: true },
] as const;

export const HERO_FILTERS = [
  "All",
  "Workflows",
  "Organize PDF",
  "Optimize PDF",
  "Convert PDF",
  "Edit PDF",
  "PDF Security",
  "PDF Intelligence",
] as const;

export const HERO_CONTENT = {
  title: "Every tool you need to work with PDFs in one place",
  descriptionLine1:
    "Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge,",
  descriptionLine2:
    "split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.",
} as const;

export * from "./tools";
