import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BLOG_POSTS, getBlogPostBySlug } from "@/constants/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${post.title} | TeenyImage`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | TeenyImage`,
      description: post.excerpt,
      type: "article",
      publishedTime: "2026-09-07T00:00:00.000Z",
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="bg-background py-10 sm:py-16">
      <Container className="max-w-3xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-text-secondary">
          <Link href="/" className="hover:text-brand transition no-underline text-inherit">
            Home
          </Link>
          <ChevronRight size={12} className="text-text-secondary/60" />
          <Link href="/blog" className="hover:text-brand transition no-underline text-inherit">
            Blog
          </Link>
          <ChevronRight size={12} className="text-text-secondary/60" />
          <span className="truncate max-w-[200px] sm:max-w-none text-text-primary font-medium">
            {post.title}
          </span>
        </nav>

        {/* Date and Author */}
        <div className="flex items-center gap-3 text-xs text-text-secondary font-medium uppercase tracking-wider">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.author}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-brand lowercase">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-extrabold leading-tight text-text-primary sm:text-3xl md:text-4xl">
          {post.title}
        </h1>

        {/* Top CTA Button */}
        <div className="mt-8 mb-10 text-center">
          <Link
            href={post.primaryCta.href}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark no-underline"
          >
            {post.primaryCta.label}
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Lead Excerpt */}
        <p className="border-l-4 border-brand pl-4 text-base italic leading-relaxed text-text-secondary sm:text-lg">
          {post.excerpt}
        </p>

        {/* Article Body Sections */}
        <div className="mt-8 space-y-8 text-base leading-relaxed text-text-secondary">
          {post.sections.map((section, index) => (
            <section key={index} className="space-y-3">
              <h2 className="text-lg font-bold text-text-primary sm:text-xl">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, pIndex) => (
                <p key={pIndex} className="leading-7">
                  {p}
                </p>
              ))}
              {section.calloutLink && (
                <div className="pt-1">
                  <Link
                    href={section.calloutLink.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline"
                  >
                    👉 {section.calloutLink.text}
                  </Link>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-brand">
            <ShieldCheck size={24} />
          </div>
          <h3 className="mt-4 text-xl font-bold text-text-primary">
            Ready to edit and optimize your images?
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Free, fast, and private — your photos never leave your device.
          </p>
          <div className="mt-6">
            <Link
              href={post.primaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark no-underline"
            >
              {post.primaryCta.label}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Related Tools Cluster */}
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-text-secondary/70">
            Related Image Tools
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {post.relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-text-secondary transition hover:border-brand hover:text-brand no-underline"
              >
                {tool.title}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </article>
  );
}