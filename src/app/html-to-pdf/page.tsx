"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Globe, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { convertHtmlStringToPdf } from "@/lib/pdf/htmlToPdf";

type InputMode = "file" | "code";

export default function HtmlToPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState(
    "<h1>Sample Document Title</h1>\n<p>This is a rendered HTML document converted cleanly to PDF.</p>\n<ul>\n  <li>Feature 1: Full styling support</li>\n  <li>Feature 2: High resolution vector output</li>\n</ul>"
  );
  const [activeTab, setActiveTab] = useState<InputMode>("code");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const canConvert = useMemo(() => {
    if (activeTab === "code") return htmlCode.trim().length > 0;
    return Boolean(selectedFile);
  }, [activeTab, htmlCode, selectedFile]);

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);
    if (file) {
      setActiveTab("file");
      try {
        const text = await file.text();
        setHtmlCode(text);
      } catch {
        // keep previous code; convert will read the file again
      }
    }
  };

  const convert = async () => {
    setIsProcessing(true);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);

    try {
      let html = "";

      if (activeTab === "file") {
        if (!selectedFile) {
          setError("Select an HTML file first.");
          return;
        }
        html = await selectedFile.text();
      } else {
        html = htmlCode;
      }

      const { blob, warnings } = await convertHtmlStringToPdf(html);
      if (warnings.length > 0) setWarning(warnings.join(" "));

      const outName =
        activeTab === "file" && selectedFile
          ? selectedFile.name.replace(/\.html?$/i, ".pdf")
          : `HTML_Converted_${Date.now()}.pdf`;

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({ name: outName, toolUsed: "HTML to PDF", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("HTML to PDF error:", err);
      setError("Something went wrong generating the PDF. Check your HTML and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setSelectedFile(null);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);
  };

  return (
    <ConversionPageLayout
      title="HTML to PDF"
      description="Convert raw HTML code or an uploaded .html file into a formatted PDF."
      badge="HTML to PDF Converter"
      icon={Globe}
      acceptTypes=".html,.htm"
      inputId="html-pdf-input"
      actionLabel="Convert & Download PDF"
      processingLabel="Rendering HTML & building PDF..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PDF"
      canConvert={canConvert}
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div className="space-y-3">
        <div className="flex rounded-xl bg-background p-1 border border-border">
          {(
            [
              { id: "code", label: "Raw HTML Code" },
              { id: "file", label: "Uploaded File" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setDownloadUrl(null);
                setError(null);
              }}
              className={`min-w-0 flex-1 py-2 px-1 text-[11px] font-bold rounded-lg transition sm:text-xs ${
                activeTab === tab.id
                  ? "bg-surface text-text-primary shadow-sm border border-border"
                  : "text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "code" ? (
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1">Paste HTML Code:</label>
            <textarea
              rows={8}
              value={htmlCode}
              onChange={(e) => {
                setHtmlCode(e.target.value);
                setDownloadUrl(null);
                setError(null);
              }}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        ) : (
          <p className="text-xs text-text-secondary">
            {selectedFile
              ? `Ready to convert: ${selectedFile.name}`
              : "Use the upload area above to select an .html / .htm file."}
          </p>
        )}
      </div>

      {warning && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50 text-text-primary text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-red-300 bg-red-50 text-brand text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
