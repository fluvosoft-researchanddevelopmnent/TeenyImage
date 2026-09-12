"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, RefreshCw, Download, Check, ShieldCheck, FileText, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/image";
import { useApp } from "@/context/AppContext";
import type { LucideIcon } from "lucide-react";

export interface ConversionPageLayoutProps {
  /** Page heading */
  title: string;
  /** Sub-description below heading */
  description: string;
  /** Small badge label (e.g. "Image Compressor", "Format Converter") */
  badge: string;
  /** Icon shown in the badge and upload box */
  icon: LucideIcon;
  /** File input accept attribute value, e.g. ".jpg,.png,.webp" */
  acceptTypes: string;
  /** Unique id for the hidden <input type="file"> */
  inputId: string;
  /** Text shown on the convert button when idle */
  actionLabel: string;
  /** Text shown on the button while converting */
  processingLabel: string;
  /** Currently selected file (null = none) */
  selectedFile: File | null;
  /** Whether conversion is running */
  isProcessing: boolean;
  /** Object URL for the result blob, or null before conversion */
  downloadUrl: string | null;
  /** Display name of the result file */
  resultName: string;
  /** Download button label, e.g. "Download Image", "Download PNG" */
  downloadLabel: string;
  /** Custom success title (default "Converted Successfully!") */
  successTitle?: string;
  /** Optional error message to display */
  error?: string | null;
  /** Called when the user picks a file */
  onFileChange: (file: File | null) => void;
  /** Called when the user clicks Convert */
  onConvert: () => void;
  /** Called when the user clicks "Convert Another" */
  onReset: () => void;
  /**
   * When set, controls whether Convert is enabled.
   * Defaults to requiring a selected file (`!!selectedFile`).
   */
  canConvert?: boolean;
  /** Optional extra controls rendered between the drop-zone and the convert button */
  children?: React.ReactNode;
}

/**
 * Shared shell for all single-file conversion pages.
 * Handles: page header, file drop-zone (with drag & drop), optional options slot,
 * convert button (with spinner), and success/download panel with memory safety.
 */
export function ConversionPageLayout({
  title,
  description,
  badge,
  icon: Icon,
  acceptTypes,
  inputId,
  actionLabel,
  processingLabel,
  selectedFile,
  isProcessing,
  downloadUrl,
  resultName,
  downloadLabel,
  successTitle = "Converted Successfully!",
  error,
  onFileChange,
  onConvert,
  onReset,
  canConvert,
  children,
}: ConversionPageLayoutProps) {
  const { addRecentFile } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const recordedDownloadUrlRef = useRef<string | null>(null);

  // Manage image preview with memory cleanup
  useEffect(() => {
    let active = true;
    if (selectedFile && (selectedFile.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg|bmp|ico)$/i.test(selectedFile.name))) {
      const url = URL.createObjectURL(selectedFile);
      queueMicrotask(() => {
        if (active) setPreviewUrl(url);
      });
      return () => {
        active = false;
        URL.revokeObjectURL(url);
      };
    }
    queueMicrotask(() => {
      if (active) setPreviewUrl(null);
    });
  }, [selectedFile]);

  // Clean up download URL when changed or unmounted
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Record to recent files when conversion completes
  useEffect(() => {
    if (downloadUrl && resultName && recordedDownloadUrlRef.current !== downloadUrl) {
      recordedDownloadUrlRef.current = downloadUrl;
      addRecentFile({
        name: resultName,
        toolUsed: title,
        size: selectedFile?.size || 0,
        downloadUrl,
      });
    } else if (!downloadUrl) {
      recordedDownloadUrlRef.current = null;
    }
  }, [downloadUrl, resultName, title, selectedFile?.size, addRecentFile]);

  const isConvertEnabled = canConvert ?? Boolean(selectedFile);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8 max-w-4xl mx-auto w-full overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold mb-3 border bg-red-50 text-brand border-red-100 sm:px-3.5 sm:text-xs">
          <Icon size={14} className="shrink-0" />
          <span className="truncate">{badge}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl break-words">{title}</h1>
        <p className="text-xs text-text-secondary mt-2 sm:text-sm">{description}</p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl space-y-5 sm:space-y-6">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition bg-background",
              isDragging
                ? "border-brand bg-red-50/50 scale-[0.99]"
                : "border-border hover:border-brand"
            )}
          >
            <input
              type="file"
              accept={acceptTypes}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              id={inputId}
              className="hidden"
            />
            <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-red-50 text-brand shadow-sm">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-text-primary max-w-full truncate px-1">
                Click to select a file or drag & drop here
              </p>
              <p className="text-xs text-text-secondary/60">
                {acceptTypes.replace(/\./g, "").toUpperCase()} files accepted
              </p>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl border border-border bg-background">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={selectedFile.name}
                  className="h-12 w-12 rounded-xl object-cover border border-border shrink-0 bg-surface"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-red-50 text-brand flex items-center justify-center shrink-0 border border-red-100">
                  <FileText size={24} />
                </div>
              )}
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs sm:text-sm font-bold text-text-primary truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-text-secondary/60 mt-0.5">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFileChange(null)}
              className="p-2 rounded-xl text-text-secondary/60 hover:text-brand hover:bg-red-50 transition"
              title="Remove File"
              aria-label="Remove File"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tool-specific Options */}
        {children}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="shrink-0 text-brand" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Privacy Label */}
        <div className="flex items-center gap-2 text-[11px] text-brand bg-red-50 p-2.5 rounded-xl border border-red-100">
          <ShieldCheck size={14} className="shrink-0" />
          <span>100% Client-Side Processing — Your files never leave your device</span>
        </div>

        {/* Action Button / Success State */}
        {!downloadUrl ? (
          <button
            type="button"
            onClick={onConvert}
            disabled={!isConvertEnabled || isProcessing}
            className="w-full py-4 rounded-2xl bg-brand text-white text-sm font-bold shadow-lg hover:bg-brand-dark disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                {processingLabel}
              </>
            ) : (
              <>
                <Icon size={18} />
                {actionLabel}
              </>
            )}
          </button>
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-red-50 text-center border border-red-100 space-y-3">
            <Check size={36} className="mx-auto text-brand" />
            <h3 className="text-base font-bold text-text-primary">{successTitle}</h3>
            <p className="text-xs text-text-secondary break-all px-1">{resultName}</p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center pt-2">
              <a
                href={downloadUrl}
                download={resultName}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-dark transition"
              >
                <Download size={15} />
                {downloadLabel}
              </a>
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-red-50 hover:text-brand transition"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
