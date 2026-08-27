"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Minimize2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import {
  compressPdf,
  compressLevelLabel,
  type CompressLevel,
} from "@/lib/pdf/compressPdf";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    original: number;
    compressed: number;
    pages: number;
  } | null>(null);
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
    setStats(null);
    setProgress(null);
  };

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setError(null);
    setStats(null);
    setProgress(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const result = await compressPdf(bytes, level, (done, total) => {
        setProgress(`Compressing page ${done} of ${total}…`);
      });

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(result.blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_compressed.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      setStats({
        original: result.originalBytes,
        compressed: result.compressedBytes,
        pages: result.pageCount,
      });
      setProgress(null);
      addRecentFile({
        name: outName,
        toolUsed: "Compress PDF",
        size: result.blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      setError(
        "Could not compress this PDF. If it is password-protected, unlock it first and try again."
      );
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
    setStats(null);
    setProgress(null);
  };

  const savedPct =
    stats && stats.original > 0
      ? Math.max(0, Math.round((1 - stats.compressed / stats.original) * 100))
      : null;

  return (
    <ConversionPageLayout
      title="Compress PDF"
      description="Reduce file size while optimizing for maximal PDF quality."
      badge="PDF Compressor"
      icon={Minimize2}
      acceptTypes=".pdf"
      inputId="compress-pdf-input"
      actionLabel="Compress PDF"
      processingLabel={progress || "Compressing PDF…"}
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Compressed PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
          Compression level
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { id: "low" as const, title: "Strong", hint: "Smallest file" },
              { id: "medium" as const, title: "Recommended", hint: compressLevelLabel("medium") },
              { id: "high" as const, title: "High quality", hint: "Larger file" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLevel(opt.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                level === opt.id
                  ? "border-brand bg-red-50"
                  : "border-border bg-surface hover:bg-background"
              }`}
            >
              <span className="block text-sm font-bold text-text-primary">{opt.title}</span>
              <span className="block text-[11px] text-text-secondary">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {stats && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {stats.pages} page{stats.pages === 1 ? "" : "s"} · {formatBytes(stats.original)} →{" "}
          {formatBytes(stats.compressed)}
          {savedPct !== null ? ` (${savedPct}% smaller)` : ""}
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
