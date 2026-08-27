"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
  convertInchesToTwip,
  type ParagraphChild,
} from "docx";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import {
  extractLayoutText,
  type LayoutParagraph,
  type LayoutRun,
} from "@/lib/pdf/extractLayoutText";

/** PDF points → Word half-points (sz attribute uses half-points). */
function toHalfPoints(pdfPoints: number): number {
  return Math.max(16, Math.round(pdfPoints * 2));
}

/** PDF points → twips (1pt = 20 twips). Cap indent so wide pages don't explode. */
function toIndentTwip(pdfPoints: number): number {
  return Math.min(convertInchesToTwip(2.5), Math.max(0, Math.round(pdfPoints * 20)));
}

function isHeading(fontSize: number, bodyFontSize: number): "title" | "heading" | "subheading" | null {
  if (fontSize >= bodyFontSize * 1.85) return "title";
  if (fontSize >= bodyFontSize * 1.45) return "heading";
  if (fontSize >= bodyFontSize * 1.2) return "subheading";
  return null;
}

function runsToParagraphChildren(runs: LayoutRun[], forceBold = false): ParagraphChild[] {
  const children: ParagraphChild[] = [];

  for (const run of runs) {
    const textRun = new TextRun({
      text: run.text,
      bold: forceBold || run.bold,
      italics: run.italic,
      size: toHalfPoints(run.fontSize),
      font: run.fontFamily || "Calibri",
      ...(run.href
        ? {
            color: "0563C1",
            underline: {},
          }
        : {}),
    });

    if (run.href) {
      children.push(
        new ExternalHyperlink({
          link: run.href,
          children: [textRun],
        })
      );
    } else {
      children.push(textRun);
    }
  }

  return children;
}

function paragraphToDocx(p: LayoutParagraph, bodyFontSize: number, isFirst: boolean): Paragraph[] {
  const heading = isHeading(p.fontSize, bodyFontSize);
  const gapTwip = Math.min(400, Math.round(p.gapBefore * 20));
  const indent = toIndentTwip(p.x);

  const spacing = {
    before: isFirst ? 0 : Math.max(heading ? 160 : 40, gapTwip),
    after: heading ? 120 : 60,
    line: 276,
    lineRule: "auto" as const,
  };

  const body = new Paragraph({
    spacing: p.pageBreakBefore
      ? { before: 0, after: spacing.after, line: spacing.line, lineRule: spacing.lineRule }
      : spacing,
    indent: indent > 80 ? { left: indent } : undefined,
    alignment: heading === "title" ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: runsToParagraphChildren(p.runs, Boolean(heading)),
  });

  if (p.pageBreakBefore) {
    return [new Paragraph({ children: [new PageBreak()] }), body];
  }
  return [body];
}

