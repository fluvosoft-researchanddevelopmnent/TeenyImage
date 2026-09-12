"use client";

import { useState } from "react";

import { ToolWorkspaceLayout } from "@/components/tools";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  convertImagesToPdf,
  type PdfPageSize,
  type PdfOrientation,
  type PdfMargin,
} from "@/lib/image/imageToPdf";

const ACCEPT_TYPES = ".jpg,.jpeg,.png,.webp";

const PAGE_SIZE_OPTIONS: PdfPageSize[] = ["A4", "Letter", "Original"];
const ORIENTATION_OPTIONS: PdfOrientation[] = ["portrait", "landscape"];
const MARGIN_OPTIONS: { value: PdfMargin; label: string }[] = [
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export default function ImageToPdfPage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/image-to-pdf")!;

  const [pageSize, setPageSize] = useState<PdfPageSize>("A4");
  const [orientation, setOrientation] = useState<PdfOrientation>("portrait");
  const [margin, setMargin] = useState<PdfMargin>("medium");
  const [error, setError] = useState<string | null>(null);

  async function handleExecute(files: File[]) {
    setError(null);

    try {
      const result = await convertImagesToPdf(files, {
        pageSize,
        orientation,
        margin,
      });
      return { blob: result.blob, fileName: result.fileName };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't create the PDF — please check your files and try again."
      );
      return undefined;
    }
  }

  return (
    <ToolWorkspaceLayout
      title={tool.title}
      description={tool.description}
      category={tool.categories[0]}
      icon={tool.icon}
      actionButtonText="Create PDF"
      acceptedFileTypes={ACCEPT_TYPES}
      allowMultiple
      onExecute={handleExecute}
      optionsContent={
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-text-secondary mb-2">
              Page Size
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PAGE_SIZE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPageSize(option)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-bold transition",
                    pageSize === option
                      ? "border-brand bg-red-50 text-brand"
                      : "border-border text-text-secondary hover:border-brand/50"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {pageSize !== "Original" && (
            <div>
              <p className="text-[11px] font-semibold text-text-secondary mb-2">
                Orientation
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ORIENTATION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setOrientation(option)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-bold capitalize transition",
                      orientation === option
                        ? "border-brand bg-red-50 text-brand"
                        : "border-border text-text-secondary hover:border-brand/50"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-text-secondary mb-2">
              Margin
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MARGIN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMargin(option.value)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-bold transition",
                    margin === option.value
                      ? "border-brand bg-red-50 text-brand"
                      : "border-border text-text-secondary hover:border-brand/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-text-secondary/70 text-center">
            Pages are created in the order files were selected.
          </p>

          {error && (
            <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
          )}
        </div>
      }
    />
  );
}