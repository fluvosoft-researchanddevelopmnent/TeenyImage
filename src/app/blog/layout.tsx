import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TeenyImage Blog — Guides & Tutorials",
  description: "Expert tips, tutorials, and guides on image optimization, editing, privacy, and file formats.",
  openGraph: {
    title: "TeenyImage Blog — Guides & Tutorials | TeenyImage",
    description: "Expert tips, tutorials, and guides on image optimization, editing, privacy, and file formats.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}