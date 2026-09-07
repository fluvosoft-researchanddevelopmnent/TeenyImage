import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flip IMAGE Online",
  description: "Flip JPG, PNG, GIF, or WEBP images horizontally or vertically in your browser with zero uploads.",
  openGraph: {
    title: "Flip IMAGE Online | TeenyImage",
    description: "Flip JPG, PNG, GIF, or WEBP images horizontally or vertically in your browser with zero uploads.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}