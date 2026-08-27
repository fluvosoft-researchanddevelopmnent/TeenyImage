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
    <section className="bg-background pb-10 md:pb-12">
      <Container className="max-w-none px-4 sm:px-5 lg:px-6 xl:px-8">
        <div className="-mx-4 mb-6 flex w-[calc(100%+2rem)] gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-6 sm:w-full sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 sm:overflow-visible sm:px-0 lg:mb-8">
          {HERO_FILTERS.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {tools.map((tool) => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </Container>
    </section>
  );
}
