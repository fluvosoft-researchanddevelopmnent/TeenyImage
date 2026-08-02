import type { HERO_FILTERS } from "@/constants";

export type ToolFilterCategory = Exclude<(typeof HERO_FILTERS)[number], "All" | "Workflows">;

export type BaseComponentProps = {
  className?: string;
  children?: React.ReactNode;
};

export type WithIcon = {
  icon?: import("lucide-react").LucideIcon;
};

export type { Tool } from "@/constants/tools";
