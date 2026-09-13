import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TeenyIMG Blog — Guides & Tutorials",
  description: "Expert tips, tutorials, and guides on image optimization, editing, privacy, and file formats.",
  openGraph: {
    title: "TeenyIMG Blog — Guides & Tutorials | TeenyIMG",
    description: "Expert tips, tutorials, and guides on image optimization, editing, privacy, and file formats.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}