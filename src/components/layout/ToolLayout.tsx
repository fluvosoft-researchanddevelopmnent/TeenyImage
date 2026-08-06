import { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { LucideIcon } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  children: ReactNode;
}

export function ToolLayout({
  title,
  description,
  icon: Icon,
  iconClassName,
  children,
}: ToolLayoutProps) {
  return (
    <section className="bg-[#f5f5fa] pb-16 pt-12 md:pb-24 md:pt-16 min-h-[calc(100vh-140px)]">
      <Container>
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${iconClassName}`}
          >
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#333] md:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg text-[#666]">
            {description}
          </p>
        </div>
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </Container>
    </section>
  );
}
