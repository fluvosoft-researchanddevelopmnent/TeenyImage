"use client";

import React, { useEffect, useState } from "react";
import { Wand2, ShieldCheck } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import { removeBackground, type RemoveBackgroundStage } from "@/lib/image/removeBackground";

const STAGE_LABELS: Record<RemoveBackgroundStage, string> = {
  analyzing: "Analyzing image...",
  removing: "Removing background...",
  done: "Done!",
};

export default function RemoveBackgroundPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<RemoveBackgroundStage | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (file: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setStage(null);
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await removeBackground(selectedFile, { onProgress: setStage });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      // Always PNG per PRD, to preserve transparency.
      setResultName(`${base}_no_bg.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while removing the background.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setStage(null);
    handleFileChange(null);
  };

  return (
    <ConversionPageLayout
      title="Remove Background"
      description="Automatically erase the background from any photo — a clean, transparent PNG in seconds, done entirely on your device."
      badge="Remove Background Tool"
      icon={Wand2}
      acceptTypes=".jpg,.jpeg,.png,.webp"
      inputId="remove-background-input"
      actionLabel="Remove Background"
      processingLabel={stage ? STAGE_LABELS[stage] : "Processing..."}
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PNG"
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

      {isProcessing && stage && (
        <p className="text-center text-xs font-bold text-brand animate-pulse">{STAGE_LABELS[stage]}</p>
      )}

      <p className="text-center text-[11px] text-text-secondary/70">
        This tool runs fully automatically — no options needed. Larger photos may take a few extra seconds the
        first time, while the on-device model loads.
      </p>
    </ConversionPageLayout>
  );
}
