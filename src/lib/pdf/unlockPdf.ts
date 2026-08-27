import * as pdfLib from "pdf-lib";
import { configure, unlockInPlace } from "pdf-lib-encrypt";

let configured = false;

function ensureConfigured() {
  if (!configured) {
    configure(pdfLib);
    configured = true;
  }
}

/**
 * Remove password protection from a PDF.
 * Tries lossless unlock via pdf-lib-encrypt; falls back to pdf.js re-render
 * when the encryption scheme is unsupported.
 */
export async function unlockPdf(
  sourceBytes: ArrayBuffer,
  password: string,
  onProgress?: (done: number, total: number) => void
): Promise<{ blob: Blob; method: "lossless" | "raster" }> {
  if (!password.trim()) {
    throw new Error("Password is required.");
  }

  try {
    const blob = await unlockLossless(sourceBytes, password);
    return { blob, method: "lossless" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Wrong password should not fall through to a raster rebuild
    if (/wrong password/i.test(message)) {
      throw new Error("Wrong password for this PDF.");
    }
    // Unsupported handler / object streams → flatten via pdf.js
    const blob = await unlockByRaster(sourceBytes, password, onProgress);
    return { blob, method: "raster" };
  }
}

async function unlockLossless(sourceBytes: ArrayBuffer, password: string): Promise<Blob> {
  ensureConfigured();
  const doc = await pdfLib.PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
  });

  if (!doc.isEncrypted) {
    const saved = await doc.save({ useObjectStreams: false });
    return bytesToBlob(saved);
  }

  await unlockInPlace(doc, password);
  const saved = await doc.save({ useObjectStreams: false });
  return bytesToBlob(saved);
}

/**
 * Open with pdf.js (supports most password PDFs) and rebuild an unlocked PDF
 * by embedding page JPEGs.
 */
async function unlockByRaster(
  sourceBytes: ArrayBuffer,
  password: string,
  onProgress?: (done: number, total: number) => void
): Promise<Blob> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  let src: import("pdfjs-dist").PDFDocumentProxy;
  try {
    src = await pdfjsLib.getDocument({
      data: sourceBytes.slice(0),
      password,
    }).promise;
  } catch (err) {
    const name = (err as { name?: string })?.name || "";
    if (name === "PasswordException") {
      throw new Error("Wrong password for this PDF.");
    }
    throw err;
  }

  const out = await pdfLib.PDFDocument.create();
  const total = src.numPages;
  const scale = 1.75;

  for (let i = 1; i <= total; i++) {
    const page = await src.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas while unlocking.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page
      .render({
        canvasContext: ctx,
        canvas,
        viewport,
      } as never)
      .promise;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);
    const image = await out.embedJpg(bytes);

    const pageWidth = viewport.width / scale;
    const pageHeight = viewport.height / scale;
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
  return bytesToBlob(saved);
}

function bytesToBlob(bytes: Uint8Array): Blob {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}
