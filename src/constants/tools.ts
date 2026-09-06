import type { LucideIcon } from "lucide-react";
import {
  Minimize2,
  Maximize2,
  Crop,
  RotateCw,
  FlipHorizontal2,
  FileImage,
  FileOutput,
  Image,
  ImagePlus,
  Globe,
  Pencil,
  Laugh,
  Sparkles,
  Eraser,
  Stamp,
  ScanFace,
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

export const IMAGE_TOOLS: Tool[] = [
  // ── Optimize ─────────────────────────────────────────────────────────────
  {
    title: "Compress Image",
    description: "Compress JPG, PNG, SVG, GIF and WEBP files while saving space and maintaining quality.",
    href: "/compress-image",
    categories: ["Optimize"],
    icon: Minimize2,
    iconClassName: "bg-[#e8f7ef] text-[#16a34a]",
    isNew: true,
  },
  {
    title: "Upscale Image",
    description: "Enlarge your image to a higher resolution without losing quality.",
    href: "/upscale-image",
    categories: ["Optimize"],
    icon: Maximize2,
    iconClassName: "bg-[#e8f7ef] text-[#16a34a]",
    isNew: true,
  },
  {
    title: "Remove Background",
    description: "Remove the background from your image automatically. 100% in your browser.",
    href: "/remove-background",
    categories: ["Optimize"],
    icon: Eraser,
    iconClassName: "bg-[#e5f5d2] text-[#5f8c30]",
    isNew: true,
  },
  // ── Edit ─────────────────────────────────────────────────────────────────
  {
    title: "Resize Image",
    description: "Resize JPG, PNG, SVG or GIF by defining new width and height pixels.",
    href: "/resize-image",
    categories: ["Edit"],
    icon: Image,
    iconClassName: "bg-[#e8f0fe] text-[#2563eb]",
    isNew: true,
  },
  {
    title: "Crop Image",
    description: "Crop JPG, PNG or GIF by defining a rectangle in pixels. Cut your image online.",
    href: "/crop-image",
    categories: ["Edit"],
    icon: Crop,
    iconClassName: "bg-[#e0f7fa] text-[#0891b2]",
    isNew: true,
  },
  {
    title: "Rotate Image",
    description: "Rotate JPG, PNG or GIF online. Rotate image left 90°, 180°, 270° or any angle.",
    href: "/rotate-image",
    categories: ["Edit"],
    icon: RotateCw,
    iconClassName: "bg-[#fff0e6] text-[#ea580c]",
    isNew: true,
  },
  {
    title: "Flip Image",
    description: "Flip JPG, PNG or GIF images horizontally or vertically in your browser.",
    href: "/flip-image",
    categories: ["Edit"],
    icon: FlipHorizontal2,
    iconClassName: "bg-[#f3e8ff] text-[#7c3aed]",
    isNew: true,
  },
  // ── Convert ───────────────────────────────────────────────────────────────
  {
    title: "Convert to JPG",
    description: "Convert PNG, GIF, TIF, PSD, SVG, WEBP or RAW format images to JPG.",
    href: "/convert-to-jpg",
    categories: ["Convert"],
    icon: FileOutput,
    iconClassName: "bg-[#fef9c3] text-[#ca8a04]",
  },
  {
    title: "Convert from JPG",
    description: "Convert JPG images to PNG, GIF, WEBP, or animated GIF format.",
    href: "/jpg-to-image",
    categories: ["Convert"],
    icon: FileImage,
    iconClassName: "bg-[#fef9c3] text-[#ca8a04]",
  },
  {
    title: "Convert to PNG",
    description: "Convert JPG, WEBP, GIF, BMP, or SVG images to high-quality PNG format.",
    href: "/convert-to-png",
    categories: ["Convert"],
    icon: FileImage,
    iconClassName: "bg-[#eef2ff] text-[#6366f1]",
    isNew: true,
  },
  {
    title: "Image to PDF",
    description: "Combine one or more images into a single PDF document. Drag to reorder pages.",
    href: "/image-to-pdf",
    categories: ["Convert"],
    icon: ImagePlus,
    iconClassName: "bg-[#fef2f2] text-[#dc2626]",
  },
  {
    title: "HTML to Image",
    description: "Convert HTML code or a webpage URL into a JPG or PNG image.",
    href: "/html-to-image",
    categories: ["Convert"],
    icon: Globe,
    iconClassName: "bg-[#e8f0fe] text-[#3498db]",
  },
  // ── Create ────────────────────────────────────────────────────────────────
  {
    title: "Photo Editor",
    description: "Add text, shapes, stickers and effects to your photos with our free editor.",
    href: "/photo-editor",
    categories: ["Create"],
    icon: Pencil,
    iconClassName: "bg-[#f3e8ff] text-[#7c3aed]",
    isNew: true,
  },
  {
    title: "Meme Generator",
    description: "Create funny memes online. Add captions to any image with our meme maker.",
    href: "/meme-generator",
    categories: ["Create"],
    icon: Laugh,
    iconClassName: "bg-[#fdf2f8] text-[#db2777]",
    isNew: true,
  },
  // ── Security ──────────────────────────────────────────────────────────────
  {
    title: "Watermark Image",
    description: "Stamp an image or text over your image. Select the typography, transparency and position.",
    href: "/watermark-image",
    categories: ["Security"],
    icon: Stamp,
    iconClassName: "bg-[#e8f0fe] text-[#4a7aab]",
  },
  {
    title: "Blur Face",
    description: "Blur faces and sensitive information in photos automatically or manually.",
    href: "/blur-face",
    categories: ["Security"],
    icon: ScanFace,
    iconClassName: "bg-[#f1f5f9] text-[#64748b]",
    isNew: true,
  },
];

export function getToolsByFilter(filter: string): Tool[] {
  if (filter === "All") {
    return IMAGE_TOOLS;
  }
  return IMAGE_TOOLS.filter((tool) => tool.categories.includes(filter as ToolFilterCategory));
}
