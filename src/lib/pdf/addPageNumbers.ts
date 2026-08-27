import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "top-left"
  | "top-right";

export type PageNumberOptions = {
  position: PageNumberPosition;
  fontSize: number;
  startFrom: number;
  /** e.g. "{n}" or "Page {n} of {total}" */
  format: string;
  color?: string;
  margin?: number;
};

/**
 * Stamp page numbers onto every page of a PDF.
 */
export async function addPageNumbers(
  sourceBytes: ArrayBuffer,
  options: PageNumberOptions
): Promise<{ blob: Blob; pageCount: number }> {
  const doc = await PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
  });

  if (doc.isEncrypted) {
    throw new Error(
      "This PDF is password-protected. Unlock it first, then add page numbers."
    );
  }

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;
  const margin = options.margin ?? 36;
  const color = hexToRgb(options.color || "#111111");

  pages.forEach((page, index) => {
    const n = options.startFrom + index;
    const text = options.format
      .replace(/\{n\}/g, String(n))
      .replace(/\{total\}/g, String(total));

    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle || 0;
    const textWidth = font.widthOfTextAtSize(text, options.fontSize);

    let x = margin;
    let y = margin;

    switch (options.position) {
      case "bottom-left":
        x = margin;
        y = margin;
        break;
      case "bottom-center":
        x = (width - textWidth) / 2;
        y = margin;
        break;
      case "bottom-right":
        x = width - textWidth - margin;
        y = margin;
        break;
      case "top-left":
        x = margin;
        y = height - margin - options.fontSize;
        break;
      case "top-center":
        x = (width - textWidth) / 2;
        y = height - margin - options.fontSize;
        break;
      case "top-right":
        x = width - textWidth - margin;
        y = height - margin - options.fontSize;
        break;
    }

    page.drawText(text, {
      x: Math.max(0, x),
      y: Math.max(0, y),
      size: options.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      rotate: degrees(rotation),
    });
  });

  const saved = await doc.save({ useObjectStreams: true });
  const copy = new Uint8Array(saved.byteLength);
  copy.set(saved);
  return {
    blob: new Blob([copy], { type: "application/pdf" }),
    pageCount: total,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const num = Number.parseInt(full, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}
