import { PDFDocument } from "pdf-lib";

export type CompressLevel = "low" | "medium" | "high";

export type CompressResult = {
  blob: Blob;
  originalBytes: number;
  compressedBytes: number;
  pageCount: number;
};

const LEVEL_SETTINGS: Record<
  CompressLevel,
  { scale: number; jpegQuality: number; label: string }
> = {
  // lower jpegQuality / scale → smaller file
  low: { scale: 1.15, jpegQuality: 0.45, label: "Maximum compression" },
  medium: { scale: 1.5, jpegQuality: 0.72, label: "Balanced" },
  high: { scale: 2, jpegQuality: 0.88, label: "High quality" },
};

/**
 * Compress a PDF by re-rendering pages to JPEG and rebuilding the document.
 * Runs entirely in the browser via pdf.js + pdf-lib.
 */
export async function compressPdf(
  sourceBytes: ArrayBuffer,
  level: CompressLevel = "medium",
  onProgress?: (done: number, total: number) => void
): Promise<CompressResult> {
  const settings = LEVEL_SETTINGS[level];
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const src = await pdfjsLib.getDocument({ data: sourceBytes.slice(0) }).promise;
  const out = await PDFDocument.create();
  const total = src.numPages;

  for (let i = 1; i <= total; i++) {
    const page = await src.getPage(i);
    const viewport = page.getViewport({ scale: settings.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas for compression.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page
      .render({
        canvasContext: ctx,
        canvas,
        viewport,
      } as never)
      .promise;

    const dataUrl = canvas.toDataURL("image/jpeg", settings.jpegQuality);
    const jpgBytes = dataUrlToBytes(dataUrl);
    const image = await out.embedJpg(jpgBytes);

    // PDF points ≈ CSS px at 72dpi; viewport is at `scale`, so page size = viewport / scale
    const pageWidth = viewport.width / settings.scale;
    const pageHeight = viewport.height / settings.scale;
    const pdfPage = out.addPage([pageWidth, pageHeight]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    onProgress?.(i, total);
  }

  const saved = await out.save({ useObjectStreams: true });
  const copy = new Uint8Array(saved.byteLength);
  copy.set(saved);
  const blob = new Blob([copy], { type: "application/pdf" });

  return {
    blob,
    originalBytes: sourceBytes.byteLength,
    compressedBytes: blob.size,
    pageCount: total,
  };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function compressLevelLabel(level: CompressLevel): string {
  return LEVEL_SETTINGS[level].label;
}
