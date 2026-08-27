"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Hash } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import {
  addPageNumbers,
  type PageNumberPosition,
} from "@/lib/pdf/addPageNumbers";

const POSITIONS: { id: PageNumberPosition; label: string }[] = [
  { id: "bottom-center", label: "Bottom center" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "bottom-right", label: "Bottom right" },
  { id: "top-center", label: "Top center" },
  { id: "top-left", label: "Top left" },
  { id: "top-right", label: "Top right" },
];

export default function PageNumbersPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [position, setPosition] = useState<PageNumberPosition>("bottom-center");
  const [fontSize, setFontSize] = useState(12);
  const [startFrom, setStartFrom] = useState(1);
  const [format, setFormat] = useState("{n}");
  const [color, setColor] = useState("#111111");
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
      const { blob, pageCount } = await addPageNumbers(bytes, {
        position,
        fontSize,
        startFrom,
        format,
        color,
      });

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const outName = selectedFile.name.replace(/\.pdf$/i, "") + "_numbered.pdf";
      setDownloadUrl(url);
      setResultName(outName);
      setInfo(`Added page numbers to ${pageCount} page${pageCount === 1 ? "" : "s"}.`);
      addRecentFile({
        name: outName,
        toolUsed: "Page numbers",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not add page numbers.");
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
      title="Page numbers"
      description="Add page numbers into PDFs with ease. Choose your positions, dimensions, typography."
      badge="Page Numbers"
      icon={Hash}
      acceptTypes=".pdf"
      inputId="page-numbers-input"
      actionLabel="Add page numbers"
      processingLabel="Adding page numbers…"
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Numbered PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
            Position
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPosition(p.id)}
                className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                  position === p.id
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-primary hover:bg-background"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-bold text-text-secondary">
            Font size
            <input
              type="number"
              min={8}
              max={48}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value) || 12)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-brand"
            />
          </label>
          <label className="block text-xs font-bold text-text-secondary">
            Start from
            <input
              type="number"
              min={0}
              value={startFrom}
              onChange={(e) => setStartFrom(Number(e.target.value) || 1)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-brand"
            />
          </label>
          <label className="block text-xs font-bold text-text-secondary sm:col-span-2">
            Format
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-text-primary outline-none focus:border-brand"
            >
              <option value="{n}">1, 2, 3…</option>
              <option value="Page {n}">Page 1, Page 2…</option>
              <option value="{n} / {total}">1 / 10, 2 / 10…</option>
              <option value="Page {n} of {total}">Page 1 of 10…</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-text-secondary">
            Color
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
          </label>
        </div>
      </div>

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
