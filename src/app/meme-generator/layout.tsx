import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme Generator Online",
  description: "Create hilarious memes online in seconds. Add custom captions, adjust typography, and download instantly.",
  openGraph: {
    title: "Meme Generator Online | TeenyImage",
    description: "Create hilarious memes online in seconds. Add custom captions, adjust typography, and download instantly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}