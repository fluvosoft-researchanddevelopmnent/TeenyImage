"use client";

import React, { useState } from "react";
import { Upload, FileText, Download, ShieldCheck, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { LucideIcon } from "lucide-react";

interface ToolWorkspaceLayoutProps {
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  actionButtonText: string;
  acceptedFileTypes?: string;
  allowMultiple?: boolean;
  optionsContent?: React.ReactNode;
  onExecute: (files: File[]) => Promise<{ blob: Blob; fileName: string } | void>;
}

export function ToolWorkspaceLayout({
  title,
  description,
  category,
  icon: Icon,
  actionButtonText,
  acceptedFileTypes = ".pdf",
  allowMultiple = false,
  optionsContent,
  onExecute,
}: ToolWorkspaceLayoutProps) {
  const { addRecentFile } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => (allowMultiple ? [...prev, ...selected] : selected));
      setDownloadUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDownloadUrl(null);
  };

  const executeTool = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const res = await onExecute(files);
      if (res) {
        const url = URL.createObjectURL(res.blob);
        setDownloadUrl(url);
        setResultFileName(res.fileName);
        addRecentFile({
          name: res.fileName,
          toolUsed: title,
          size: res.blob.size,
          downloadUrl: url,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Tool Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <Icon size={14} /> {category}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">{description}</p>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        {/* Upload Zone */}
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-red-500 transition bg-slate-50/50 dark:bg-slate-800/40">
            <input
              type="file"
              accept={acceptedFileTypes}
              multiple={allowMultiple}
              onChange={handleFileChange}
              id="tool-file-input"
              className="hidden"
            />
            <label htmlFor="tool-file-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shadow-sm">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Select {allowMultiple ? "files" : "file"} or drag & drop here
                </p>
                <p className="text-xs text-slate-400 mt-1">Accepted formats: {acceptedFileTypes}</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected File List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Selected Files ({files.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={18} className="text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-xs text-slate-400 hover:text-red-500 px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Options configuration if provided */}
            {optionsContent && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                {optionsContent}
              </div>
            )}

            {/* Privacy Guarantee Notice */}
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <ShieldCheck size={14} className="shrink-0" />
              <span>100% Client-Side Encrypted Processing — Unlimited Free Saves & Downloads</span>
            </div>

            {/* Execute Button or Download Screen */}
            {!downloadUrl ? (
              <button
                onClick={executeTool}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{actionButtonText}</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-900/50 space-y-4">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Document Processed Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-1">{resultFileName}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <a
                    href={downloadUrl}
                    download={resultFileName}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <Download size={16} /> Download Processed PDF
                  </a>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setDownloadUrl(null);
                    }}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Process Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
