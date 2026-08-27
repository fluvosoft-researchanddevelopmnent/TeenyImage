import Image from "next/image";
import Link from "next/link";
import { Lock, ShieldCheck, WifiOff } from "lucide-react";

import { Container } from "@/components/layout/Container";

export function FeatureTrustSection() {
  return (
    <>
      {/* Feature highlight — image left, copy right */}
      <section className="bg-background py-16 md:py-20">
        <Container>
          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
            <div className="relative mx-auto w-full max-w-md md:mx-0 md:max-w-none md:justify-self-end">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-background">
                <Image
                  src="/images/feature/privacy-promo.png"
                  alt="TeenyPDF document and image tools preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-contain object-center"
                  priority={false}
                />
              </div>
            </div>

            <div className="text-center md:max-w-xl md:text-left md:justify-self-start">
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-3xl md:text-4xl">
                PDF conversion made simple with TeenyPDF
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-[17px]">
                Experience the speed, simplicity, and security of tools that run in your browser.
                Convert, organize, and transform documents without uploading files to a server.
              </p>
              <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center rounded-xl border-2 border-brand px-6 py-3 text-sm font-bold text-brand transition hover:bg-red-50"
              >
                Explore all tools
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust band */}
      <section className="border-t border-border bg-surface py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl md:text-4xl">
              The PDF software built for private, everyday work
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-[17px]">
              TeenyPDF is your browser-based toolkit for converting PDFs with ease. Get the tools you
              need to work efficiently with digital documents while keeping your files on your device.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="flex flex-col items-center gap-2 text-text-secondary">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <WifiOff size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide">100% Browser-based</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-text-secondary">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <Lock size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide">Private by design</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-text-secondary">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background">
                  <ShieldCheck size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide">No account required</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
