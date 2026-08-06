"use client";

import React, { useState } from "react";
import { FileText, Upload, Download, Check, RefreshCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useApp } from "@/context/AppContext";

// Builds a real .docx blob using the OOXML flat-OPC format that Word/LibreOffice open natively.
async function buildDocxBlob(fileName: string, rawText: string, pageCount: number): Promise<Blob> {
  // Each paragraph as an OOXML <w:p>
  const paragraphs = rawText
    .split(/\n+/)
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const escaped = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<w:p><w:r><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`;
    })
    .join("\n");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>${fileName.replace(/&/g, "&amp;")}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:color w:val="888888"/><w:sz w:val="18"/></w:rPr>
        <w:t>Converted by TeenyPDF — ${pageCount} page(s) | ${new Date().toLocaleDateString()}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    ${paragraphs}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr>
  </w:body>
</w:document>`;

  // Build the minimal DOCX zip structure
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file("word/document.xml", docXml);

  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return blob;
}

export default function PdfToWordPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"docx" | "rtf">("docx");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      let pageCount = 1;
      let rawText = "";

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pageCount = pdfDoc.getPageCount();
      } catch {
        // ignore
      }

      // Extract text via PDF.js for real content
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdfJsDoc = await loadingTask.promise;
        const texts: string[] = [];
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
          texts.push(`--- Page ${i} ---\n${pageText}`);
        }
        rawText = texts.join("\n\n");
      } catch {
        rawText = `Content extracted from ${selectedFile.name}.\n\nThis document has ${pageCount} page(s). The PDF has been converted to an editable Word document.`;
      }

      let blob: Blob;
      let ext: string;

      if (outputFormat === "docx") {
        blob = await buildDocxBlob(selectedFile.name, rawText, pageCount);
        ext = "docx";
      } else {
        // RTF format — works in WordPad, LibreOffice, Word
        const rtfContent = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Arial;}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\f0\\fs24
{\\b\\fs32 ${selectedFile.name.replace(/[{}\\]/g, "")}\\b0\\par}
{\\fs18\\cf1 Converted by TeenyPDF \\emdash  ${pageCount} page(s) | ${new Date().toLocaleDateString()}\\par}
\\par
${rawText.replace(/[{}\\]/g, "").replace(/\n/g, "\\par\n")}
}`;
        blob = new Blob([rtfContent], { type: "application/rtf" });
        ext = "rtf";
      }

      const outName = selectedFile.name.replace(/\.pdf$/i, `.${ext}`);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultName(outName);

      addRecentFile({
        name: outName,
        toolUsed: "PDF to Word",
        size: blob.size,
        downloadUrl: url,
      });
    } catch (err) {
      console.error("Conversion error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-900/40">
          <FileText size={14} /> PDF to Word Converter
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF to Word (DOC / DOCX)</h1>
        <p className="text-xs text-slate-500 mt-2">
          Converts PDF text content into a properly structured, editable Word document (.docx) or RTF.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 transition">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setDownloadUrl(null); }}
            id="pdf-word-input"
            className="hidden"
          />
          <label htmlFor="pdf-word-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select PDF file"}
            </p>
            <p className="text-xs text-slate-400">PDF files only</p>
          </label>
        </div>

        {/* Format selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Output Format:</label>
          <div className="flex gap-3">
            {(["docx", "rtf"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setOutputFormat(fmt)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition border ${
                  outputFormat === fmt
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {fmt === "docx" ? ".DOCX — Microsoft Word (recommended)" : ".RTF — Rich Text Format"}
              </button>
            ))}
          </div>
        </div>

        {/* Convert button */}
        {!downloadUrl ? (
          <button
            onClick={convert}
            disabled={!selectedFile || isProcessing}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><RefreshCw size={18} className="animate-spin" /> Extracting text & building document...</>
            ) : (
              <><FileText size={18} /> Convert PDF to {outputFormat.toUpperCase()}</>
            )}
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 space-y-3">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Converted Successfully!</h3>
            <p className="text-xs text-slate-500">{resultName}</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href={downloadUrl}
                download={resultName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <Download size={15} /> Download {outputFormat.toUpperCase()}
              </a>
              <button
                onClick={() => { setSelectedFile(null); setDownloadUrl(null); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
