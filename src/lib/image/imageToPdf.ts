/**
 * Combines one or more images into a single PDF document client-side
 * using jsPDF. 100% in-browser — files never leave the device.
 */

import { jsPDF } from "jspdf";
import { loadImage, createCanvas, canvasToDataUrl, cleanupCanvas } from "@/lib/utils/image";

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
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 },
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

  // files arrive in the exact order the user arranged them in
  // ToolWorkspaceLayout (drag-and-drop or up/down arrows).
  for (const file of files) {
    const image = await loadImage(file);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

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

    // Flatten onto white — jsPDF embeds this as JPEG, and transparent
    // PNGs/WEBPs would otherwise render as black.
    const { canvas, ctx } = createCanvas(width, height);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    const dataUrl = canvasToDataUrl(canvas, "image/jpeg", 0.92);
    cleanupCanvas(canvas);

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