import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/layout/Container";

const CARDS = [
  {
    title: "Work offline with Desktop",
    description:
      "Batch convert and manage documents in your browser — private, local, and with no upload limits.",
    href: "/",
    image: "/images/work-your-way/desktop.png",
    imageAlt: "TeenyPDF desktop converter preview",
  },
  {
    title: "On-the-go with Mobile",
    description:
      "Your favorite PDF tools, right in your pocket. Keep working on your projects anytime, anywhere.",
    href: "/",
    image: "/images/work-your-way/mobile.png",
    imageAlt: "TeenyPDF mobile editing preview",
  },
  {
    title: "Built for business",
    description:
      "Automate document workflows, onboard teams easily, and scale conversions with flexible plans.",
    href: "/",
    image: "/images/work-your-way/business.png",
    imageAlt: "TeenyPDF business tools preview",
  },
] as const;

export function WorkYourWaySection() {
  return (
    <section className="bg-surface py-16 md:py-20">
      <Container>
        <h2 className="mb-8 text-center text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl md:mb-12 md:text-4xl">
          Work your way
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_12px_36px_rgba(229,50,45,0.12)]"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#f8e8e0]">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain object-center transition duration-500 group-hover:scale-[1.02]"
                  priority={false}
                />
              </div>

              <div className="relative flex flex-1 flex-col gap-2 px-6 pb-6 pt-5">
                <h3 className="pr-8 text-lg font-bold text-text-primary">{card.title}</h3>
                <p className="pr-6 text-sm leading-relaxed text-text-secondary">{card.description}</p>
                <span className="absolute bottom-5 right-5 flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition group-hover:bg-red-50 group-hover:text-brand">
                  <ArrowUpRight size={18} strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
