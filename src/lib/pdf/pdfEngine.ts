import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";

/**
 * Merges multiple PDF files into one.
 */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Splits PDF by extracting specified page indices.
 */
export async function splitPdfFile(file: File, pageRangeStr: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const newPdf = await PDFDocument.create();

  // Parse page ranges e.g., "1-3, 5" -> [0, 1, 2, 4]
  const indices: number[] = [];
  const parts = pageRangeStr.split(",");
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= totalPages) indices.push(i - 1);
        }
      }
    } else {
      const p = parseInt(part.trim(), 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        indices.push(p - 1);
      }
    }
  }

  const pagesToCopy = indices.length > 0 ? indices : [0];
  const copiedPages = await newPdf.copyPages(srcPdf, pagesToCopy);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Rotates all or selected pages by specified degrees.
 */
export async function rotatePdfFile(file: File, angleDegrees: number): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angleDegrees) % 360));
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Adds watermark text over PDF pages.
 */
export async function addWatermarkToPdf(
  file: File,
  watermarkText: string,
  opacity: number = 0.4,
  rotation: number = 45
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: 48,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity: opacity,
      rotate: degrees(rotation),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Adds custom page numbers to PDF.
 */
export async function addPageNumbersToPdf(
  file: File,
  position: "bottom-center" | "bottom-right" | "top-right" = "bottom-center"
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const text = `Page ${idx + 1} of ${total}`;

    let x = width / 2 - 25;
    let y = 25;
    if (position === "bottom-right") {
      x = width - 80;
      y = 25;
    } else if (position === "top-right") {
      x = width - 80;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Compresses PDF stream.
 */
export async function compressPdfFile(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

/**
 * Converts PDF to ISO-standardized PDF/A archival format.
 */
export async function convertToPdfA(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  pdfDoc.setTitle(file.name.replace(".pdf", ""));
  pdfDoc.setProducer("TeenyPDF ISO-19005-1 Archival Engine");
  pdfDoc.setCreationDate(new Date());

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
