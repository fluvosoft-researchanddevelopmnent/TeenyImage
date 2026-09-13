"use client";

import { useState } from "react";

import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  convertHtmlToImage,
  type HtmlOutputFormat,
} from "@/lib/image/htmlToImage";

const FORMAT_OPTIONS: { value: HtmlOutputFormat; label: string }[] = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
];

export default function HtmlToImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/html-to-image")!;

  const [outputFormat, setOutputFormat] = useState<HtmlOutputFormat>("jpg");
  const [htmlText, setHtmlText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleExecute(files: File[]) {
    setError(null);

    try {
      const htmlContent = files.length > 0 ? await files[0].text() : htmlText;
      const result = await convertHtmlToImage(htmlContent, outputFormat);
      return { blob: result.blob, fileName: result.fileName };
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't render this HTML — please check the content and try again."
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
      actionButtonText={`Convert to ${outputFormat.toUpperCase()}`}
      processingText="Rendering..."
      downloadButtonText={`Download ${outputFormat.toUpperCase()}`}
      successTitle="Image Created Successfully!"
      acceptedFileTypes=".html,.htm"
      allowMultiple={false}
      error={error}
      onExecute={handleExecute}
      customInputContent={
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-text-secondary">
            Paste raw HTML code
          </label>
          <textarea
            value={htmlText}
            onChange={(e) => setHtmlText(e.target.value)}
            rows={10}
            placeholder='<div style="padding:20px;background:#fff;">Hello World</div>'
            className="w-full rounded-lg border border-border px-3 py-2 text-xs font-mono outline-none focus:border-brand resize-y"
          />
        </div>
      }
      fileUploadTabLabel="Upload .html file"
      customInputTabLabel="Raw HTML Code"
      isCustomInputValid={htmlText.trim().length > 0}
      optionsContent={
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-text-secondary">
            Output format
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOutputFormat(option.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-bold transition",
                  outputFormat === option.value
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-secondary hover:border-brand/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}