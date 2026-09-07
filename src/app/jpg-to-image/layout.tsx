import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert from JPG Online",
  description: "Convert JPG images to PNG, WEBP, or animated GIF format with adjustable quality settings.",
  openGraph: {
    title: "Convert from JPG Online | TeenyImage",
    description: "Convert JPG images to PNG, WEBP, or animated GIF format with adjustable quality settings.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}