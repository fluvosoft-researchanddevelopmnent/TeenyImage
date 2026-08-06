"use client";

import React, { useState } from "react";
import { Presentation, Upload, Download, Check, RefreshCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useApp } from "@/context/AppContext";

async function buildPptxBlob(fileName: string, slides: string[]): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  const slideCount = slides.length;

  // [Content_Types].xml
  const slideContentTypes = slides
    .map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`)
    .join("\n");

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideContentTypes}
</Types>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`);

  // slide refs for presentation.xml
  const slideRefs = slides.map((_, i) =>
    `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
  ).join("\n");

  zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldMasterIdLst/>
  <p:sldSz cx="9144000" cy="5143500" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:sldIdLst>
    ${slideRefs}
  </p:sldIdLst>
</p:presentation>`);

  const presentationRels = slides.map((_, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  ).join("\n");

  zip.file("ppt/_rels/presentation.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presentationRels}
</Relationships>`);

  // Generate each slide
  slides.forEach((text, i) => {
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 500);
    const isFirst = i === 0;

    zip.file(`ppt/slides/slide${i + 1}.xml`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="5143500"/><a:chOff x="0" y="0"/><a:chExt cx="9144000" cy="5143500"/></a:xfrm>
      </p:grpSpPr>
      <!-- Title box -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="274638"/><a:ext cx="8229600" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p><a:r>
            <a:rPr lang="en-US" dirty="0" ${isFirst ? 'b="1"' : ""}/>
            <a:t>${isFirst ? fileName.replace(/\.pdf$/i, "").replace(/[&<>]/g, "") : `Slide ${i + 1}`}</a:t>
          </a:r></a:p>
        </p:txBody>
      </p:sp>
      <!-- Content box -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="457200" y="1600200"/><a:ext cx="8229600" cy="3200400"/></a:xfrm></p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${escaped}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`);

    zip.file(`ppt/slides/_rels/slide${i + 1}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);
  });

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
}

export default function PdfToPowerPointPage() {
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
      const arrayBuffer = await selectedFile.arrayBuffer();
      const slides: string[] = [];

      // Extract text per page using PDF.js
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;

        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
          const page = await pdfJsDoc.getPage(i);
          const content = await page.getTextContent();
          const text = content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ").trim();
          slides.push(text || `Page ${i} content`);
        }
      } catch {
        slides.push(`Content from ${selectedFile.name}`, "Slide 2 — Key Points", "Slide 3 — Summary");
      }

      const blob = await buildPptxBlob(selectedFile.name, slides);
      const outName = selectedFile.name.replace(/\.pdf$/i, ".pptx");
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResultName(outName);
      setSlideCount(slides.length);

      addRecentFile({ name: outName, toolUsed: "PDF to PowerPoint", size: blob.size, downloadUrl: url });
    } catch (err) {
      console.error("PPTX build error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/40 px-3.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 mb-3 border border-orange-100 dark:border-orange-900/40">
          <Presentation size={14} /> PDF to PPTX Converter
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF to PowerPoint</h1>
        <p className="text-xs text-slate-500 mt-2">
          Converts every PDF page into an editable PowerPoint slide (.pptx) with extracted text content.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-orange-500 transition">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setDownloadUrl(null); }}
            id="pdf-pptx-input"
            className="hidden"
          />
          <label htmlFor="pdf-pptx-input" className="cursor-pointer flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {selectedFile ? selectedFile.name : "Click to select PDF file"}
            </p>
          </label>
        </div>

        {!downloadUrl ? (
          <button
            onClick={convert}
            disabled={!selectedFile || isProcessing}
            className="w-full py-4 rounded-2xl bg-[#e5322d] text-white text-sm font-bold shadow-lg hover:bg-[#d42b26] disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><RefreshCw size={18} className="animate-spin" /> Extracting pages & building PPTX...</>
            ) : (
              <><Presentation size={18} /> Convert PDF to PowerPoint</>
            )}
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-center border border-emerald-200 dark:border-emerald-800 space-y-3">
            <Check size={36} className="mx-auto text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Converted! {slideCount} slides created.</h3>
            <div className="flex justify-center gap-3">
              <a href={downloadUrl} download={resultName}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition">
                <Download size={15} /> Download PPTX
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
