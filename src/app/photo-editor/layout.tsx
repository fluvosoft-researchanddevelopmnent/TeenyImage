import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Editor Online",
  description: "Free online photo editor. Add text, shapes, stickers, drawings, and effects directly in your browser.",
  openGraph: {
    title: "Photo Editor Online | TeenyImage",
    description: "Free online photo editor. Add text, shapes, stickers, drawings, and effects directly in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}