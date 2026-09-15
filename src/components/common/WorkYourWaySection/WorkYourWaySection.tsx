import Image from "next/image";
import { Monitor, Smartphone, Layers, Check } from "lucide-react";

import { Container } from "@/components/layout/Container";

const CARDS = [
  {
    badge: "Desktop & Laptop",
    icon: Monitor,
    title: "Work offline with Desktop",
    description:
      "Batch process and transform high-resolution images in your desktop browser — fast, private, and with zero upload wait times.",
    image: "/images/work-your-way/desktop-new.jpg",
    imageAlt: "TeenyIMG desktop browser workstation preview",
    highlights: ["Hardware accelerated", "Works without internet", "No software install"],
  },
  {
    badge: "Mobile & Tablet",
    icon: Smartphone,
    title: "On-the-go with Mobile",
    description:
      "Quickly crop, resize, and optimize photos directly from your smartphone or tablet camera roll with touch-first controls.",
    image: "/images/work-your-way/mobile-new.jpg",
    imageAlt: "TeenyIMG mobile photo editing preview",
    highlights: ["Touch-optimized", "Direct camera roll edit", "Zero phone storage used"],
  },
  {
    badge: "Batch & Workflows",
    icon: Layers,
    title: "Built for creative workflows",
    description:
      "Process multiple images simultaneously, apply uniform watermarks, and export cleanly as individual files or ZIP packages.",
    image: "/images/work-your-way/business-new.jpg",
    imageAlt: "TeenyIMG batch image processing preview",
    highlights: ["Multi-image processing", "One-click ZIP bundle", "Unlimited free usage"],
  },
] as const;

export function WorkYourWaySection() {
  return (
    <section className="bg-surface py-16 md:py-20">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <h2 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl md:text-4xl">
            Work your way
          </h2>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Flexible, private image tools built to adapt seamlessly to your devices and daily routines.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              >
                {/* Visual Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#faf4ee]">
                  <Image
                    src={card.image}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition duration-500 hover:scale-[1.03]"
                    priority={false}
                  />
                </div>

                {/* Card Content Area */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  {/* Badge */}
                  <div className="mb-3 flex items-center gap-1.5 self-start rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-brand">
                    <Icon size={13} className="text-brand" />
                    <span>{card.badge}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-text-primary sm:text-xl">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.description}</p>

                  {/* Feature Highlights */}
                  <div className="mt-5 border-t border-border/60 pt-4">
                    <ul className="space-y-2">
                      {card.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <Check size={11} strokeWidth={2.5} />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
