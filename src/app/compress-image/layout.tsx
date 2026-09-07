import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress IMAGE Online",
  description: "Compress JPG, PNG, SVG, or WEBP with maximal quality and reduction. Free and 100% client-side in your browser.",
  openGraph: {
    title: "Compress IMAGE Online | TeenyImage",
    description: "Compress JPG, PNG, SVG, or WEBP with maximal quality and reduction. Free and 100% client-side in your browser.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}