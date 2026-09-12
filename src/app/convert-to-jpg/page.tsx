"use client";

import { useState } from "react";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";
import { convertToJpg } from "@/lib/image/convertToJpg";

const ACCEPT_TYPES = ".png,.gif,.tif,.tiff,.svg,.webp,.heic,.bmp,.ico";
const DEFAULT_QUALITY = 92;

export default function ConvertToJpgPage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/convert-to-jpg")!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
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
      const result = await convertToJpg(selectedFile, quality);
      const url = URL.createObjectURL(result.blob);

      setDownloadUrl(url);
      setResultName(result.fileName);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't convert this file — please check the format and try again."
      );
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
    setError(null);
  }

  return (
    <ConversionPageLayout
      title={tool.title}
      description={tool.description}
      badge={tool.categories[0]}
      icon={tool.icon}
      acceptTypes={ACCEPT_TYPES}
      inputId="convert-to-jpg-upload"
      actionLabel="Convert to JPG"
      processingLabel="Converting..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download JPG"
      error={error}
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
    >
      {selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="jpg-quality"
              className="text-[11px] font-semibold text-text-secondary"
            >
              JPEG Quality
            </label>
            <span className="text-xs font-bold text-brand">{quality}</span>
          </div>
          <input
            id="jpg-quality"
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-brand"
          />
        </div>
      )}
    </ConversionPageLayout>
  );
}