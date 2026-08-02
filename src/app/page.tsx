import { FileText, Merge, Scissors, Shield } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const features = [
  {
    icon: Merge,
    title: "Merge PDFs",
    description: "Combine multiple PDF files into a single document in seconds.",
  },
  {
    icon: Scissors,
    title: "Split & Extract",
    description: "Split large PDFs or extract specific pages with precision.",
  },
  {
    icon: Shield,
    title: "Secure Processing",
    description: "Your files stay private with client-side processing where possible.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <Container className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <Icon icon={FileText} size={32} />
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
            TeenyPDF
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary">
            Fast, modular PDF tools built with Next.js, Material UI, and Tailwind CSS.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button variant="contained" size="large">
              Get Started
            </Button>
            <Button variant="outlined" size="large">
              View Tools
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <h2 className="mb-10 text-center text-2xl font-semibold text-text-primary">
            Powerful PDF Features
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
