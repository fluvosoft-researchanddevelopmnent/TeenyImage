"use client";

import React, { useEffect, useState } from "react";
import { FlipHorizontal, FlipVertical, ShieldCheck } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import { flipImage, type FlipDirection } from "@/lib/image/flipImage";

export default function FlipImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [direction, setDirection] = useState<FlipDirection>("horizontal");

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (file: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await flipImage(selectedFile, direction);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const ext = selectedFile.name.split(".").pop() || "png";
      setResultName(`${base}_flipped.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while flipping this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    handleFileChange(null);
  };

  return (
    <ConversionPageLayout
      title="Flip Image"
      description="Mirror your image horizontally or vertically in one click. Processed entirely in your browser."
      badge="Flip Image Tool"
      icon={FlipHorizontal}
      acceptTypes=".jpg,.jpeg,.png,.gif,.webp"
      inputId="flip-image-input"
      actionLabel="Flip Image"
      processingLabel="Flipping..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Flipped Image"
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
    >
      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] font-semibold text-brand">
        <ShieldCheck size={14} className="shrink-0" />
        100% Client-Side Processing — Your files never leave your device
      </div>

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {selectedFile && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDirection("horizontal")}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-bold transition ${
                direction === "horizontal"
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
              }`}
            >
              <FlipHorizontal size={22} />
              Flip Horizontal
            </button>
            <button
              type="button"
              onClick={() => setDirection("vertical")}
              className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-bold transition ${
                direction === "vertical"
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
              }`}
            >
              <FlipVertical size={22} />
              Flip Vertical
            </button>
          </div>

          {previewUrl && (
            <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-border bg-black/5 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview of the selected image with the current flip applied"
                className="mx-auto max-h-64 w-auto"
                style={{
                  transform: direction === "horizontal" ? "scaleX(-1)" : "scaleY(-1)",
                }}
              />
            </div>
          )}
        </div>
      )}
    </ConversionPageLayout>
  );
}
