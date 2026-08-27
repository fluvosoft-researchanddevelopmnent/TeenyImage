import { PDFDocument } from "pdf-lib";

export type RepairResult = {
  blob: Blob;
  recoveredPages: number;
  skippedPages: number;
  method: "copy" | "raster";
  warnings: string[];
};

/**
 * Attempt to repair a damaged / partially corrupt PDF by copying recoverable
 * pages into a fresh document. Falls back to pdf.js raster rebuild when needed.
 */
export async function repairPdf(
  sourceBytes: ArrayBuffer,
  onProgress?: (done: number, total: number) => void
): Promise<RepairResult> {
  const warnings: string[] = [];

  try {
    return await repairByCopy(sourceBytes, warnings, onProgress);
  } catch (err) {
    console.warn("Copy repair failed, trying raster rebuild", err);
    warnings.push("Structural repair failed; rebuilt pages from a visual recovery pass.");
    return repairByRaster(sourceBytes, warnings, onProgress);
  }
}

async function repairByCopy(
  sourceBytes: ArrayBuffer,
  warnings: string[],
  onProgress?: (done: number, total: number) => void
): Promise<RepairResult> {
  const src = await PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  const out = await PDFDocument.create();
  out.setProducer("TeenyPDF Repair Engine");
  out.setCreator("TeenyPDF");
  out.setModificationDate(new Date());

  const total = src.getPageCount();
  let recovered = 0;
  let skipped = 0;

  for (let i = 0; i < total; i++) {
    try {
      const [page] = await out.copyPages(src, [i]);
      out.addPage(page);
      recovered++;
    } catch (err) {
      console.warn(`Skipped damaged page ${i + 1}`, err);
      skipped++;
      warnings.push(`Page ${i + 1} could not be recovered and was skipped.`);
    }
    onProgress?.(i + 1, total);
  }

  if (recovered === 0) {
    throw new Error("No pages could be recovered from this file.");
  }

  const saved = await out.save({ useObjectStreams: true });
  return {
    blob: bytesToBlob(saved),
    recoveredPages: recovered,
    skippedPages: skipped,
    method: "copy",
    warnings,
  };
}

async function repairByRaster(
  sourceBytes: ArrayBuffer,
  warnings: string[],
  onProgress?: (done: number, total: number) => void
): Promise<RepairResult> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const src = await pdfjsLib.getDocument({
    data: sourceBytes.slice(0),
    stopAtErrors: false,
  }).promise;

  const out = await PDFDocument.create();
  out.setProducer("TeenyPDF Repair Engine");
  out.setCreator("TeenyPDF");

  const total = src.numPages;
  let recovered = 0;
  let skipped = 0;
  const scale = 1.5;

  for (let i = 1; i <= total; i++) {
    try {
      const page = await src.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page
        .render({
          canvasContext: ctx,
          canvas,
          viewport,
        } as never)
        .promise;

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const bytes = dataUrlToBytes(dataUrl);
      const image = await out.embedJpg(bytes);
      const pdfPage = out.addPage([viewport.width / scale, viewport.height / scale]);
      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width / scale,
        height: viewport.height / scale,
      });
      recovered++;
    } catch (err) {
      console.warn(`Raster recovery failed for page ${i}`, err);
      skipped++;
      warnings.push(`Page ${i} could not be recovered and was skipped.`);
    }
    onProgress?.(i, total);
  }

  if (recovered === 0) {
    throw new Error("Could not repair this PDF. The file may be too damaged.");
  }

  const saved = await out.save({ useObjectStreams: true });
  return {
    blob: bytesToBlob(saved),
    recoveredPages: recovered,
    skippedPages: skipped,
    method: "raster",
    warnings,
  };
}

function bytesToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
