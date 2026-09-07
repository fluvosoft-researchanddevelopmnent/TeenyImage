import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate IMAGE Online",
  description: "Rotate JPG, PNG, or GIF images online. Rotate 90 degrees left, right, 180 degrees, or custom angles.",
  openGraph: {
    title: "Rotate IMAGE Online | TeenyImage",
    description: "Rotate JPG, PNG, or GIF images online. Rotate 90 degrees left, right, 180 degrees, or custom angles.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}