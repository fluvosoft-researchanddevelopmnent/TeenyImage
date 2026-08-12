"use client";

import React, { useEffect, useRef, useState } from "react";
import { Presentation, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";
import { ConversionPageLayout } from "@/components/common";

interface SlideData {
  title: string;
  content: string;
}

async function parsePptxSlides(file: File): Promise<SlideData[]> {
  const JSZip = (await import("jszip")).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slides: SlideData[] = [];

  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0");
      const nb = parseInt(b.match(/\d+/)?.[0] || "0");
      return na - nb;
    });

  for (const path of slideFiles) {
    const xml = await zip.file(path)!.async("text");
    const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const texts = textMatches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
    slides.push({ title: texts[0] || path, content: texts.slice(1).join(" ") });
  }

  return slides.length > 0 ? slides : [{ title: file.name, content: "No readable text slides found." }];
}

function drawSlideBackground(pdf: jsPDF, pageW: number, pageH: number) {
  pdf.setFillColor(245, 247, 255);
  pdf.rect(0, 0, pageW, pageH, "F");
}

function drawSlideHeader(pdf: jsPDF, pageW: number, title: string, idx: number, total: number) {
  pdf.setFillColor(229, 50, 45);
  pdf.rect(0, 0, pageW, 60, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Slide ${idx + 1} / ${total}`, pageW - 80, 35);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(title.substring(0, 80), 30, 38);
}

export default function PowerPointToPdfPage() {
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
      const isPptx = selectedFile.name.toLowerCase().endsWith(".pptx");
      const slides = isPptx
        ? await parsePptxSlides(selectedFile)
        : [{ title: selectedFile.name, content: "This is a legacy .ppt file — only .pptx is supported for text extraction. Please re-save as .pptx and try again." }];

      if (!isPptx) {
        setWarning("Legacy .ppt files aren't fully supported — only the file name was included. Please re-save as .pptx for a real conversion.");
      }

      const pdf = new jsPDF("landscape", "pt", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const contentMarginLeft = 40;
      const contentMarginRight = 40;
      const contentStartY = 95;
      const bottomMargin = pageH - 30;
      const lineHeight = 18;
      const maxLineWidth = pageW - contentMarginLeft - contentMarginRight;

      slides.forEach((slide, idx) => {
        if (idx > 0) pdf.addPage("a4", "landscape");

        drawSlideBackground(pdf, pageW, pageH);
        drawSlideHeader(pdf, pageW, slide.title, idx, slides.length);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(13);
        pdf.setTextColor(40, 40, 60);

        const wrapped = pdf.splitTextToSize(slide.content || "(No content)", maxLineWidth);

        let y = contentStartY;
        for (const line of wrapped) {
          if (y > bottomMargin) {
            // This slide's content overflowed one page — continue on a fresh
            // page instead of silently cutting the rest off (previous bug).
            pdf.addPage("a4", "landscape");
            drawSlideBackground(pdf, pageW, pageH);

            pdf.setTextColor(150, 150, 160);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "italic");
            pdf.text(`${slide.title.substring(0, 80)} (cont'd)`, contentMarginLeft, 30);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(13);
            pdf.setTextColor(40, 40, 60);
            y = 55;
          }
          pdf.text(line, contentMarginLeft, y);
          y += lineHeight;
        }
      });

      const blob = pdf.output("blob");
      const outName = selectedFile.name.replace(/\.pptx?$/i, ".pdf");

      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      setDownloadUrl(url);
      setResultName(outName);
      addRecentFile({ name: outName, toolUsed: "PowerPoint to PDF", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("Conversion error:", err);
      setError("Something went wrong converting this file. Please try again or use a different presentation.");
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
      title="PowerPoint to PDF"
      description="Converts .pptx presentations into a clean PDF — one slide per page (plus continuation pages for long content), with extracted title and content text."
      badge="PPTX to PDF Converter"
      accentClass="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/40"
      hoverBorderClass="hover:border-orange-500"
      icon={Presentation}
      acceptTypes=".pptx,.ppt"
      inputId="pptx-pdf-input"
      actionLabel="Convert PowerPoint to PDF"
      processingLabel="Parsing slides & generating PDF..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download PDF"
      onFileChange={handleFileChange}
      onConvert={convert}
      onReset={reset}
    >
      {warning && (
        <div className="flex items-start gap-2 mt-2 p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 mt-2 p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </ConversionPageLayout>
  );
}
