"use client";

import { useState } from "react";

import { Container } from "@/components/layout/Container";
import { FilterChip } from "@/components/ui/FilterChip";
import { ToolCard } from "@/components/ui/ToolCard";
import { HERO_FILTERS } from "@/constants";
import { getToolsByFilter } from "@/constants/tools";

export function ToolsSection() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const tools = getToolsByFilter(activeFilter);

  return (
    <section className="bg-[#f5f5fa] pb-16">
      <Container>
        <div className="mb-8 flex w-full flex-wrap items-center justify-center gap-4">
          {HERO_FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
