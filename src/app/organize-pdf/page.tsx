"use client";

import React, { useState } from "react";
import { LayoutGrid, RotateCw, Trash2, ArrowRightLeft, Download, Check } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { useApp } from "@/context/AppContext";

export default function OrganizePdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ id: number; pageNum: number; rotation: number }[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const total = pdfDoc.getPageCount();

    const pageItems = Array.from({ length: total }, (_, i) => ({
      id: i + 1,
      pageNum: i + 1,
      rotation: 0,
    }));
    setPages(pageItems);
    setDownloadUrl(null);
  };

  const rotatePage = (id: number) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const deletePage = (id: number) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const movePage = (index: number, direction: "left" | "right") => {
    const newPages = [...pages];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < newPages.length) {
      const temp = newPages[index];
      newPages[index] = newPages[targetIdx];
      newPages[targetIdx] = temp;
      setPages(newPages);
    }
  };

  const saveOrganizedPdf = async () => {
    if (!selectedFile || pages.length === 0) return;

    const arrayBuffer = await selectedFile.arrayBuffer();
    const srcPdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    for (const p of pages) {
      const [copiedPage] = await newPdf.copyPages(srcPdf, [p.pageNum - 1]);
      if (p.rotation > 0) {
        copiedPage.setRotation(degrees(p.rotation));
      }
      newPdf.addPage(copiedPage);
    }

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    addRecentFile({
      name: `Organized_${selectedFile.name}`,
      toolUsed: "Organize PDF",
      size: blob.size,
      downloadUrl: url,
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-950/40 px-3.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 mb-3 border border-red-100 dark:border-red-900/40">
          <LayoutGrid size={14} /> Reorder, Sort, Rotate & Delete Pages
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Organize PDF Pages</h1>
        <p className="text-xs text-slate-500 mt-2">
          Visual drag-and-drop page manager to sort, rotate, or remove unwanted pages.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {!selectedFile ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-red-500 transition">
            <input type="file" accept=".pdf" onChange={handleFileSelect} id="org-file-input" className="hidden" />
            <label htmlFor="org-file-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                <LayoutGrid size={28} />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Upload PDF to Organize Pages</p>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Document: {selectedFile.name} ({pages.length} Pages)</span>
              <button onClick={() => setSelectedFile(null)} className="text-xs text-red-500 hover:underline">Change File</button>
            </div>

            {/* Page Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-2 border rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              {pages.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm flex flex-col items-center group"
                >
                  <div
                    className="h-28 w-20 bg-slate-100 dark:bg-slate-700 rounded-lg border flex items-center justify-center font-bold text-slate-400 text-sm mb-2 transition-transform"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  >
                    P{p.pageNum}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Page {idx + 1}</span>

                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      onClick={() => movePage(idx, "left")}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Left"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => rotatePage(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title="Rotate CW"
                    >
                      <RotateCw size={13} />
                    </button>
                    <button
                      onClick={() => deletePage(p.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title="Delete Page"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => movePage(idx, "right")}
                      disabled={idx === pages.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      title="Move Right"
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!downloadUrl ? (
              <button
                onClick={saveOrganizedPdf}
                disabled={pages.length === 0}
                className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-xs font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition"
              >
                Save Organized PDF ({pages.length} Pages)
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200">
                <Check size={36} className="mx-auto text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">Organized PDF Ready!</h3>
                <a
                  href={downloadUrl}
                  download={`Organized_${selectedFile.name}`}
                  className="mt-3 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
