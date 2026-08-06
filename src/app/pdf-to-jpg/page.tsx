"use client";

import React, { useState } from "react";
import { ImageIcon, Upload, Download, Check, RefreshCw, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface RenderedPage {
  dataUrl: string;
  pageNum: number;
}

export default function PdfToJpgPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(0.95);
  const [scale, setScale] = useState<number>(2);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const renderPages = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setPages([]);
    setZipUrl(null);
    setProgress(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      const total = pdfDoc.numPages;
      setProgress({ done: 0, total });

      const rendered: RenderedPage[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx as unknown as import("pdfjs-dist/types/src/display/api").RenderParameters["canvasContext"], canvas, viewport } as any).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        rendered.push({ dataUrl, pageNum: i });
        setProgress({ done: i, total });
      }

      setPages(rendered);
    } catch (err) {
      console.error("PDF render error:", err);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  };

  const downloadAll = async () => {
    if (pages.length === 0) return;
    setIsZipping(true);

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const p of pages) {
        const base64 = p.dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        zip.file(`Page_${String(p.pageNum).padStart(3, "0")}.jpg`, base64, { base64: true });
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      setZipUrl(url);

      const name = selectedFile!.name.replace(/\.pdf$/i, "_images.zip");
      addRecentFile({ name, toolUsed: "PDF to JPG", size: blob.size, downloadUrl: url });

      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } catch (err) {
      console.error("Zip error:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const downloadSingle = (p: RenderedPage) => {
    const a = document.createElement("a");
    a.href = p.dataUrl;
    a.download = `${selectedFile!.name.replace(/\.pdf$/i, "")}_page_${p.pageNum}.jpg`;
    a.click();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3 border border-amber-100 dark:border-amber-900/40">
          <ImageIcon size={14} /> PDF to JPG Converter
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF to JPG Images</h1>
        <p className="text-xs text-slate-500 mt-2">
          Renders every page of your PDF as a real high-resolution JPG image. Download individually or as a ZIP.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* Upload */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-amber-500 transition">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setPages([]); setZipUrl(null); }}
            id="pdf-jpg-input"
            className="hidden"
          />
          <label htmlFor="pdf-jpg-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select PDF file"}
            </p>
          </label>
        </div>

        {/* Quality/Scale settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              JPEG Quality: {Math.round(quality * 100)}%
            </label>
            <input type="range" min="0.5" max="1" step="0.05" value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Resolution Scale: {scale}× {scale === 1 ? "(72dpi)" : scale === 2 ? "(144dpi)" : "(216dpi)"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button key={s} onClick={() => setScale(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    scale === s ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/40" : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Convert button */}
        <button
          onClick={renderPages}
          disabled={!selectedFile || isProcessing}
          className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <><RefreshCw size={18} className="animate-spin" />
              {progress ? `Rendering page ${progress.done} of ${progress.total}...` : "Initializing PDF.js..."}</>
          ) : (
            <><ImageIcon size={18} /> Convert PDF to JPG</>
          )}
        </button>

        {/* Progress bar */}
        {isProcessing && progress && (
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Results */}
        {pages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {pages.length} page{pages.length !== 1 ? "s" : ""} rendered
              </h3>
              <button
                onClick={downloadAll}
                disabled={isZipping}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-5 py-2 text-xs font-bold hover:bg-amber-600 disabled:opacity-50 transition"
              >
                {isZipping ? <><RefreshCw size={14} className="animate-spin" /> Zipping...</> : <><Download size={14} /> Download All as ZIP</>}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pages.map((p) => (
                <div key={p.pageNum} className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition">
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNum}`}
                    className="w-full block object-cover"
                    style={{ maxHeight: 200 }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      onClick={() => downloadSingle(p)}
                      className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
                    >
                      <Download size={13} /> Page {p.pageNum}
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                    <span className="text-white text-[10px] font-bold">Page {p.pageNum}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
