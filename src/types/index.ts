import type { HERO_FILTERS } from "@/constants";

export type ToolFilterCategory = Exclude<(typeof HERO_FILTERS)[number], "All">;

export type BaseComponentProps = {
  className?: string;
  children?: React.ReactNode;
};

export type WithIcon = {
  icon?: import("lucide-react").LucideIcon;
};

export type { Tool } from "@/constants/tools";

export interface ProcessedFileRecord {
  id: string;
  name: string;
  toolUsed: string;
  size: number;
  processedAt: string;
  downloadUrl?: string;
}
