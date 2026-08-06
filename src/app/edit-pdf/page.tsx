"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Download, Check, Trash2, Upload, ChevronLeft, ChevronRight, Plus, Minus, Type } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useApp } from "@/context/AppContext";

interface Annotation {
  id: string;
  text: string;
  x: number; // % of canvas width
  y: number; // % of canvas height
  fontSize: number;
  color: string;
  page: number;
}

export default function EditPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [inputText, setInputText] = useState("Annotation Text");
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState("#e5322d");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [placingMode, setPlacingMode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const fileBufferRef = useRef<ArrayBuffer | null>(null);

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    setIsRendering(true);
    try {
      const page = await pdfDocRef.current.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const containerWidth = containerRef.current?.clientWidth ?? 700;
      const viewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth - 0) / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      setCanvasSize({ width: scaledViewport.width, height: scaledViewport.height });

      await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    } catch (err) {
      console.error("PDF render error:", err);
    } finally {
      setIsRendering(false);
    }
  }, []);

  const loadPdf = useCallback(async (file: File) => {
    setIsRendering(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      fileBufferRef.current = arrayBuffer.slice(0);

      // Dynamically import pdfjs to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
      const pdfDoc = await loadingTask.promise;
      pdfDocRef.current = pdfDoc;
      setPageCount(pdfDoc.numPages);
      setCurrentPage(1);
      setAnnotations([]);
      setDownloadUrl(null);
      await renderPage(1);
    } catch (err) {
      console.error("PDF load error:", err);
      setIsRendering(false);
    }
  }, [renderPage]);

  useEffect(() => {
    if (pdfDocRef.current && currentPage) {
      renderPage(currentPage);
    }
  }, [currentPage, renderPage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    await loadPdf(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placingMode || !overlayRef.current) return;

    const rect = overlayRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const newAnnotation: Annotation = {
      id: crypto.randomUUID(),
      text: inputText || "Annotation",
      x: xPct,
      y: yPct,
      fontSize,
      color: textColor,
      page: currentPage,
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
  };

  const removeAnnotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const saveEditedPdf = async () => {
    if (!fileBufferRef.current || !selectedFile) return;
    setIsSaving(true);

    try {
      const pdfDoc = await PDFDocument.load(fileBufferRef.current.slice(0));
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const ann of annotations) {
        const pageIndex = ann.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        const pdfX = (ann.x / 100) * width;
        const pdfY = height - (ann.y / 100) * height;

        const r = parseInt(ann.color.slice(1, 3), 16) / 255;
        const g = parseInt(ann.color.slice(3, 5), 16) / 255;
        const b = parseInt(ann.color.slice(5, 7), 16) / 255;

        page.drawText(ann.text, {
          x: Math.max(0, pdfX),
          y: Math.max(0, pdfY - ann.fontSize),
          size: ann.fontSize,
          font,
          color: rgb(r, g, b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addRecentFile({
        name: `Edited_${selectedFile.name}`,
        toolUsed: "Edit PDF",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const pageAnnotations = annotations.filter((a) => a.page === currentPage);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 border border-purple-100 dark:border-purple-900/40">
          <Pencil size={14} /> PDF Page Editor & Annotator
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Edit PDF Document</h1>
        <p className="text-xs text-slate-500 mt-2">
          Upload your PDF to see and edit each page. Enable placing mode then click anywhere to add text.
        </p>
      </div>

      {!selectedFile ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl text-center">
          <input type="file" accept=".pdf" onChange={handleFileChange} id="edit-file-input" className="hidden" />
          <label htmlFor="edit-file-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shadow-sm">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">Click to upload your PDF</p>
              <p className="text-xs text-slate-400 mt-1">All pages will be rendered in the editor below</p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center gap-3">
            {/* File info */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-1.5">
              <Pencil size={14} className="text-purple-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[150px] truncate">
                {selectedFile.name}
              </span>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Text input */}
            <div className="flex items-center gap-2">
              <Type size={14} className="text-slate-500" />
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Annotation text..."
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 w-44 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Font size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Size:</span>
              <button onClick={() => setFontSize((s) => Math.max(8, s - 2))} className="h-6 w-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600">
                <Minus size={12} />
              </button>
              <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-100">{fontSize}</span>
              <button onClick={() => setFontSize((s) => Math.min(72, s + 2))} className="h-6 w-6 rounded flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600">
                <Plus size={12} />
              </button>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Color:</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-7 w-9 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
              />
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

            {/* Place toggle */}
            <button
              onClick={() => setPlacingMode((v) => !v)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                placingMode
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
            >
              {placingMode ? "✦ Placing Mode ON — Click to Add" : "Enable Placing Mode"}
            </button>

            {/* Save button */}
            <button
              onClick={saveEditedPdf}
              disabled={annotations.length === 0 || isSaving}
              className="ml-auto px-5 py-1.5 rounded-xl bg-[#e5322d] text-white text-xs font-bold hover:bg-[#d42b26] disabled:opacity-50 transition"
            >
              {isSaving ? "Saving..." : `Save PDF (${annotations.length} edits)`}
            </button>
          </div>

          {/* Page controls */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl px-5 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isRendering}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:text-slate-900 transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isRendering ? "Rendering..." : `Page ${currentPage} of ${pageCount}`}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage >= pageCount || isRendering}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:text-slate-900 transition"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* Canvas + Annotation Overlay */}
          <div
            ref={containerRef}
            className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Actual PDF rendered canvas */}
            <canvas
              ref={canvasRef}
              className="block w-full"
              style={{ display: isRendering ? "none" : "block" }}
            />

            {isRendering && (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <div className="h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Rendering PDF page...</span>
                </div>
              </div>
            )}

            {/* Annotation overlay — same size as canvas */}
            {!isRendering && (
              <div
                ref={overlayRef}
                onClick={handleCanvasClick}
                className="absolute inset-0"
                style={{
                  cursor: placingMode ? "crosshair" : "default",
                  width: canvasSize.width || "100%",
                  height: canvasSize.height || "100%",
                }}
              >
                {pageAnnotations.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      position: "absolute",
                      left: `${ann.x}%`,
                      top: `${ann.y}%`,
                      transform: "translate(-0%, -50%)",
                      color: ann.color,
                      fontSize: `${ann.fontSize}px`,
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                    className="group flex items-center gap-1 drop-shadow-sm"
                  >
                    <span className="border border-transparent group-hover:border-purple-400 rounded px-0.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                      {ann.text}
                    </span>
                    <button
                      onClick={(e) => removeAnnotation(ann.id, e)}
                      className="opacity-0 group-hover:opacity-100 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center shrink-0 transition"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Annotations list for this page */}
          {annotations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Annotations ({annotations.length} total)
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {annotations.map((ann) => (
                  <div key={ann.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono" style={{ color: ann.color }}>
                      [Page {ann.page}] &quot;{ann.text}&quot; — {ann.fontSize}px
                    </span>
                    <button
                      onClick={(e) => removeAnnotation(ann.id, e)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download success */}
          {downloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-3">
              <Check size={32} className="text-emerald-500" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">PDF edited and saved successfully!</p>
              <a
                href={downloadUrl}
                download={`Edited_${selectedFile.name}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <Download size={15} /> Download Edited PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
