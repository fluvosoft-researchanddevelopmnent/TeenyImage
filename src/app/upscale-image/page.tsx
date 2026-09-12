"use client";

import { useState } from "react";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  getImageDimensions,
  upscaleImage,
  type UpscaleFactor,
} from "@/lib/image/upscaleImage";
import { useApp } from "@/context/AppContext";

const ACCEPT_TYPES = ".jpg,.jpeg,.png";

const SCALE_OPTIONS: UpscaleFactor[] = [2, 4];

export default function UpscaleImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/upscale-image")!;
  const { addRecentFile } = useApp();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(
    null
  );
  const [scale, setScale] = useState<UpscaleFactor>(2);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [resultDims, setResultDims] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setError(null);
    setOriginalDims(null);

    if (!file) return;

    try {
      const dims = await getImageDimensions(file);
      setOriginalDims(dims);
    } catch {
      setError("Couldn't read this image's dimensions — please try a different file.");
    }
  }

  async function handleConvert() {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await upscaleImage(selectedFile, scale);
      const url = URL.createObjectURL(result.blob);

      setDownloadUrl(url);
      setResultName(result.fileName);
      setResultDims({ width: result.upscaledWidth, height: result.upscaledHeight });

      addRecentFile({
        name: result.fileName,
        toolUsed: tool.title,
        size: result.blob.size,
        downloadUrl: url,
      });
    } catch {
      setError("Couldn't upscale this file — please check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleReset() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setSelectedFile(null);
    setOriginalDims(null);
    setDownloadUrl(null);
    setResultName("");
    setResultDims(null);
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
        inputId="upscale-image-upload"
        actionLabel={`Upscale ${scale}x`}
        processingLabel="Upscaling..."
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        downloadUrl={downloadUrl}
        resultName={resultName}
        downloadLabel="Download Upscaled Image"
        onFileChange={handleFileChange}
        onConvert={handleConvert}
        onReset={handleReset}
      >
        {selectedFile && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-secondary text-center">
              Scale factor
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SCALE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setScale(option)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-center transition",
                    scale === option
                      ? "border-brand bg-red-50 text-brand"
                      : "border-border text-text-secondary hover:border-brand/50"
                  )}
                >
                  <span className="block text-sm font-bold">{option}x</span>
                </button>
              ))}
            </div>

            {originalDims && (
              <p className="text-[11px] text-text-secondary text-center">
                {originalDims.width} × {originalDims.height} →{" "}
                <span className="font-semibold text-brand">
                  {originalDims.width * scale} × {originalDims.height * scale}
                </span>
              </p>
            )}

            {error && (
              <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
            )}
          </div>
        )}
      </ConversionPageLayout>

      {resultDims && downloadUrl && (
        <div className="max-w-4xl mx-auto px-4 -mt-4 sm:-mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-secondary">
            <span>Final resolution:</span>
            <span className="text-brand">
              {resultDims.width} × {resultDims.height}px
            </span>
          </div>
        </div>
      )}
    </>
  );
}