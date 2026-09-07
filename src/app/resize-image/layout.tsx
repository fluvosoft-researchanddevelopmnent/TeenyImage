import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize IMAGE Online",
  description: "Resize JPG, PNG, SVG, or GIF images by defining new pixel dimensions or percentage scale. Fast and private.",
  openGraph: {
    title: "Resize IMAGE Online | TeenyImage",
    description: "Resize JPG, PNG, SVG, or GIF images by defining new pixel dimensions or percentage scale. Fast and private.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}