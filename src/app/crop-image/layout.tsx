import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crop IMAGE Online",
  description: "Crop JPG, PNG, or GIF images online with customizable aspect ratios and pixel-perfect cropping.",
  openGraph: {
    title: "Crop IMAGE Online | TeenyImage",
    description: "Crop JPG, PNG, or GIF images online with customizable aspect ratios and pixel-perfect cropping.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}