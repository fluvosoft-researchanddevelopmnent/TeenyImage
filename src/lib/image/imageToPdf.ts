/**
 * Combines one or more images into a single PDF document client-side
 * using jsPDF. 100% in-browser — files never leave the device.
 */

import { jsPDF } from "jspdf";

export type PdfPageSize = "A4" | "Letter" | "Original";
export type PdfOrientation = "portrait" | "landscape";
export type PdfMargin = "none" | "small" | "medium" | "large";

export interface ImageToPdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMargin;
}

export interface ImageToPdfResult {
  blob: Blob;
  fileName: string;
}

const PAGE_SIZES_PX: Record<"A4" | "Letter", { width: number; height: number }> = {
  A4: { width: 794, height: 1123 }, // 210mm x 297mm @ 96dpi
  Letter: { width: 816, height: 1056 }, // 8.5in x 11in @ 96dpi
};

const MARGIN_PX: Record<PdfMargin, number> = {
  none: 0,
  small: 20,
  medium: 40,
  large: 60,
};

export async function convertImagesToPdf(
  files: File[],
  options: ImageToPdfOptions
): Promise<ImageToPdfResult> {
  if (files.length === 0) {
    throw new Error("Please select at least one image.");
  }

  const margin = MARGIN_PX[options.margin];
  let doc: jsPDF | null = null;

  for (const file of files) {
    const { dataUrl, width, height } = await loadImageAsDataUrl(file);
    const { pageWidth, pageHeight, pageOrientation } = computePageDimensions(
      width,
      height,
      options,
      margin
    );

    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(availableWidth / width, availableHeight / height);
    const drawWidth = width * scale;
    const drawHeight = height * scale;
    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    if (!doc) {
      doc = new jsPDF({
        unit: "px",
        orientation: pageOrientation,
        format: [pageWidth, pageHeight],
        compress: true,
      });
    } else {
      doc.addPage([pageWidth, pageHeight], pageOrientation);
    }

    doc.addImage(dataUrl, "JPEG", x, y, drawWidth, drawHeight);
  }

  const blob = doc!.output("blob");
  const fileName = `Images_Converted_${Date.now()}.pdf`;

  return { blob, fileName };
}

function computePageDimensions(
  width: number,
  height: number,
  options: ImageToPdfOptions,
  margin: number
): { pageWidth: number; pageHeight: number; pageOrientation: "p" | "l" } {
  if (options.pageSize === "Original") {
    const pageWidth = width + margin * 2;
    const pageHeight = height + margin * 2;
    return {
      pageWidth,
      pageHeight,
      pageOrientation: pageHeight >= pageWidth ? "p" : "l",
    };
  }

  const base = PAGE_SIZES_PX[options.pageSize];
  const isLandscape = options.orientation === "landscape";
  const pageWidth = isLandscape ? Math.max(base.width, base.height) : Math.min(base.width, base.height);
  const pageHeight = isLandscape ? Math.min(base.width, base.height) : Math.max(base.width, base.height);

  return { pageWidth, pageHeight, pageOrientation: isLandscape ? "l" : "p" };
}

function loadImageAsDataUrl(
  file: File
): Promise<{ dataUrl: string; width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas context could not be initialized"));
        return;
      }

      // Flatten onto white — we always encode as JPEG for jsPDF
      // compatibility across all input formats (PNG transparency would
      // otherwise turn black).
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      URL.revokeObjectURL(objectUrl);
      resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load "${file.name}" — file may be corrupt or unsupported`));
    };

    img.src = objectUrl;
  });
}