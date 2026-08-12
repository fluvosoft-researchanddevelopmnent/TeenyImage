"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";

// ── DOCX builder ──────────────────────────────────────────────────────────────
// NOTE: We avoid referencing named styles (e.g. Heading1) because that requires
// a matching word/styles.xml entry — omit it and some validators (Word's strict
// mode, Google Docs, LibreOffice) will flag the file as needing repair. Instead
// we apply direct run formatting (bold + larger size) which needs no style part.
async function buildDocxBlob(fileName: string, rawText: string, pageCount: number): Promise<Blob> {
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

  const escapedFileName = fileName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">
  <w:body>
    <w:p>
      <w:r><w:rPr><w:b/><w:sz w:val="44"/></w:rPr>
        <w:t xml:space="preserve">${escapedFileName}</w:t>
      </w:r>
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

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PdfToWordPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"docx" | "rtf">("docx");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track the blob URL so we can revoke it on cleanup/replace instead of leaking it.
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);
  };

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);
    setWarning(null);
    setError(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      let pageCount = 1;
      let rawText = "";
      let extractionFailed = false;

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pageCount = pdfDoc.getPageCount();
      } catch {
        // pdf-lib couldn't parse it — file may be corrupted or encrypted.
        // We still try pdf.js below in case it can handle it.
      }

      try {
        const pdfjsLib = await import("pdfjs-dist");
        // Pin the worker to the exact installed pdfjs-dist version so it never
        // silently mismatches the API version (which throws and was previously
        // swallowed, producing a placeholder doc with no real content).
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const texts: string[] = [];
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ");
          texts.push(`--- Page ${i} ---\n${pageText}`);
        }
        rawText = texts.join("\n\n");

        // A PDF made entirely of scanned images will parse fine but yield no
        // extractable text — flag that clearly instead of silently returning
        // an (almost) empty document.
        if (rawText.replace(/--- Page \d+ ---/g, "").trim().length === 0) {
          extractionFailed = true;
          rawText = `No selectable text was found in ${selectedFile.name}. This usually means the PDF is a scanned image — it needs OCR before it can be converted to editable text.`;
        }
      } catch (extractErr) {
        console.error("Text extraction failed:", extractErr);
        extractionFailed = true;
        rawText = `Text could not be extracted from ${selectedFile.name} (page count: ${pageCount}). The file may be corrupted, password-protected, or in an unsupported PDF format.`;
      }

      if (extractionFailed) {
        setWarning(
          "We couldn't extract real text from this PDF — the exported file contains a placeholder notice instead of your content."
        );
      }

      let blob: Blob;
      let ext: string;

      if (outputFormat === "docx") {
        blob = await buildDocxBlob(selectedFile.name, rawText, pageCount);
        ext = "docx";
      } else {
        const rtfContent = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Arial;}}\n\\f0\\fs24\n{\\b\\fs32 ${selectedFile.name.replace(/[{}\\]/g, "")}\\b0\\par}\n\\par\n${rawText.replace(/[{}\\]/g, "").replace(/\n/g, "\\par\n")}\n}`;
        blob = new Blob([rtfContent], { type: "application/rtf" });
        ext = "rtf";
      }

      const outName = selectedFile.name.replace(/\.pdf$/i, `.${ext}`);

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({ name: outName, toolUsed: "PDF to Word", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Something went wrong converting this file. Please try again or use a different PDF.");
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
      title="PDF to Word (DOC / DOCX)"
      description="Converts PDF text content into a properly structured, editable Word document (.docx) or RTF."
      badge="PDF to Word Converter"
      accentClass="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40"
      hoverBorderClass="hover:border-blue-500"
      icon={FileText}
      acceptTypes=".pdf"
      inputId="pdf-word-input"
      actionLabel={`Convert PDF to ${outputFormat.toUpperCase()}`}
      processingLabel="Extracting text & building document..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel={`Download ${outputFormat.toUpperCase()}`}
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {/* Format picker */}
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

      {warning && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
