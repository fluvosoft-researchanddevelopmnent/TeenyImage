"use client";

import { useState } from "react";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";
import { cn } from "@/lib/utils/cn";
import {
  getImageDimensions,
  resizeImage,
} from "@/lib/image/resizeImage";

const ACCEPT_TYPES = ".jpg,.jpeg,.png,.svg,.gif";

type Unit = "px" | "percent";

export default function ResizeImagePage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/resize-image")!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);

  const [unit, setUnit] = useState<Unit>("px");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setError(null);
    setWidth("");
    setHeight("");
    setOriginalDims(null);

    if (!file) return;

    try {
      const dims = await getImageDimensions(file);
      setOriginalDims(dims);
      if (unit === "px") {
        setWidth(String(dims.width));
        setHeight(String(dims.height));
      } else {
        setWidth("100");
        setHeight("100");
      }
    } catch {
      setError("Couldn't read this image's dimensions — please try a different file.");
    }
  }

  function handleWidthChange(value: string) {
    setWidth(value);

    if (!lockAspectRatio || !originalDims) return;

    const numeric = Number(value);
    if (!numeric || numeric <= 0) return;

    if (unit === "px") {
      const ratio = originalDims.height / originalDims.width;
      setHeight(String(Math.round(numeric * ratio)));
    } else {
      setHeight(value);
    }
  }

  function handleHeightChange(value: string) {
    setHeight(value);

    if (!lockAspectRatio || !originalDims) return;

    const numeric = Number(value);
    if (!numeric || numeric <= 0) return;

    if (unit === "px") {
      const ratio = originalDims.width / originalDims.height;
      setWidth(String(Math.round(numeric * ratio)));
    } else {
      setWidth(value);
    }
  }

  function handleUnitChange(nextUnit: Unit) {
    if (!originalDims) {
      setUnit(nextUnit);
      return;
    }

    if (nextUnit === "percent") {
      const currentWidth = Number(width) || originalDims.width;
      const currentHeight = Number(height) || originalDims.height;
      setWidth(String(Math.round((currentWidth / originalDims.width) * 100)));
      setHeight(String(Math.round((currentHeight / originalDims.height) * 100)));
    } else {
      const currentWidthPercent = Number(width) || 100;
      const currentHeightPercent = Number(height) || 100;
      setWidth(String(Math.round((originalDims.width * currentWidthPercent) / 100)));
      setHeight(String(Math.round((originalDims.height * currentHeightPercent) / 100)));
    }

    setUnit(nextUnit);
  }

  async function handleConvert() {
    if (!selectedFile || !originalDims) return;

    const widthNum = Number(width);
    const heightNum = Number(height);

    if (!widthNum || !heightNum || widthNum <= 0 || heightNum <= 0) {
      setError("Please enter a valid width and height.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const targetWidth =
        unit === "percent" ? Math.round((originalDims.width * widthNum) / 100) : widthNum;
      const targetHeight =
        unit === "percent" ? Math.round((originalDims.height * heightNum) / 100) : heightNum;

      const result = await resizeImage(selectedFile, targetWidth, targetHeight);
      const url = URL.createObjectURL(result.blob);

      setDownloadUrl(url);
      setResultName(result.fileName);
    } catch {
      setError("Couldn't resize this file — please check the format and try again.");
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
    setWidth("");
    setHeight("");
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
      inputId="resize-image-upload"
      actionLabel="Resize Image"
      processingLabel="Resizing..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Resized Image"
      error={error}
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
      canConvert={Boolean(selectedFile && width && height)}
    >
      {selectedFile && (
        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {(["px", "percent"] as Unit[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleUnitChange(option)}
                className={cn(
                  "rounded-lg border px-4 py-1.5 text-xs font-bold transition",
                  unit === option
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-secondary hover:border-brand/50"
                )}
              >
                {option === "px" ? "Pixels" : "Percentage"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Width {unit === "percent" ? "(%)" : "(px)"}
              </label>
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                Height {unit === "percent" ? "(%)" : "(px)"}
              </label>
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <input
              type="checkbox"
              checked={lockAspectRatio}
              onChange={(e) => setLockAspectRatio(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Maintain aspect ratio
          </label>
        </div>
      )}
    </ConversionPageLayout>
  );
}