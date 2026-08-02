import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Crop,
  EyeOff,
  FileCode,
  FileInput,
  FileText,
  GitCompare,
  Globe,
  Hash,
  Image,
  ImagePlus,
  Languages,
  LayoutGrid,
  Lock,
  Merge,
  Minimize2,
  PenLine,
  Pencil,
  Presentation,
  RotateCw,
  ScanLine,
  ScanSearch,
  Scissors,
  Sheet,
  Sparkles,
  Stamp,
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
  {
    title: "Merge PDF",
    description: "Combine PDFs in the order you want with the easiest PDF merger available.",
    href: "/merge-pdf",
    categories: ["Organize PDF"],
    icon: Merge,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Split PDF",
    description: "Separate one page or a whole set for easy conversion into independent PDF files.",
    href: "/split-pdf",
    categories: ["Organize PDF"],
    icon: Scissors,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Compress PDF",
    description: "Reduce file size while optimizing for maximal PDF quality.",
    href: "/compress-pdf",
    categories: ["Optimize PDF"],
    icon: Minimize2,
    iconClassName: "bg-[#e8f7ef] text-[#2ecc71]",
  },
  {
    title: "PDF to Word",
    description:
      "Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.",
    href: "/pdf-to-word",
    categories: ["Convert PDF"],
    icon: FileText,
    iconClassName: "bg-[#e8f0fe] text-[#2b579a]",
  },
  {
    title: "PDF to PowerPoint",
    description: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    href: "/pdf-to-powerpoint",
    categories: ["Convert PDF"],
    icon: Presentation,
    iconClassName: "bg-[#fff0e6] text-[#d24726]",
  },
  {
    title: "PDF to Excel",
    description: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    href: "/pdf-to-excel",
    categories: ["Convert PDF"],
    icon: Sheet,
    iconClassName: "bg-[#e8f7ef] text-[#217346]",
  },
  {
    title: "Word to PDF",
    description: "Make DOC and DOCX files easy to read by converting them to PDF.",
    href: "/word-to-pdf",
    categories: ["Convert PDF"],
    icon: FileText,
    iconClassName: "bg-[#e8f0fe] text-[#2b579a]",
  },
  {
    title: "PowerPoint to PDF",
    description: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    href: "/powerpoint-to-pdf",
    categories: ["Convert PDF"],
    icon: Presentation,
    iconClassName: "bg-[#fff0e6] text-[#d24726]",
  },
  {
    title: "Excel to PDF",
    description: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    href: "/excel-to-pdf",
    categories: ["Convert PDF"],
    icon: Sheet,
    iconClassName: "bg-[#e8f7ef] text-[#217346]",
  },
  {
    title: "Edit PDF",
    description:
      "Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.",
    href: "/edit-pdf",
    categories: ["Edit PDF"],
    icon: Pencil,
    iconClassName: "bg-[#f3e8ff] text-[#9b59b6]",
  },
  {
    title: "PDF to JPG",
    description: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    href: "/pdf-to-jpg",
    categories: ["Convert PDF"],
    icon: Image,
    iconClassName: "bg-[#fff8e6] text-[#f39c12]",
  },
  {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    href: "/jpg-to-pdf",
    categories: ["Convert PDF"],
    icon: ImagePlus,
    iconClassName: "bg-[#fff8e6] text-[#f39c12]",
  },
  {
    title: "Sign PDF",
    description: "Sign yourself or request electronic signatures from others.",
    href: "/sign-pdf",
    categories: ["PDF Security"],
    icon: PenLine,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Watermark",
    description:
      "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    href: "/watermark",
    categories: ["Edit PDF"],
    icon: Stamp,
    iconClassName: "bg-[#f3e8ff] text-[#9b59b6]",
  },
  {
    title: "Rotate PDF",
    description: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    href: "/rotate-pdf",
    categories: ["Organize PDF"],
    icon: RotateCw,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "HTML to PDF",
    description:
      "Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.",
    href: "/html-to-pdf",
    categories: ["Convert PDF"],
    icon: Globe,
    iconClassName: "bg-[#e8f0fe] text-[#3498db]",
  },
  {
    title: "Unlock PDF",
    description: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    href: "/unlock-pdf",
    categories: ["PDF Security"],
    icon: Unlock,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Protect PDF",
    description: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    href: "/protect-pdf",
    categories: ["PDF Security"],
    icon: Lock,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Organize PDF",
    description:
      "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.",
    href: "/organize-pdf",
    categories: ["Organize PDF"],
    icon: LayoutGrid,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "PDF to PDF/A",
    description:
      "Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.",
    href: "/pdf-to-pdfa",
    categories: ["Optimize PDF"],
    icon: Archive,
    iconClassName: "bg-[#e8f7ef] text-[#2ecc71]",
  },
  {
    title: "Repair PDF",
    description: "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.",
    href: "/repair-pdf",
    categories: ["Optimize PDF"],
    icon: Wrench,
    iconClassName: "bg-[#e8f7ef] text-[#2ecc71]",
  },
  {
    title: "Page numbers",
    description: "Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.",
    href: "/page-numbers",
    categories: ["Edit PDF"],
    icon: Hash,
    iconClassName: "bg-[#f3e8ff] text-[#9b59b6]",
  },
  {
    title: "Scan to PDF",
    description: "Capture document scans from your mobile device and send them instantly to your browser.",
    href: "/scan-to-pdf",
    categories: ["Convert PDF"],
    icon: ScanLine,
    iconClassName: "bg-[#e8f0fe] text-[#3498db]",
  },
  {
    title: "OCR PDF",
    description: "Easily convert scanned PDF into searchable and selectable documents.",
    href: "/ocr-pdf",
    categories: ["PDF Intelligence"],
    icon: ScanSearch,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
  },
  {
    title: "Compare PDF",
    description: "Show a side-by-side document comparison and easily spot changes between different file versions.",
    href: "/compare-pdf",
    categories: ["PDF Intelligence"],
    icon: GitCompare,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
  },
  {
    title: "Redact PDF",
    description: "Redact text and graphics to permanently remove sensitive information from a PDF.",
    href: "/redact-pdf",
    categories: ["PDF Security"],
    icon: EyeOff,
    iconClassName: "bg-[#fde8ea] text-[#e5322d]",
  },
  {
    title: "Crop PDF",
    description:
      "Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.",
    href: "/crop-pdf",
    categories: ["Edit PDF"],
    icon: Crop,
    iconClassName: "bg-[#f3e8ff] text-[#9b59b6]",
  },
  {
    title: "PDF Forms",
    description:
      "Detect form fields automatically, create interactive fillable PDFs, or fill PDF forms yourself. Add text fields, checkboxes, multiple choice fields, and lists.",
    href: "/pdf-forms",
    categories: ["Edit PDF"],
    icon: FileInput,
    iconClassName: "bg-[#f3e8ff] text-[#9b59b6]",
    isNew: true,
  },
  {
    title: "AI Summarizer",
    description:
      "Quickly generate concise summaries from articles, paragraphs, and essays, providing clear and precise key points in seconds.",
    href: "/ai-summarizer",
    categories: ["PDF Intelligence"],
    icon: Sparkles,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
    isNew: true,
  },
  {
    title: "Translate PDF",
    description: "Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.",
    href: "/translate-pdf",
    categories: ["PDF Intelligence"],
    icon: Languages,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
    isNew: true,
  },
  {
    title: "PDF to Markdown",
    description:
      "Easily turn PDFs into Markdown files. Perfect for notes, docs, and LLMs. Headings, tables, lists, and links preserved automatically.",
    href: "/pdf-to-markdown",
    categories: ["PDF Intelligence"],
    icon: FileCode,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
    isNew: true,
  },
];

export function getToolsByFilter(filter: string): Tool[] {
  if (filter === "All") {
    return PDF_TOOLS;
  }

  return PDF_TOOLS.filter((tool) => tool.categories.includes(filter as ToolFilterCategory));
}
