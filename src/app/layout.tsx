import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ThemeRegistry } from "@/lib/theme/ThemeRegistry";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CloudSyncModal } from "@/components/common/CloudSyncModal";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TeenyPDF — Modern PDF Tools & Plagiarism Engine",
  description: "Lightweight, secure, 100% client-side PDF tools with built-in Turnitin-style plagiarism detection.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={poppins.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
      >
        <AppProvider>
          <ThemeRegistry>
            <Header />
            <CloudSyncModal />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeRegistry>
        </AppProvider>
      </body>
    </html>
  );
}
