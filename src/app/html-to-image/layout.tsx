import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to Image Converter",
  description: "Convert HTML code or web documents into high-resolution JPG or PNG images. 100% browser-based.",
  openGraph: {
    title: "HTML to Image Converter | TeenyImage",
    description: "Convert HTML code or web documents into high-resolution JPG or PNG images. 100% browser-based.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}