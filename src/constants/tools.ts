import type { LucideIcon } from "lucide-react";
import {
  FileCode,
  FileText,
  Globe,
  Image,
  ImagePlus,
  Presentation,
  Sheet,
  Archive,
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
  {
    title: "PDF to PDF/A",
    description:
      "Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.",
    href: "/pdf-to-pdfa",
    categories: ["PDF to Other"],
    icon: Archive,
    iconClassName: "bg-[#e8f7ef] text-[#2ecc71]",
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
    title: "PowerPoint to PDF",
    description: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    href: "/powerpoint-to-pdf",
    categories: ["Other to PDF"],
    icon: Presentation,
    iconClassName: "bg-[#fff0e6] text-[#d24726]",
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
      "Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.",
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
