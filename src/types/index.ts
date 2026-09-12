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

// ── Shared Tool Option Types ────────────────────────────────────────────────

export type ImageQualityLevel = "strong" | "recommended" | "high";

export type ImageFormat = "jpg" | "jpeg" | "png" | "webp" | "gif" | "svg";

export type ResizeUnit = "pixels" | "percentage";

export type CropAspectRatioPreset = "free" | "1:1" | "4:3" | "16:9" | "3:2";

export type WatermarkPosition =
  | "tl"
  | "tc"
  | "tr"
  | "ml"
  | "mc"
  | "mr"
  | "bl"
  | "bc"
  | "br";

export type BlurMode = "auto" | "manual";

export type BlurIntensity = "low" | "medium" | "high";
