import Link from "next/link";
import { Container } from "@/components/layout/Container";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <section className="py-16 md:py-20">
      <Container>
        <nav className="mb-8 text-sm text-text-secondary">
          <Link href="/" className="hover:text-brand transition-colors">
            Home
          </Link>
          {" > "}
          <Link href="/blog" className="hover:text-brand transition-colors">
            Blog
          </Link>
          {" > "}
          <span className="text-text-primary capitalize">
            {slug.replace(/-/g, " ")}
          </span>
        </nav>
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-text-secondary text-center py-20">
            Blog post coming soon...
          </p>
        </div>
      </Container>
    </section>
  );
}