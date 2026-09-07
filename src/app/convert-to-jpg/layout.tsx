import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert to JPG Online",
  description: "Convert PNG, GIF, TIF, PSD, SVG, WEBP, or RAW photos to JPG format in seconds. Batch processing supported.",
  openGraph: {
    title: "Convert to JPG Online | TeenyImage",
    description: "Convert PNG, GIF, TIF, PSD, SVG, WEBP, or RAW photos to JPG format in seconds. Batch processing supported.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}