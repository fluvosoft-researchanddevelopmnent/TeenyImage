"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Container } from "@/components/layout/Container";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log client-side error to internal diagnostics without leaking private data
    console.error("Application error boundary triggered:", error.message);
  }, [error]);

  return (
    <section className="flex min-h-[calc(100vh-180px)] items-center justify-center py-16">
      <Container className="text-center">
        <div className="mx-auto max-w-md">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle size={32} />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            An unexpected error occurred while processing. Your files remain safe and private on your device.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark cursor-pointer"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-surface/80"
            >
              <Home size={16} />
              Home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}