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
  /** Tailwind colour classes for the badge + upload icon bg/text, e.g. "bg-blue-50 text-blue-600" */
  accentClass: string;
  /** Tailwind border hover colour class for the drop-zone, e.g. "hover:border-blue-500" */
  hoverBorderClass: string;
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
  /** Optional extra controls rendered between the drop-zone and the convert button (e.g. format picker) */
  children?: React.ReactNode;
}

/**
 * Shared shell for all single-file conversion pages.
 * Handles: page header, file drop-zone, optional options slot,
 * convert button (with spinner), and success/download panel.
 *
 * The parent page only needs to own the conversion logic and state.
 */
export function ConversionPageLayout({
  title,
  description,
  badge,
  accentClass,
  hoverBorderClass,
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
  children,
}: ConversionPageLayoutProps) {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold mb-3 border ${accentClass} border-opacity-40`}
        >
          <Icon size={14} />
          {badge}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      </div>

      {/* ── Main card ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">

        {/* Drop-zone */}
        <div
          className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center ${hoverBorderClass} transition`}
        >
          <input
            type="file"
            accept={acceptTypes}
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            id={inputId}
            className="hidden"
          />
          <label htmlFor={inputId} className="cursor-pointer flex flex-col items-center gap-3">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${accentClass}`}>
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select a file"}
            </p>
            <p className="text-xs text-slate-400">{acceptTypes.replace(/\./g, "").toUpperCase()} files accepted</p>
          </label>
        </div>

        {/* Optional extra controls (format picker, quality slider, etc.) */}
        {children}

        {/* Convert / Download */}
        {!downloadUrl ? (
          <button
            onClick={onConvert}
            disabled={!selectedFile || isProcessing}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
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
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 space-y-3">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Converted Successfully!</h3>
            <p className="text-xs text-slate-500">{resultName}</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href={downloadUrl}
                download={resultName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <Download size={15} />
                {downloadLabel}
              </a>
              <button
                onClick={onReset}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
