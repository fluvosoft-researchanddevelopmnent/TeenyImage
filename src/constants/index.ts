export { IMAGE_TOOLS, getToolsByFilter } from "./tools";
export type { Tool } from "./tools";

export const HERO_FILTERS = [
  "All",
  "Optimize",
  "Edit",
  "Convert",
  "Create",
  "Security",
] as const;

export const HERO_CONTENT = {
  title: "Every image tool you need — free, private, in your browser",
  descriptionLine1:
    "All the image tools you need — 100% free, browser-based, and private.",
  descriptionLine2:
    "Compress, resize, crop, convert, edit and more. Your files never leave your device.",
};

export const NAV_LINKS = [
  { label: "Compress Image", href: "/compress-image" },
  { label: "Resize Image", href: "/resize-image" },
  { label: "Crop Image", href: "/crop-image" },
  { label: "Convert to JPG", href: "/convert-to-jpg" },
  { label: "Blog", href: "/blog" },
  { label: "All Tools", href: "/", hasDropdown: true },
] as const;
