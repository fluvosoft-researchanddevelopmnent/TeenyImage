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
          ? "border-[#333] bg-[#333] text-white"
          : "border-[#e8e8e8] bg-white text-[#555] hover:border-[#d0d0d0] hover:bg-[#fafafa]",
        className,
      )}
    >
      {label}
    </button>
  );
}
