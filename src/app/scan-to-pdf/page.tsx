"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, Check, FileText, Plus, RefreshCw, Trash2, Download, ScanLine } from "lucide-react";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";

export default function ScanToPdfPage() {
  const { addRecentFile } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedPages, setScannedPages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [filterMode, setFilterMode] = useState<"normal" | "document" | "bw">("document");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch {
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Draw video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply document contrast / b&w enhancement filter if selected
    if (filterMode === "document" || filterMode === "bw") {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (filterMode === "bw") {
          const bw = avg > 120 ? 255 : 0;
          data[i] = bw;
          data[i + 1] = bw;
          data[i + 2] = bw;
        } else {
          // Document high contrast boost
          data[i] = avg > 110 ? Math.min(255, avg * 1.15) : Math.max(0, avg * 0.85);
          data[i + 1] = data[i];
          data[i + 2] = data[i];
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setScannedPages((prev) => [...prev, dataUrl]);
  };

  const deletePage = (index: number) => {
    setScannedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const generatePdf = () => {
    if (scannedPages.length === 0) return;

    const pdf = new jsPDF("portrait", "px", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    scannedPages.forEach((pageDataUrl, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.addImage(pageDataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);
    });

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    const fileName = `Scanned_Doc_${Date.now()}.pdf`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    addRecentFile({
      name: fileName,
      toolUsed: "Scan to PDF",
      size: blob.size,
      downloadUrl: url,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-900/40">
          <ScanLine size={14} /> Camera Document Scanner & Multi-Page PDF Capture
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Scan to PDF</h1>
        <p className="text-xs text-slate-500 mt-2">
          Capture documents directly from your device camera with document contrast enhancement and save multi-page PDFs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Camera Feed Container */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col items-center">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
            {isCameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                {/* Edge alignment guidelines box */}
                <div className="absolute inset-8 border-2 border-dashed border-red-500/70 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Align Document Within Frame
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 p-6">
                <Camera size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-semibold">Camera Stream Offline / Permission Needed</p>
                <button
                  onClick={startCamera}
                  className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-600 transition"
                >
                  Start Camera
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {/* Filter options */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Scan Preset:</span>
            {(["normal", "document", "bw"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition ${
                  filterMode === mode
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {mode === "bw" ? "B&W Text" : mode}
              </button>
            ))}
          </div>

          {/* Capture Trigger */}
          <button
            onClick={capturePage}
            disabled={!isCameraActive}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-[#e5322d] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition"
          >
            <Camera size={18} /> Capture Page ({scannedPages.length})
          </button>
        </div>

        {/* Scanned Thumbnails & Export Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col h-full min-h-[420px]">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Captured Pages ({scannedPages.length})</span>
            {scannedPages.length > 0 && (
              <button
                onClick={() => setScannedPages([])}
                className="text-xs text-red-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </h3>

          {scannedPages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
              <FileText size={36} className="mb-2 opacity-40" />
              <p className="text-xs">No pages captured yet.</p>
              <p className="text-[11px] opacity-70 mt-1">Tap 'Capture Page' to add pages to your PDF document.</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {scannedPages.map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <img src={page} alt={`Page ${idx + 1}`} className="h-16 w-12 object-cover rounded-lg border border-slate-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Page {idx + 1}</p>
                    <p className="text-[10px] text-slate-400">Scan Filter: {filterMode}</p>
                  </div>
                  <button
                    onClick={() => deletePage(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={generatePdf}
            disabled={scannedPages.length === 0}
            className="mt-6 w-full py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <Download size={16} /> Save & Download Single PDF ({scannedPages.length} Pages)
          </button>
        </div>
      </div>
    </div>
  );
}
