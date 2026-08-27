"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { convertDocxToPdf } from "@/lib/pdf/docxToPdf";

export default function WordToPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);
  };

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);

    try {
      const lower = selectedFile.name.toLowerCase();
      if (lower.endsWith(".doc") && !lower.endsWith(".docx")) {
        setWarning(
          "Legacy .doc files often fail in-browser. If conversion looks wrong, re-save as .docx in Word and try again."
        );
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const { blob, warnings } = await convertDocxToPdf(arrayBuffer);

      if (warnings.length > 0) {
        setWarning(warnings.join(" "));
      }

      const outName = selectedFile.name.replace(/\.docx?$/i, ".pdf");
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({ name: outName, toolUsed: "Word to PDF", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("Word to PDF error:", err);
      setError(
        "Could not convert this Word file. Please use a .docx file (not legacy .doc) and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);
  };

  return (
    <ConversionPageLayout
      title="Word to PDF"
      description="Converts DOC/DOCX into a PDF that keeps layout, images, tables, and clickable hyperlinks."
      badge="Word to PDF Converter"
      icon={FileText}
      acceptTypes=".docx,.doc"
      inputId="word-pdf-input"
      actionLabel="Convert Word to PDF"
      processingLabel="Rendering document & building PDF..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {warning && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50 text-text-primary text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-red-300 bg-red-50 text-brand text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
