import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Image Online",
  description: "Protect your photos by stamping text or logo watermarks. Customize position, opacity, and batch apply.",
  openGraph: {
    title: "Watermark Image Online | TeenyImage",
    description: "Protect your photos by stamping text or logo watermarks. Customize position, opacity, and batch apply.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}