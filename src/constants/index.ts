export const APP_NAME = "TeenyPDF";
export const APP_DESCRIPTION = "Fast, free PDF conversion tools for the web";

export const NAV_LINKS = [
  { label: "PDF to Word", href: "/pdf-to-word" },
  { label: "PDF to JPG", href: "/pdf-to-jpg" },
  { label: "JPG to PDF", href: "/jpg-to-pdf" },
  { label: "Word to PDF", href: "/word-to-pdf" },
  { label: "All Converters", href: "/", hasDropdown: true },
] as const;

export const HERO_FILTERS = [
  "All",
  "PDF to Other",
  "Other to PDF",
] as const;

export const HERO_CONTENT = {
  title: "Free PDF Converter — Convert PDFs to & from any format",
  descriptionLine1:
    "All the conversion tools you need — 100% free, browser-based, and private.",
  descriptionLine2:
    "Convert PDF to Word, Excel, PowerPoint, JPG, Markdown and more. Or turn Word, Excel, images into PDF.",
} as const;

export * from "./tools";
