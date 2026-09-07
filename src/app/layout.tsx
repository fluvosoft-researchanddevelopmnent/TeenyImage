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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teenyimage.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TeenyImage — Free Online Image Tools",
    template: "%s | TeenyImage",
  },
  description:
    "Free, browser-based image tools. Compress, resize, crop, rotate, convert, remove background, and more — 100% client-side, private, and unlimited.",
  keywords: [
    "image tools",
    "compress image",
    "resize image",
    "crop image",
    "convert jpg",
    "convert png",
    "remove background",
    "watermark image",
    "blur face",
    "free online image editor",
    "privacy image converter",
  ],
  authors: [{ name: "FluvoSoft", url: "https://github.com/fluvosoft-researchanddevelopmnent" }],
  creator: "FluvoSoft",
  publisher: "FluvoSoft",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TeenyImage",
    title: "TeenyImage — Free Online Image Tools",
    description:
      "100% client-side, private image tools. Compress, resize, crop, convert, and edit images without uploading files to any server.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeenyImage — Free Online Image Tools",
    description:
      "100% browser-based private image toolkit. Compress, convert, edit, and optimize images with zero cloud uploads.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "TeenyImage",
      description: "100% client-side private image tools. Compress, resize, crop, convert, and edit photos.",
      publisher: {
        "@type": "Organization",
        name: "FluvoSoft",
        url: "https://github.com/fluvosoft-researchanddevelopmnent",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#application`,
      name: "TeenyImage",
      url: siteUrl,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free, browser-based image tools. Compress, resize, crop, rotate, convert, remove background, and more with zero server uploads.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col font-sans bg-background text-text-primary"
      >
        <AppProvider>
          <ThemeRegistry>
            <Header />
            <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
            <Footer />
          </ThemeRegistry>
        </AppProvider>
      </body>
    </html>
  );
}
