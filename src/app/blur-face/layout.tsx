import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blur Face & Censor Photos",
  description: "Protect privacy by blurring faces, license plates, and sensitive details in your photos with one click.",
  openGraph: {
    title: "Blur Face & Censor Photos | TeenyImage",
    description: "Protect privacy by blurring faces, license plates, and sensitive details in your photos with one click.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}