"use client";

import React from "react";
import { Upload, RefreshCw, Download, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ConversionPageLayoutProps {
  /** Page heading */
  title: string;
  /** Sub-description below heading */
  description: string;
  /** Small badge label (e.g. "PDF to Word Converter") */
  badge: string;
  /** Icon shown in the badge and upload box */
  icon: LucideIcon;
  /** File input accept attribute value, e.g. ".pdf" or ".pptx,.ppt" */
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
  /** Download button label, e.g. "Download DOCX" */
  downloadLabel: string;
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
 * Handles: page header, file drop-zone, optional options slot,
 * convert button (with spinner), and success/download panel.
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
  onFileChange,
  onConvert,
  onReset,
  canConvert,
  children,
}: ConversionPageLayoutProps) {
  const isConvertEnabled = canConvert ?? Boolean(selectedFile);

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8 max-w-4xl mx-auto w-full overflow-x-hidden">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold mb-3 border bg-red-50 text-brand border-red-100 sm:px-3.5 sm:text-xs">
          <Icon size={14} className="shrink-0" />
          <span className="truncate">{badge}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl break-words">{title}</h1>
        <p className="text-xs text-text-secondary mt-2 sm:text-sm">{description}</p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl space-y-5 sm:space-y-6">
        <div className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 text-center hover:border-brand transition">
          <input
            type="file"
            accept={acceptTypes}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            id={inputId}
            className="hidden"
          />
          <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-red-50 text-brand">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-text-primary max-w-full truncate px-1">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </p>
            <p className="text-xs text-text-secondary/60">
              {acceptTypes.replace(/\./g, "").toUpperCase()} files accepted
            </p>
          </label>
        </div>

        {children}

        {!downloadUrl ? (
          <button
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
          <div className="p-4 sm:p-6 rounded-2xl bg-red-50 text-center border border-red-100 space-y-3">
            <Check size={36} className="mx-auto text-brand" />
            <h3 className="text-base font-bold text-text-primary">Converted Successfully!</h3>
            <p className="text-xs text-text-secondary break-all px-1">{resultName}</p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={downloadUrl}
                download={resultName}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-dark transition"
              >
                <Download size={15} />
                {downloadLabel}
              </a>
              <button
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
