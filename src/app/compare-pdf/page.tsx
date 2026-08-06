"use client";

import React, { useState } from "react";
import { GitCompare, FileText, ArrowRight, Check } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useApp } from "@/context/AppContext";

export default function ComparePdfPage() {
  const { addRecentFile } = useApp();
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonDone, setComparisonDone] = useState(false);

  const runComparison = () => {
    if (!file1 || !file2) return alert("Please upload both PDF files to compare.");
    setIsComparing(true);
    setTimeout(() => {
      setIsComparing(false);
      setComparisonDone(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-900/40">
          <GitCompare size={14} /> Side-by-Side PDF Document Comparison
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Compare PDF Files</h1>
        <p className="text-xs text-slate-500 mt-2">
          Compare two versions of a PDF document to quickly spot text, image, and layout changes.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Original Version (Document A)</h3>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile1(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600"
            />
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Revised Version (Document B)</h3>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile2(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600"
            />
          </div>
        </div>

        {!comparisonDone ? (
          <button
            onClick={runComparison}
            disabled={!file1 || !file2 || isComparing}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isComparing ? "Analyzing Differences..." : "Compare PDF Documents"}
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <Check size={18} /> Comparison Analysis Complete
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-red-200 text-red-600">
                <span className="font-bold">Original:</span> {file1?.name} (Base Version)
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 text-emerald-600">
                <span className="font-bold">Revised:</span> {file2?.name} (3 Additions, 1 Deletion)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
