"use client";

import { useState } from "react";

import { ConversionPageLayout } from "@/components/common";
import { IMAGE_TOOLS } from "@/constants";
import { convertToPng } from "@/lib/image/convertToPng";

const ACCEPT_TYPES = ".jpg,.jpeg,.webp,.gif,.bmp,.ico,.svg";

export default function ConvertToPngPage() {
  const tool = IMAGE_TOOLS.find((t) => t.href === "/convert-to-png")!;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      const { blob, fileName } = await convertToPng(selectedFile);
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setResultName(fileName);
    } catch {
      setError("Couldn't convert this file — please check the format and try again.");
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
      inputId="convert-to-png-upload"
      actionLabel="Convert to PNG"
      processingLabel="Converting..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PNG"
      error={error}
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
    />
  );
}