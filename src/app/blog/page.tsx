"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BLOG_POSTS } from "@/constants/blog";

const CATEGORIES = ["All", "Optimization", "Formats", "Privacy"] as const;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredPosts =
    activeCategory === "All"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((post) => post.category === activeCategory);

  return (
    <div className="bg-background py-14 sm:py-20">
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-brand">
            <BookOpen size={14} />
            Guides & Insights
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            TeenyImage Blog
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            Practical tutorials, format deep-dives, and performance guides for editing and optimizing images privately in your browser.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "border border-border bg-surface text-text-secondary hover:border-brand/40 hover:text-brand"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span className="rounded-md bg-red-50 px-2.5 py-1 font-semibold text-brand">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-bold leading-snug text-text-primary hover:text-brand">
                  <Link href={`/blog/${post.slug}`} className="no-underline text-inherit">
                    {post.title}
                  </Link>
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-text-secondary line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between">
                <span className="text-xs text-text-secondary">{post.date}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand transition hover:text-brand-dark no-underline"
                >
                  Read guide <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}