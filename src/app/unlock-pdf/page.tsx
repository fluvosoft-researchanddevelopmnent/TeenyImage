"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Unlock } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { unlockPdf } from "@/lib/pdf/unlockPdf";

export default function UnlockPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
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
    setWarning(null);
    setProgress(null);
  };

  const convert = async () => {
    if (!selectedFile || !password.trim()) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setError(null);
    setWarning(null);
    setProgress(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const { blob, method } = await unlockPdf(bytes, password, (done, total) => {
        setProgress(`Unlocking page ${done} of ${total}…`);
      });

      if (method === "raster") {
        setWarning(
          "This PDF used an encryption style we flatten for unlock. Text stays readable but is no longer selectable."
        );
      }

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_unlocked.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      setProgress(null);
      addRecentFile({
        name: outName,
        toolUsed: "Unlock PDF",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Could not unlock this PDF.";
      setError(message);
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setPassword("");
    setDownloadUrl(null);
    setError(null);
    setWarning(null);
    setProgress(null);
  };

  return (
    <ConversionPageLayout
      title="Unlock PDF"
      description="Remove PDF password security, giving you the freedom to use your PDFs as you want."
      badge="PDF Unlocker"
      icon={Unlock}
      acceptTypes=".pdf"
      inputId="unlock-pdf-input"
      actionLabel="Unlock PDF"
      processingLabel={progress || "Removing password…"}
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Unlocked PDF"
      canConvert={Boolean(selectedFile) && password.trim().length > 0}
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-bold text-text-secondary" htmlFor="unlock-password">
          PDF password
        </label>
        <input
          id="unlock-password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter the current password"
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
        />
      </div>

      {warning && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-text-primary">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>{warning}</span>
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
