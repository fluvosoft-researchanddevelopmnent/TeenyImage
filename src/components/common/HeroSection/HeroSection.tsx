"use client";

import { Container } from "@/components/layout/Container";
import { HERO_CONTENT } from "@/constants";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-14 md:pb-10 md:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-red-100/50 blur-3xl" />
        <div className="absolute -right-16 top-24 h-80 w-80 rounded-full bg-red-50/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-red-100/30 blur-3xl" />
      </div>

      <Container className="relative text-center">
        <h1 className="font-display mx-auto mb-5 w-full text-[28px] font-semibold leading-[1.25] tracking-tight text-text-primary sm:text-4xl md:text-[42px]">
          {HERO_CONTENT.title}
        </h1>

        <p className="mx-auto w-full max-w-3xl text-base leading-7 text-text-secondary sm:text-[17px]">
          {HERO_CONTENT.descriptionLine1} {HERO_CONTENT.descriptionLine2}
        </p>
      </Container>
    </section>
  );
}
