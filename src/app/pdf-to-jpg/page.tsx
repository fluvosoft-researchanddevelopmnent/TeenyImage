"use client";

import React, { useState } from "react";
import { ImageIcon, Upload, Download, RefreshCw } from "lucide-react";
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
    <div className="min-h-[calc(100dvh-8rem)] w-full max-w-6xl mx-auto overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-brand mb-3 border border-red-100 sm:px-3.5 sm:text-xs">
          <ImageIcon size={14} className="shrink-0" /> <span className="truncate">PDF to JPG Converter</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl">PDF to JPG Images</h1>
        <p className="text-xs text-text-secondary mt-2 sm:text-sm">
          Renders every page of your PDF as a real high-resolution JPG image. Download individually or as a ZIP.
        </p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl space-y-5 sm:space-y-6">
        <div className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 text-center hover:border-brand transition">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setPages([]); setZipUrl(null); }}
            id="pdf-jpg-input"
            className="hidden"
          />
          <label htmlFor="pdf-jpg-input" className="cursor-pointer flex flex-col items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-brand flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-text-primary max-w-full truncate px-1">
              {selectedFile ? selectedFile.name : "Click to select PDF file"}
            </p>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              JPEG Quality: {Math.round(quality * 100)}%
            </label>
            <input type="range" min="0.5" max="1" step="0.05" value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-brand" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              Resolution Scale: {scale}× {scale === 1 ? "(72dpi)" : scale === 2 ? "(144dpi)" : "(216dpi)"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button key={s} onClick={() => setScale(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    scale === s ? "bg-red-50 border-brand text-brand" : "border-border text-text-secondary"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={renderPages}
          disabled={!selectedFile || isProcessing}
          className="w-full py-4 rounded-2xl bg-brand text-white text-sm font-bold shadow-lg hover:bg-brand-dark disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <><RefreshCw size={18} className="animate-spin" />
              {progress ? `Rendering page ${progress.done} of ${progress.total}...` : "Initializing PDF.js..."}</>
          ) : (
            <><ImageIcon size={18} /> Convert PDF to JPG</>
          )}
        </button>

        {isProcessing && progress && (
          <div className="h-2 bg-red-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        )}

        {pages.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-bold text-text-primary">
                {pages.length} page{pages.length !== 1 ? "s" : ""} rendered
              </h3>
              <button
                onClick={downloadAll}
                disabled={isZipping}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand text-white px-5 py-2 text-xs font-bold hover:bg-brand-dark disabled:opacity-50 transition sm:w-auto"
              >
                {isZipping ? <><RefreshCw size={14} className="animate-spin" /> Zipping...</> : <><Download size={14} /> Download All as ZIP</>}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pages.map((p) => (
                <div key={p.pageNum} className="group relative rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition">
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNum}`}
                    className="w-full block object-cover"
                    style={{ maxHeight: 200 }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-100 transition flex items-end justify-center pb-8 sm:bg-black/50 sm:opacity-0 sm:items-center sm:pb-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      onClick={() => downloadSingle(p)}
                      className="flex items-center gap-1 bg-surface rounded-lg px-3 py-1.5 text-xs font-bold text-text-primary hover:bg-red-50"
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
