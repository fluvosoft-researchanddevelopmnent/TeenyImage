import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upscale Image Online",
  description: "Enlarge and enhance your images with 2x and 4x bicubic upscaling. Free, fast, and completely private.",
  openGraph: {
    title: "Upscale Image Online | TeenyImage",
    description: "Enlarge and enhance your images with 2x and 4x bicubic upscaling. Free, fast, and completely private.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}