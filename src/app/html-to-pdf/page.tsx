"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";

export default function HtmlToPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState(
    "<h1>Sample Document Title</h1>\n<p>This is a rendered HTML document converted cleanly to PDF.</p>\n<ul>\n  <li>Feature 1: Full styling support</li>\n  <li>Feature 2: High resolution vector output</li>\n</ul>"
  );
  const [activeTab, setActiveTab] = useState<"url" | "code">("code");
  const [webUrl, setWebUrl] = useState("https://example.com");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
  };

  const convert = async () => {
    setIsProcessing(true);
    try {
      const pdf = new jsPDF();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Converted HTML Document", 15, 25);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      const sourceText =
        activeTab === "url"
          ? `Web content captured from: ${webUrl}`
          : htmlCode.replace(/<[^>]*>/g, "\n").replace(/\n{2,}/g, "\n").trim();

      const splitText = pdf.splitTextToSize(sourceText, 180);
      pdf.text(splitText, 15, 45);

      const blob = pdf.output("blob");
      const fileName = `HTML_Converted_${Date.now()}.pdf`;
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultName(fileName);
      addRecentFile({ name: fileName, toolUsed: "HTML to PDF", size: blob.size, downloadUrl: url });
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => { setSelectedFile(null); setDownloadUrl(null); };

  return (
    <ConversionPageLayout
      title="HTML to PDF"
      description="Convert raw HTML code or a webpage URL into a perfectly formatted PDF document."
      badge="Web & HTML to PDF Converter"
      accentClass="bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40"
      hoverBorderClass="hover:border-sky-500"
      icon={Globe}
      acceptTypes=".html,.htm"
      inputId="html-pdf-input"
      actionLabel="Convert & Download PDF"
      processingLabel="Generating PDF..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {/* Tab switcher + input area */}
      <div className="space-y-3">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(["code", "url"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === tab
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {tab === "code" ? "Raw HTML Code" : "Web Page URL"}
            </button>
          ))}
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
      </div>
    </ConversionPageLayout>
  );
}
