import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Converter",
  description: "Combine multiple JPG, PNG, or WEBP images into a single PDF document. Customize orientation, margins, and page order.",
  openGraph: {
    title: "Image to PDF Converter | TeenyImage",
    description: "Combine multiple JPG, PNG, or WEBP images into a single PDF document. Customize orientation, margins, and page order.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}