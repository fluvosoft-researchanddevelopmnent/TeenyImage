"use client";

import React, { useEffect, useRef, useState } from "react";
import { Presentation, AlertTriangle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";
import { extractPdfSlides, type PdfSlidePage } from "@/lib/pdf/extractPdfSlides";

/** PDF points → inches for pptxgenjs layouts. */
function ptToIn(pt: number): number {
  return pt / 72;
}

/**
 * Fit a PDF page into a PowerPoint-friendly slide size while keeping aspect ratio.
 * Caps width at ~13.333" (16:9 widescreen) so decks stay practical.
 */
function slideSizeForPage(widthPt: number, heightPt: number): { w: number; h: number } {
  const aspect = widthPt / Math.max(heightPt, 1);
  const maxW = 13.333;
  const maxH = 7.5;

  let w = ptToIn(widthPt);
  let h = ptToIn(heightPt);

  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }

  // Minimum usable size
  w = Math.max(w, 5);
  h = Math.max(h, 3);
  return { w: Math.round(w * 1000) / 1000, h: Math.round(h * 1000) / 1000 };
}

async function buildPptxFromPages(fileName: string, pages: PdfSlidePage[]): Promise<Blob> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.author = "TeenyPDF";
  pptx.title = fileName.replace(/\.pdf$/i, "");
  pptx.subject = "Converted from PDF by TeenyPDF";

  const first = pages[0];
  const layout = slideSizeForPage(first?.widthPt ?? 792, first?.heightPt ?? 612);
  const layoutName = "PDF_PAGE";
  pptx.defineLayout({ name: layoutName, width: layout.w, height: layout.h });
  pptx.layout = layoutName;

  for (const page of pages) {
    const slide = pptx.addSlide();
    const pageLayout = slideSizeForPage(page.widthPt, page.heightPt);

    // If this page differs a lot from the deck layout, letterbox inside the slide
    const scale = Math.min(layout.w / pageLayout.w, layout.h / pageLayout.h);
    const drawW = pageLayout.w * scale;
    const drawH = pageLayout.h * scale;
    const offsetX = (layout.w - drawW) / 2;
    const offsetY = (layout.h - drawH) / 2;

    slide.addImage({
      data: page.imageDataUrl,
      x: offsetX,
      y: offsetY,
      w: drawW,
      h: drawH,
    });

    // Transparent clickable hotspots for PDF hyperlinks
    for (const link of page.links) {
      const x = offsetX + link.x * drawW;
      const y = offsetY + link.y * drawH;
      const w = Math.max(link.w * drawW, 0.15);
      const h = Math.max(link.h * drawH, 0.12);
      slide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w,
        h,
        fill: { type: "solid", color: "FFFFFF", transparency: 100 },
        line: { color: "FFFFFF", transparency: 100 },
        hyperlink: { url: link.url },
      });
    }

    // Layout text in speaker notes for copy/search (keeps slide visuals clean)
    if (page.notesText.trim()) {
      slide.addNotes(
        `Page ${page.pageNumber}\n\n${page.notesText}`
      );
    }
  }

  const output = await pptx.write({ outputType: "blob" });
  return output as Blob;
}

export default function PdfToPowerPointPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      const { pages, hasText } = await extractPdfSlides(arrayBuffer);

      if (pages.length === 0) {
        setError("No pages could be read from this PDF.");
        return;
      }

      if (!hasText) {
        setWarning(
          "This PDF had little or no selectable text (it may be scanned). Slides still include a visual copy of each page, including images."
        );
      }

      const blob = await buildPptxFromPages(selectedFile.name, pages);
      const outName = selectedFile.name.replace(/\.pdf$/i, ".pptx");

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({ name: outName, toolUsed: "PDF to PowerPoint", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("PPTX conversion error:", err);
      setError("Something went wrong converting this PDF. Please try again or use a different file.");
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
      title="PDF to PowerPoint"
      description="Converts each PDF page into a PowerPoint slide that preserves the original layout, images, and formatting. Links stay clickable; page text is also in speaker notes."
      badge="PDF to PPTX Converter"
      icon={Presentation}
      acceptTypes=".pdf"
      inputId="pdf-pptx-input"
      actionLabel="Convert PDF to PowerPoint"
      processingLabel="Rendering pages & building PPTX..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PPTX"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
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
