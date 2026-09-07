import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert to PNG Online",
  description: "Convert JPG, WEBP, GIF, BMP, or SVG images to high-quality transparent PNG format in your browser.",
  openGraph: {
    title: "Convert to PNG Online | TeenyImage",
    description: "Convert JPG, WEBP, GIF, BMP, or SVG images to high-quality transparent PNG format in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}