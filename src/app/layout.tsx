import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ThemeRegistry } from "@/lib/theme/ThemeRegistry";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TeenyPDF — Free PDF Converter Tools",
  description: "Free, browser-based PDF conversion tools. Convert PDF to Word, Excel, PowerPoint, JPG, Markdown and more — or convert Word, Excel, images into PDF. 100% client-side, private, and unlimited.",
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
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeRegistry>
        </AppProvider>
      </body>
    </html>
  );
}
