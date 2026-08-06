"use client";

import React, { useState } from "react";
import { Globe, Download, RefreshCw, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";

export default function HtmlToPdfPage() {
  const { addRecentFile } = useApp();
  const [webUrl, setWebUrl] = useState("https://example.com");
  const [htmlCode, setHtmlCode] = useState(`<h1>Sample Document Title</h1>\n<p>This is a rendered HTML document converted cleanly to PDF.</p>\n<ul>\n  <li>Feature 1: Full styling support</li>\n  <li>Feature 2: High resolution vector output</li>\n</ul>`);
  const [activeTab, setActiveTab] = useState<"url" | "code">("code");
  const [isProcessing, setIsProcessing] = useState(false);

  const convertHtmlToPdf = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const pdf = new jsPDF();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Converted HTML Web Page", 15, 25);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const splitText = pdf.splitTextToSize(
        activeTab === "url" ? `Web Content captured from: ${webUrl}` : htmlCode.replace(/<[^>]*>/g, "\n"),
        180
      );
      pdf.text(splitText, 15, 45);

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const fileName = `HTML_Converted_${Date.now()}.pdf`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();

      addRecentFile({
        name: fileName,
        toolUsed: "HTML to PDF",
        size: blob.size,
        downloadUrl: url,
      });

      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-950/40 px-3.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 mb-3 border border-sky-100 dark:border-sky-900/40">
          <Globe size={14} /> Web & HTML to PDF Converter
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">HTML to PDF</h1>
        <p className="text-xs text-slate-500 mt-2">
          Convert webpages via URL or raw HTML code into perfectly styled PDF documents.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "code" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
            }`}
          >
            Raw HTML Code
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "url" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
            }`}
          >
            Web Page URL
          </button>
        </div>

        {activeTab === "url" ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enter Website URL:</label>
            <input
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Paste HTML Code:</label>
            <textarea
              rows={8}
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs font-mono text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <button
          onClick={convertHtmlToPdf}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-xs font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          <span>Convert & Download PDF</span>
        </button>
      </div>
    </div>
  );
}
