"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Wrench } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { repairPdf } from "@/lib/pdf/repairPdf";

export default function RepairPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
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
    setWarnings([]);
    setProgress(null);
  };

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setError(null);
    setInfo(null);
    setWarnings([]);
    setProgress(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const result = await repairPdf(bytes, (done, total) => {
        setProgress(`Repairing page ${done} of ${total}…`);
      });

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(result.blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_repaired.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      setProgress(null);
      setInfo(
        `Recovered ${result.recoveredPages} page${result.recoveredPages === 1 ? "" : "s"}${
          result.skippedPages > 0 ? ` · skipped ${result.skippedPages}` : ""
        }.`
      );
      setWarnings(result.warnings);
      addRecentFile({
        name: outName,
        toolUsed: "Repair PDF",
        size: result.blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not repair this PDF.");
      setProgress(null);
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
    setWarnings([]);
    setProgress(null);
  };

  return (
    <ConversionPageLayout
      title="Repair PDF"
      description="Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool."
      badge="PDF Repair"
      icon={Wrench}
      acceptTypes=".pdf"
      inputId="repair-pdf-input"
      actionLabel="Repair PDF"
      processingLabel={progress || "Repairing PDF…"}
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Repaired PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {info && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {info}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-text-primary">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{warnings.join(" ")}</span>
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
