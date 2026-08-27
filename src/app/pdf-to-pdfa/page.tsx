"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, FileOutput } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { convertToPdfA } from "@/lib/pdf/convertToPdfA";

export default function PdfToPdfAPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setError(null);
    setInfo(null);
  };

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setError(null);
    setInfo(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const { blob, pageCount } = await convertToPdfA(bytes, selectedFile.name);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_pdfa.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      setInfo(
        `Converted ${pageCount} page${pageCount === 1 ? "" : "s"} to an archive-oriented PDF/A document.`
      );
      addRecentFile({
        name: outName,
        toolUsed: "PDF to PDF/A",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not convert this PDF to PDF/A.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setDownloadUrl(null);
    setError(null);
    setInfo(null);
  };

  return (
    <ConversionPageLayout
      title="PDF to PDF/A"
      description="Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future."
      badge="PDF/A Converter"
      icon={FileOutput}
      acceptTypes=".pdf"
      inputId="pdf-to-pdfa-input"
      actionLabel="Convert to PDF/A"
      processingLabel="Creating PDF/A…"
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PDF/A"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {info && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {info}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-brand">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
