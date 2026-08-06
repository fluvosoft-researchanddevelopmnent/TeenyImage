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

export interface ProcessedFileRecord {
  id: string;
  name: string;
  toolUsed: string;
  size: number;
  processedAt: string;
  downloadUrl?: string;
}

export interface PlagiarismMatch {
  sourceTitle: string;
  sourceType: "internal" | "web" | "academic";
  url?: string;
  similarityPercentage: number;
  matchedPassages: {
    targetSnippet: string;
    sourceSnippet: string;
  }[];
}

export interface PlagiarismResult {
  id: string;
  documentTitle: string;
  wordCount: number;
  overallSimilarity: number;
  uniquePercentage: number;
  matches: PlagiarismMatch[];
  indexedAt: string;
  fullText: string;
}

export type SubscriptionTier = "free" | "pro" | "pro_plagiarism";
