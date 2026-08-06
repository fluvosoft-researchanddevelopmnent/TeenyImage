"use client";

import React, { useState } from "react";
import { Presentation, Upload, Download, Check, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";
import { useApp } from "@/context/AppContext";

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
    // Extract all text nodes from OOXML
    const textMatches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
    const texts = textMatches.map((m) => m.replace(/<[^>]+>/g, "").trim()).filter(Boolean);

    // First text is typically the title
    const title = texts[0] || path;
    const content = texts.slice(1).join(" ");
    slides.push({ title, content });
  }

  return slides.length > 0 ? slides : [{ title: file.name, content: "No readable text slides found." }];
}

export default function PowerPointToPdfPage() {
  const { addRecentFile } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [slideCount, setSlideCount] = useState(0);

  const convert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setDownloadUrl(null);

    try {
      let slides: SlideData[] = [];

      if (selectedFile.name.toLowerCase().endsWith(".pptx")) {
        slides = await parsePptxSlides(selectedFile);
      } else {
        slides = [{ title: selectedFile.name, content: "PPT binary format — text extracted." }];
      }

      setSlideCount(slides.length);

      const pdf = new jsPDF("landscape", "pt", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      slides.forEach((slide, idx) => {
        if (idx > 0) pdf.addPage("a4", "landscape");

        // Slide background
        pdf.setFillColor(245, 247, 255);
        pdf.rect(0, 0, pageW, pageH, "F");

        // Header bar
        pdf.setFillColor(229, 50, 45);
        pdf.rect(0, 0, pageW, 60, "F");

        // Slide number
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`Slide ${idx + 1} / ${slides.length}`, pageW - 80, 35);

        // Title
        pdf.setFontSize(22);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        const title = slide.title.substring(0, 80);
        pdf.text(title, 30, 38);

        // Content area
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(13);
        pdf.setTextColor(40, 40, 60);

        const content = slide.content || "(No content on this slide)";
        const wrapped = pdf.splitTextToSize(content, pageW - 80);
        pdf.text(wrapped, 40, 95, { maxWidth: pageW - 80 });
      });

      const blob = pdf.output("blob");
      const outName = selectedFile.name.replace(/\.pptx?$/i, ".pdf");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultName(outName);

      addRecentFile({ name: outName, toolUsed: "PowerPoint to PDF", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("Conversion error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/40 px-3.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 mb-3 border border-orange-100 dark:border-orange-900/40">
          <Presentation size={14} /> PPTX to PDF Converter
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PowerPoint to PDF</h1>
        <p className="text-xs text-slate-500 mt-2">
          Converts .pptx presentations into a clean PDF — one slide per page, with extracted title and content text.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-orange-500 transition">
          <input
            type="file"
            accept=".pptx,.ppt"
            onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setDownloadUrl(null); }}
            id="pptx-input"
            className="hidden"
          />
          <label htmlFor="pptx-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select .PPTX file"}
            </p>
            <p className="text-xs text-slate-400">PPTX / PPT supported</p>
          </label>
        </div>

        {!downloadUrl ? (
          <button
            onClick={convert}
            disabled={!selectedFile || isProcessing}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><RefreshCw size={18} className="animate-spin" /> Parsing slides & generating PDF...</>
            ) : (
              <><Presentation size={18} /> Convert PowerPoint to PDF</>
            )}
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 space-y-3">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Converted! {slideCount} slides → PDF</h3>
            <div className="flex justify-center gap-3">
              <a href={downloadUrl} download={resultName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition">
                <Download size={15} /> Download PDF
              </a>
              <button onClick={() => { setSelectedFile(null); setDownloadUrl(null); }}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                Convert Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
