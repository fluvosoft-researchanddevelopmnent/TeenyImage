import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Background Online",
  description: "Remove backgrounds from images automatically in your browser using AI. Download transparent PNGs instantly.",
  openGraph: {
    title: "Remove Background Online | TeenyImage",
    description: "Remove backgrounds from images automatically in your browser using AI. Download transparent PNGs instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}