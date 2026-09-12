"use client";

import { useState } from "react";

import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  convertFromJpg,
  type JpgTargetFormat,
} from "@/lib/image/convertFromJpg";

const ACCEPT_TYPES = ".jpg,.jpeg";

const FORMAT_OPTIONS: { value: JpgTargetFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "gif", label: "GIF" },
  { value: "animated-gif", label: "Animated GIF" },
];

export default function JpgToImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/jpg-to-image")!;

  const [targetFormat, setTargetFormat] = useState<JpgTargetFormat>("png");
  const [error, setError] = useState<string | null>(null);

  async function handleExecute(files: File[]) {
    setError(null);

    try {
      const result = await convertFromJpg(files, targetFormat);
      return { blob: result.blob, fileName: result.fileName };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't convert these files — please try again."
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
      actionButtonText={
        targetFormat === "animated-gif"
          ? "Create Animated GIF"
          : `Convert to ${targetFormat.toUpperCase()}`
      }
      acceptedFileTypes={ACCEPT_TYPES}
      allowMultiple={targetFormat === "animated-gif"}
      onExecute={handleExecute}
      optionsContent={
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-text-secondary">
            Output format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetFormat(option.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-bold transition",
                  targetFormat === option.value
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-secondary hover:border-brand/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {targetFormat === "animated-gif" && (
            <p className="text-[10px] text-text-secondary/70 text-center">
              Select 2 or more JPGs — frames play in upload order.
            </p>
          )}
          {error && (
            <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
          )}
        </div>
      }
    />
  );
}