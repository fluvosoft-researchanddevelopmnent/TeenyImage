"use client";

import { useState } from "react";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  compressImage,
  type CompressQuality,
} from "@/lib/image/compressImage";

const ACCEPT_TYPES = ".jpg,.jpeg,.png,.svg,.gif,.webp";

const QUALITY_OPTIONS: { value: CompressQuality; label: string; hint: string }[] = [
  { value: "strong", label: "Strong", hint: "Smallest file" },
  { value: "recommended", label: "Recommended", hint: "Default" },
  { value: "high", label: "High Quality", hint: "Larger file" },
];

export default function CompressImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/compress-image")!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<CompressQuality>("recommended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [sizeInfo, setSizeInfo] = useState<{
    original: number;
    compressed: number;
    reduction: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setError(null);
  }

  async function handleConvert() {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await compressImage(selectedFile, quality);
      const url = URL.createObjectURL(result.blob);

      setDownloadUrl(url);
      setResultName(result.fileName);
      setSizeInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
        reduction: result.reductionPercent,
      });
    } catch {
      setError("Couldn't compress this file — please check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setSelectedFile(null);
    setDownloadUrl(null);
    setResultName("");
    setSizeInfo(null);
    setError(null);
  }

  return (
    <>
      <ConversionPageLayout
        title={tool.title}
        description={tool.description}
        badge={tool.categories[0]}
        icon={tool.icon}
        acceptTypes={ACCEPT_TYPES}
        inputId="compress-image-upload"
        actionLabel="Compress Image"
        processingLabel="Compressing..."
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        downloadUrl={downloadUrl}
        resultName={resultName}
        downloadLabel="Download Compressed Image"
        error={error}
        onFileChange={handleFileChange}
        onConvert={handleConvert}
        onReset={handleReset}
      >
        <div className="space-y-3">
          <p className="text-xs font-semibold text-text-secondary text-center">
            Compression level
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setQuality(option.value)}
                className={cn(
                  "rounded-xl border px-2 py-3 text-center transition",
                  quality === option.value
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-secondary hover:border-brand/50"
                )}
              >
                <span className="block text-xs font-bold">{option.label}</span>
                <span className="block text-[10px] mt-0.5 opacity-70">
                  {option.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      </ConversionPageLayout>

      {sizeInfo && downloadUrl && (
        <div className="max-w-4xl mx-auto px-4 -mt-4 sm:-mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary">
            <span>{formatBytes(sizeInfo.original)}</span>
            <span className="text-text-secondary/40">→</span>
            <span className="text-brand">{formatBytes(sizeInfo.compressed)}</span>
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-brand">
              {sizeInfo.reduction}% smaller
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}