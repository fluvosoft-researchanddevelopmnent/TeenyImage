import { Container } from "@/components/layout/Container";

export default function BlogPage() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
            TeenyImage Blog
          </h1>
          <p className="mt-4 text-base text-text-secondary">
            Tips, guides, and tutorials for working with images.
          </p>
        </div>
        <div className="flex items-center justify-center py-20 text-text-secondary">
          <p className="text-sm">Blog posts coming soon...</p>
        </div>
      </Container>
    </section>
  );
}
