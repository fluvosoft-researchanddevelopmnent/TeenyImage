"use client";

import { cn } from "@/lib/utils/cn";

export type FilterChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function FilterChip({ label, active = false, onClick, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors lg:px-3",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-surface text-text-secondary hover:border-brand/40 hover:bg-red-50",
        className,
      )}
    >
      {label}
    </button>
  );
}
