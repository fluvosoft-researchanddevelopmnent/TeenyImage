"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Code2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

export interface ToolWorkspaceLayoutProps {
  /** Title of the tool (e.g. "Image to PDF") */
  title: string;
  /** Sub-description */
  description: string;
  /** Category badge text (e.g. "Convert") */
  category: string;
  /** Icon shown in the badge */
  icon: LucideIcon;
  /** Text on primary action button */
  actionButtonText?: string;
  /** Text on action button while processing */
  processingText?: string;
  /** Text on download button after success */
  downloadButtonText?: string;
  /** Title on success screen */
  successTitle?: string;
  /** Accepted file types string (e.g. ".jpg,.jpeg,.png,.webp") */
  acceptedFileTypes?: string;
  /** Whether multiple files can be uploaded and reordered */
  allowMultiple?: boolean;
  /** Controls rendered in the options section below file list */
  optionsContent?: React.ReactNode;
  /** Optional custom input mode content (e.g. raw HTML textarea for HTML to Image) */
  customInputContent?: React.ReactNode;
  /** Label for upload tab when customInputContent is provided */
  fileUploadTabLabel?: string;
  /** Label for custom input tab when customInputContent is provided */
  customInputTabLabel?: string;
  /** Controls whether execute button is enabled when in custom input mode */
  isCustomInputValid?: boolean;
  /** Async function to execute the image processing */
  onExecute: (files: File[]) => Promise<{ blob: Blob; fileName: string } | void>;
}

/**
 * Thumbnail component with automatic object URL memory cleanup
 */
function ImageItemThumbnail({ file }: { file: File }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg|bmp|ico)$/i.test(file.name)) {
      const url = URL.createObjectURL(file);
      setThumbUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setThumbUrl(null);
  }, [file]);

  if (thumbUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbUrl}
        alt={file.name}
        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border bg-surface"
      />
    );
  }

  return (
    <div className="h-10 w-10 shrink-0 rounded-lg bg-red-50 text-brand flex items-center justify-center border border-red-100">
      <FileText size={20} />
    </div>
  );
}

