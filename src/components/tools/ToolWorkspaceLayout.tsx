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
    <div className="min-h-[calc(100dvh-8rem)] w-full max-w-5xl mx-auto overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-brand mb-3 border border-red-100 sm:px-3.5 sm:text-xs">
          <Icon size={14} className="shrink-0" /> <span className="truncate">{category}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight sm:text-3xl break-words">{title}</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-2">{description}</p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl">
        {files.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-10 text-center hover:border-brand transition bg-background">
            <input
              type="file"
              accept={acceptedFileTypes}
              multiple={allowMultiple}
              onChange={handleFileChange}
              id="tool-file-input"
              className="hidden"
            />
            <label htmlFor="tool-file-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-red-50 text-brand flex items-center justify-center shadow-sm">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Select {allowMultiple ? "files" : "file"} or drag & drop here
                </p>
                <p className="text-xs text-text-secondary/60 mt-1">Accepted formats: {acceptedFileTypes}</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-text-secondary/60 uppercase tracking-wider">
                Selected Files ({files.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-background"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={18} className="text-brand shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-text-secondary/60">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-xs text-text-secondary/60 hover:text-brand px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {optionsContent && (
              <div className="p-4 rounded-2xl bg-background border border-border">
                {optionsContent}
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-brand bg-red-50 p-2.5 rounded-xl border border-red-100">
              <ShieldCheck size={14} className="shrink-0" />
              <span>100% Client-Side Encrypted Processing — Unlimited Free Saves & Downloads</span>
            </div>

            {!downloadUrl ? (
              <button
                onClick={executeTool}
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-brand text-white text-sm font-bold shadow-lg hover:bg-brand-dark disabled:opacity-50 transition flex items-center justify-center gap-2"
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
              <div className="p-6 rounded-2xl bg-red-50 text-center border border-red-100 space-y-4">
                <CheckCircle2 size={40} className="mx-auto text-brand" />
                <div>
                  <h3 className="text-base font-bold text-text-primary">Document Processed Successfully!</h3>
                  <p className="text-xs text-text-secondary mt-1">{resultFileName}</p>
                </div>
                <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <a
                    href={downloadUrl}
                    download={resultFileName}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-bold text-white shadow hover:bg-brand-dark transition"
                  >
                    <Download size={16} /> Download Processed PDF
                  </a>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setDownloadUrl(null);
                    }}
                    className="rounded-xl border border-border px-4 py-3 text-xs font-semibold text-text-secondary hover:bg-red-50 hover:text-brand transition"
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
