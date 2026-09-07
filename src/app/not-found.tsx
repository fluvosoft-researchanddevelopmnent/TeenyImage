import Link from "next/link";
import { ArrowLeft, Home, Minimize2, Image as ImageIcon, FileOutput, Eraser } from "lucide-react";
import { Container } from "@/components/layout/Container";

const POPULAR_TOOLS = [
  { title: "Compress Image", href: "/compress-image", icon: Minimize2, color: "text-[#16a34a] bg-[#e8f7ef]" },
  { title: "Resize Image", href: "/resize-image", icon: ImageIcon, color: "text-[#2563eb] bg-[#e8f0fe]" },
  { title: "Convert to JPG", href: "/convert-to-jpg", icon: FileOutput, color: "text-[#ca8a04] bg-[#fef9c3]" },
  { title: "Remove Background", href: "/remove-background", icon: Eraser, color: "text-[#5f8c30] bg-[#e5f5d2]" },
];

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-180px)] items-center justify-center py-16">
      <Container className="text-center">
        <div className="mx-auto max-w-xl">
          <div className="inline-flex items-center justify-center rounded-2xl bg-red-50 px-6 py-3 text-4xl font-extrabold tracking-tight text-brand">
            404
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Page not found
          </h1>

          <p className="mt-3 text-base leading-relaxed text-text-secondary">
            Sorry, the page or tool you are looking for doesn''t exist or has been moved.
            All processing remains 100% private in your browser.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            >
              <Home size={18} />
              Return Home
            </Link>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary/70">
              Popular Image Tools
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {POPULAR_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-3 text-center transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                    <tool.icon size={20} />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{tool.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}