export function ToolWorkspaceLayout({
  title,
  description,
  category,
  icon: Icon,
  actionButtonText = "Process Image",
  processingText = "Processing Image...",
  downloadButtonText = "Download File",
  successTitle = "Processed Successfully!",
  acceptedFileTypes = ".jpg,.jpeg,.png,.webp",
  allowMultiple = false,
  optionsContent,
  customInputContent,
  fileUploadTabLabel = "Upload File",
  customInputTabLabel = "Raw Code / Direct Input",
  isCustomInputValid,
  onExecute,
}: ToolWorkspaceLayoutProps) {
  const { addRecentFile } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<"upload" | "custom">("upload");

  const appendFileInputRef = useRef<HTMLInputElement>(null);

  // Clean up download URL when changed or unmounted
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => (allowMultiple ? [...prev, ...selected] : selected));
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
      }
    }
    // reset input value so selecting the same file again triggers change
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    setFiles((prev) => {
      const next = [...prev];
      const [draggedItem] = next.splice(draggedIndex, 1);
      next.splice(dropIndex, 0, draggedItem);
      return next;
    });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const executeTool = async () => {
    const isReady = inputMode === "custom" ? (isCustomInputValid ?? true) : files.length > 0;
    if (!isReady || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await onExecute(files);
      if (res && res.blob) {
        if (downloadUrl) {
          URL.revokeObjectURL(downloadUrl);
        }
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
      console.error("Tool execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isActionEnabled =
    inputMode === "custom"
      ? (isCustomInputValid ?? true)
      : files.length > 0;

  return (
    <div className="min-h-[calc(100dvh-8rem)] w-full max-w-5xl mx-auto overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-brand mb-3 border border-red-100 sm:px-3.5 sm:text-xs">
          <Icon size={14} className="shrink-0" /> <span className="truncate">{category}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight sm:text-3xl break-words">{title}</h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-2">{description}</p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl space-y-6">
        {/* Optional Input Mode Tabs (e.g. for HTML to Image) */}
        {customInputContent && (
          <div className="flex rounded-xl bg-background p-1 border border-border">
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition",
                inputMode === "upload"
                  ? "bg-surface text-brand shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Upload size={14} />
              <span>{fileUploadTabLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("custom")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition",
                inputMode === "custom"
                  ? "bg-surface text-brand shadow-sm border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Code2 size={14} />
              <span>{customInputTabLabel}</span>
            </button>
          </div>
        )}

        {/* Custom Input Tab Content */}
        {customInputContent && inputMode === "custom" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-background border border-border">
              {customInputContent}
            </div>
          </div>
        )}

        {/* Upload Mode: Empty Dropzone */}
        {inputMode === "upload" && files.length === 0 && (
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
        )}

        {/* Upload Mode: Selected Files List with Reorder Controls */}
        {inputMode === "upload" && files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Selected Files ({files.length})
                </p>
                {allowMultiple && (
                  <span className="text-[10px] text-text-secondary/60 hidden sm:inline">
                    (Drag cards or use arrows to reorder)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {allowMultiple && (
                  <>
                    <input
                      ref={appendFileInputRef}
                      type="file"
                      accept={acceptedFileTypes}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => appendFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:text-brand hover:border-brand/40 hover:bg-red-50 transition"
                    >
                      <Plus size={13} />
                      <span>Add More</span>
                    </button>
                  </>
                )}
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-secondary/70 hover:text-brand hover:bg-red-50 transition"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}-${file.size}`}
                  draggable={allowMultiple}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border bg-background transition select-none group",
                    allowMultiple && "cursor-grab active:cursor-grabbing",
                    draggedIndex === idx && "opacity-40 border-dashed border-brand bg-red-50/50"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {allowMultiple && (
                      <div className="flex items-center gap-1 text-text-secondary/40 group-hover:text-text-secondary/70 transition shrink-0">
                        <GripVertical size={14} />
                        <span className="text-[10px] font-bold w-4 text-center">#{idx + 1}</span>
                      </div>
                    )}
                    <ImageItemThumbnail file={file} />
                    <div className="min-w-0 flex-1 pr-1">
                      <p className="text-xs font-semibold text-text-primary truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-text-secondary/60 mt-0.5">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {allowMultiple && files.length > 1 && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveUp(idx)}
                          disabled={idx === 0}
                          title="Move Up"
                          aria-label="Move Up"
                          className="p-1 rounded text-text-secondary/60 hover:text-brand hover:bg-red-50 disabled:opacity-20 disabled:hover:bg-transparent transition"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(idx)}
                          disabled={idx === files.length - 1}
                          title="Move Down"
                          aria-label="Move Down"
                          className="p-1 rounded text-text-secondary/60 hover:text-brand hover:bg-red-50 disabled:opacity-20 disabled:hover:bg-transparent transition"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      title="Remove File"
                      aria-label="Remove File"
                      className="p-1.5 rounded-lg text-text-secondary/50 hover:text-brand hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options Content slot (e.g. Page Size, Margin, Orientation) */}
        {optionsContent && (
          <div className="p-4 rounded-2xl bg-background border border-border">
            {optionsContent}
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-[11px] text-brand bg-red-50 p-2.5 rounded-xl border border-red-100">
          <ShieldCheck size={14} className="shrink-0" />
          <span>100% Client-Side Processing — Your files never leave your device</span>
        </div>

        {/* Action Button & Success State */}
        {!downloadUrl ? (
          <button
            type="button"
            onClick={executeTool}
            disabled={!isActionEnabled || isProcessing}
            className="w-full py-4 rounded-2xl bg-brand text-white text-sm font-bold shadow-lg hover:bg-brand-dark disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>{processingText}</span>
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
              <h3 className="text-base font-bold text-text-primary">{successTitle}</h3>
              <p className="text-xs text-text-secondary mt-1 break-all">{resultFileName}</p>
            </div>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={downloadUrl}
                download={resultFileName}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-bold text-white shadow hover:bg-brand-dark transition"
              >
                <Download size={16} /> {downloadButtonText}
              </a>
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  if (downloadUrl) {
                    URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                  }
                }}
                className="rounded-xl border border-border px-4 py-3 text-xs font-semibold text-text-secondary hover:bg-red-50 hover:text-brand transition"
              >
                Process Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
