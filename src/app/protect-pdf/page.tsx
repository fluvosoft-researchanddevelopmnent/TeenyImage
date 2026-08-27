"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { protectPdf } from "@/lib/pdf/protectPdf";

export default function ProtectPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
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
    setError(null);
  };

  const passwordsMatch = password.length > 0 && password === confirm;

  const convert = async () => {
    if (!selectedFile || !passwordsMatch) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setError(null);

    try {
      const bytes = await selectedFile.arrayBuffer();
      const blob = await protectPdf(bytes, password);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_protected.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({
        name: outName,
        toolUsed: "Protect PDF",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Could not password-protect this PDF.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setPassword("");
    setConfirm("");
    setDownloadUrl(null);
    setError(null);
  };

  return (
    <ConversionPageLayout
      title="Protect PDF"
      description="Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access."
      badge="PDF Protector"
      icon={Shield}
      acceptTypes=".pdf"
      inputId="protect-pdf-input"
      actionLabel="Protect PDF"
      processingLabel="Encrypting PDF…"
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Protected PDF"
      canConvert={Boolean(selectedFile) && passwordsMatch}
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-text-secondary" htmlFor="protect-password">
            Password
          </label>
          <input
            id="protect-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-bold text-text-secondary"
            htmlFor="protect-password-confirm"
          >
            Confirm password
          </label>
          <input
            id="protect-password-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand"
          />
          {confirm.length > 0 && !passwordsMatch && (
            <p className="mt-1.5 text-[11px] font-semibold text-brand">Passwords do not match.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-brand">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
