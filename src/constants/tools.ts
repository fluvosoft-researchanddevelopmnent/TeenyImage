import type { LucideIcon } from "lucide-react";
import {
  FileCode,
  FileOutput,
  FileText,
  Globe,
  Hash,
  Image,
  ImagePlus,
  LayoutGrid,
  Minimize2,
  Pencil,
  Presentation,
  Sheet,
  Shield,
  Unlock,
  Wrench,
} from "lucide-react";

import type { ToolFilterCategory } from "@/types";

export type Tool = {
  title: string;
  description: string;
  href: string;
  categories: ToolFilterCategory[];
  icon: LucideIcon;
  iconClassName: string;
  isNew?: boolean;
};

export const PDF_TOOLS: Tool[] = [
  // ── Edit PDF ─────────────────────────────────────────────────────────────
  {
    title: "Edit PDF",
    description:
      "Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.",
    href: "/edit-pdf",
    categories: ["Edit PDF"],
    icon: Pencil,
    iconClassName: "bg-[#f3e8ff] text-[#7c3aed]",
    isNew: true,
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    href: "/compress-pdf",
    categories: ["Edit PDF"],
    icon: Minimize2,
    iconClassName: "bg-[#e8f7ef] text-[#16a34a]",
    isNew: true,
  },
  {
    title: "Unlock PDF",
    description:
      "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    href: "/unlock-pdf",
    categories: ["Edit PDF"],
    icon: Unlock,
    iconClassName: "bg-[#e8f0fe] text-[#2563eb]",
    isNew: true,
  },
  {
    title: "Protect PDF",
    description:
      "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    href: "/protect-pdf",
    categories: ["Edit PDF"],
    icon: Shield,
    iconClassName: "bg-[#e8f0fe] text-[#2563eb]",
    isNew: true,
  },
  {
    title: "Organize PDF",
    description:
      "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.",
    href: "/organize-pdf",
    categories: ["Edit PDF"],
    icon: LayoutGrid,
    iconClassName: "bg-[#fff0e6] text-[#ea580c]",
    isNew: true,
  },
  {
    title: "PDF to PDF/A",
    description:
      "Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.",
    href: "/pdf-to-pdfa",
    categories: ["Edit PDF"],
    icon: FileOutput,
    iconClassName: "bg-[#e8f0fe] text-[#2563eb]",
    isNew: true,
  },
  {
    title: "Repair PDF",
    description:
      "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.",
    href: "/repair-pdf",
    categories: ["Edit PDF"],
    icon: Wrench,
    iconClassName: "bg-[#e8f7ef] text-[#16a34a]",
    isNew: true,
  },
  {
    title: "Page numbers",
    description:
      "Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.",
    href: "/page-numbers",
    categories: ["Edit PDF"],
    icon: Hash,
    iconClassName: "bg-[#f3e8ff] text-[#7c3aed]",
    isNew: true,
  },

  // ── PDF → Other ──────────────────────────────────────────────────────────
  {
    title: "PDF to Word",
    description:
      "Easily convert your PDF files into easy-to-edit DOC and DOCX documents. The converted Word document is almost 100% accurate.",
    href: "/pdf-to-word",
    categories: ["PDF to Other"],
    icon: FileText,
    iconClassName: "bg-[#e8f0fe] text-[#2b579a]",
  },
  {
    title: "PDF to PowerPoint",
    description: "Turn your PDF files into easy-to-edit PPT and PPTX slideshows.",
    href: "/pdf-to-powerpoint",
    categories: ["PDF to Other"],
    icon: Presentation,
    iconClassName: "bg-[#fff0e6] text-[#d24726]",
  },
  {
    title: "PDF to JPG",
    description: "Convert each PDF page into a high-resolution JPG image or extract all images.",
    href: "/pdf-to-jpg",
    categories: ["PDF to Other"],
    icon: Image,
    iconClassName: "bg-[#fff8e6] text-[#f39c12]",
  },
  {
    title: "PDF to Markdown",
    description:
      "Easily turn PDFs into Markdown files. Perfect for notes, docs, and LLMs. Headings, tables, lists, and links preserved automatically.",
    href: "/pdf-to-markdown",
    categories: ["PDF to Other"],
    icon: FileCode,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
    isNew: true,
  },

  // ── Other → PDF ──────────────────────────────────────────────────────────
  {
    title: "Word to PDF",
    description: "Make DOC and DOCX files easy to read by converting them to PDF.",
    href: "/word-to-pdf",
    categories: ["Other to PDF"],
    icon: FileText,
    iconClassName: "bg-[#e8f0fe] text-[#2b579a]",
  },
  {
    title: "Excel to PDF",
    description: "Make Excel spreadsheets easy to read by converting them to PDF.",
    href: "/excel-to-pdf",
    categories: ["Other to PDF"],
    icon: Sheet,
    iconClassName: "bg-[#e8f7ef] text-[#217346]",
  },
  {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    href: "/jpg-to-pdf",
    categories: ["Other to PDF"],
    icon: ImagePlus,
    iconClassName: "bg-[#fff8e6] text-[#f39c12]",
  },
  {
    title: "HTML to PDF",
    description:
      "Convert webpages in HTML to PDF. Paste HTML or upload an .html file and convert to PDF with a click.",
    href: "/html-to-pdf",
    categories: ["Other to PDF"],
    icon: Globe,
    iconClassName: "bg-[#e8f0fe] text-[#3498db]",
  },
];

export function getToolsByFilter(filter: string): Tool[] {
  if (filter === "All") {
    return PDF_TOOLS;
  }

  return PDF_TOOLS.filter((tool) => tool.categories.includes(filter as ToolFilterCategory));
}