async function buildDocxFromLayout(
  fileName: string,
  paragraphs: LayoutParagraph[],
  pageCount: number,
  bodyFontSize: number
): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: fileName.replace(/\.pdf$/i, ""),
          bold: true,
          size: 32,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `Converted by TeenyPDF — ${pageCount} page(s) · ${new Date().toLocaleDateString()}`,
          size: 16,
          color: "888888",
          font: "Calibri",
        }),
      ],
    }),
  ];

  paragraphs.forEach((p, index) => {
    children.push(...paragraphToDocx(p, bodyFontSize, index === 0));
  });

  const doc = new Document({
    creator: "TeenyPDF",
    description: "Converted from PDF with layout-aware text extraction",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.85),
              right: convertInchesToTwip(0.85),
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

function escapeRtf(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par\n")
    .replace(/\t/g, "\\tab ");
}

function buildRtfFromLayout(
  fileName: string,
  paragraphs: LayoutParagraph[],
  pageCount: number,
  bodyFontSize: number
): Blob {
  const chunks: string[] = [
    "{\\rtf1\\ansi\\deff0",
    "{\\fonttbl{\\f0 Calibri;}}",
    "{\\colortbl;\\red136\\green136\\blue136;\\red5\\green99\\blue193;}",
    "\\f0\\fs22",
    `{\\b\\fs32 ${escapeRtf(fileName.replace(/\.pdf$/i, ""))}\\b0\\par}`,
    `{\\cf1\\fs16 Converted by TeenyPDF — ${pageCount} page(s)\\par}`,
    "\\par",
  ];

  for (const p of paragraphs) {
    if (p.pageBreakBefore) chunks.push("\\page");
    if (p.gapBefore > bodyFontSize * 1.2) chunks.push("\\par");

    const indentTwip = toIndentTwip(p.x);
    if (indentTwip > 80) chunks.push(`\\li${indentTwip}`);

    const heading = isHeading(p.fontSize, bodyFontSize);
    for (const run of p.runs) {
      const fs = toHalfPoints(run.fontSize);
      const styles = [
        `\\fs${fs}`,
        run.bold || heading ? "\\b" : "",
        run.italic ? "\\i" : "",
        run.href ? "\\ul\\cf2" : "",
      ]
        .filter(Boolean)
        .join("");
      const styled = `{${styles} ${escapeRtf(run.text)}${run.href ? "\\ulnone" : ""}${run.bold || heading ? "\\b0" : ""}${run.italic ? "\\i0" : ""}}`;
      if (run.href) {
        const safeUrl = run.href.replace(/\\/g, "\\\\").replace(/"/g, "");
        chunks.push(`{\\field{\\*\\fldinst HYPERLINK "${safeUrl}"}{\\fldrslt ${styled}}}`);
      } else {
        chunks.push(styled);
      }
    }
    chunks.push("\\par\n");
  }

  chunks.push("}");
  return new Blob([chunks.join("")], { type: "application/rtf" });
}

export default function PdfToWordPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<"docx" | "rtf">("docx");
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
      let extractionFailed = false;
      let paragraphs: LayoutParagraph[] = [];
      let bodyFontSize = 11;

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pageCount = pdfDoc.getPageCount();
      } catch {
        // Still try pdf.js below.
      }

      try {
        const layout = await extractLayoutText(arrayBuffer);
        pageCount = layout.pageCount || pageCount;
        paragraphs = layout.paragraphs;
        bodyFontSize = layout.bodyFontSize;

        if (!layout.hasText) {
          extractionFailed = true;
          paragraphs = [
            {
              runs: [
                {
                  text: `No selectable text was found in ${selectedFile.name}. This usually means the PDF is a scanned image — it needs OCR before it can be converted to editable text.`,
                  fontSize: 11,
                  bold: false,
                  italic: false,
                  fontFamily: "Calibri",
                },
              ],
              x: 0,
              y: 0,
              fontSize: 11,
              gapBefore: 0,
              pageBreakBefore: false,
              pageNumber: 1,
            },
          ];
        }
      } catch (extractErr) {
        console.error("Layout extraction failed:", extractErr);
        extractionFailed = true;
        paragraphs = [
          {
            runs: [
              {
                text: `Text could not be extracted from ${selectedFile.name} (page count: ${pageCount}). The file may be corrupted, password-protected, or in an unsupported PDF format.`,
                fontSize: 11,
                bold: false,
                italic: false,
                fontFamily: "Calibri",
              },
            ],
            x: 0,
            y: 0,
            fontSize: 11,
            gapBefore: 0,
            pageBreakBefore: false,
            pageNumber: 1,
          },
        ];
      }

      if (extractionFailed) {
        setWarning(
          "We couldn't extract real text from this PDF — the exported file contains a placeholder notice instead of your content."
        );
      }

      let blob: Blob;
      let ext: string;

      if (outputFormat === "docx") {
        blob = await buildDocxFromLayout(selectedFile.name, paragraphs, pageCount, bodyFontSize);
        ext = "docx";
      } else {
        blob = buildRtfFromLayout(selectedFile.name, paragraphs, pageCount, bodyFontSize);
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
      description="Converts PDF into an editable Word document, reconstructing lines, spacing, headings, hyperlinks, and basic text styles from the original layout."
      badge="PDF to Word Converter"
      icon={FileText}
      acceptTypes=".pdf"
      inputId="pdf-word-input"
      actionLabel={`Convert PDF to ${outputFormat.toUpperCase()}`}
      processingLabel="Reconstructing layout & building document..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel={`Download ${outputFormat.toUpperCase()}`}
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      <div>
        <label className="block text-xs font-bold text-text-secondary mb-2">Output Format:</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {(["docx", "rtf"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setOutputFormat(fmt)}
              className={`w-full flex-1 py-3 px-3 rounded-xl text-xs font-bold transition border text-left sm:text-center ${
                outputFormat === fmt
                  ? "bg-red-50 border-brand text-brand"
                  : "border-border text-text-secondary hover:bg-red-50"
              }`}
            >
              <span className="sm:hidden">{fmt === "docx" ? ".DOCX (recommended)" : ".RTF"}</span>
              <span className="hidden sm:inline">
                {fmt === "docx" ? ".DOCX — Microsoft Word (recommended)" : ".RTF — Rich Text Format"}
              </span>
            </button>
          ))}
        </div>
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
