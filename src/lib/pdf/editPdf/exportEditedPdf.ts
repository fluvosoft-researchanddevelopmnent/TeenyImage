import { PDFDocument, rgb, StandardFonts, LineCapStyle } from "pdf-lib";

import type { Annotation } from "./types";

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

function toPdfColor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgb(r, g, b);
}

async function embedImage(pdfDoc: PDFDocument, dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const bytes = Uint8Array.from(atob(base64 || ""), (c) => c.charCodeAt(0));
  if (/image\/jpe?g/i.test(meta || "")) {
    return pdfDoc.embedJpg(bytes);
  }
  return pdfDoc.embedPng(bytes);
}

/**
 * Bake overlay annotations into a copy of the source PDF and return a Blob.
 */
export async function exportEditedPdf(
  sourceBytes: ArrayBuffer,
  annotations: Annotation[]
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(sourceBytes.slice(0));
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  const byPage = new Map<number, Annotation[]>();
  for (const ann of annotations) {
    const list = byPage.get(ann.pageIndex) || [];
    list.push(ann);
    byPage.set(ann.pageIndex, list);
  }

  for (const [pageIndex, list] of byPage) {
    const page = pages[pageIndex];
    if (!page) continue;
    const { width, height } = page.getSize();
    const sorted = [...list].sort((a, b) => a.zIndex - b.zIndex);

    for (const ann of sorted) {
      if (ann.type === "text") {
        const font = ann.bold ? helveticaBold : helvetica;
        const fontSize = Math.max(6, ann.fontSize);
        const x = ann.x * width;
        const y = height - ann.y * height - fontSize;
        page.drawText(ann.text || " ", {
          x,
          y: Math.max(0, y),
          size: fontSize,
          font,
          color: toPdfColor(ann.color),
          maxWidth: Math.max(10, ann.w * width),
          lineHeight: fontSize * 1.25,
        });
      } else if (ann.type === "image") {
        try {
          const img = await embedImage(pdfDoc, ann.dataUrl);
          const w = ann.w * width;
          const h = ann.h * height;
          const x = ann.x * width;
          const y = height - ann.y * height - h;
          page.drawImage(img, { x, y, width: w, height: h });
        } catch (err) {
          console.warn("Failed to embed image annotation", err);
        }
      } else if (ann.type === "pen") {
        if (ann.points.length < 2) continue;
        const color = toPdfColor(ann.color);
        const thickness = Math.max(0.5, ann.highlight ? ann.strokeWidth * 3 : ann.strokeWidth);
        for (let i = 1; i < ann.points.length; i++) {
          const a = ann.points[i - 1];
          const b = ann.points[i];
          page.drawLine({
            start: { x: a.x * width, y: height - a.y * height },
            end: { x: b.x * width, y: height - b.y * height },
            thickness,
            color,
            opacity: ann.highlight ? 0.35 : 1,
            lineCap: LineCapStyle.Round,
          });
        }
      } else if (ann.type === "shape") {
        const color = toPdfColor(ann.color);
        const x = ann.x * width;
        const w = ann.w * width;
        const h = ann.h * height;
        const y = height - ann.y * height - h;

        if (ann.shape === "rect") {
          page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            borderColor: color,
            borderWidth: Math.max(0.5, ann.strokeWidth),
            color: ann.fill ? toPdfColor(ann.fill) : undefined,
            opacity: ann.fill ? 0.25 : undefined,
          });
        } else if (ann.shape === "ellipse") {
          page.drawEllipse({
            x: x + w / 2,
            y: y + h / 2,
            xScale: Math.abs(w / 2),
            yScale: Math.abs(h / 2),
            borderColor: color,
            borderWidth: Math.max(0.5, ann.strokeWidth),
            color: ann.fill ? toPdfColor(ann.fill) : undefined,
            opacity: ann.fill ? 0.25 : undefined,
          });
        } else if (ann.shape === "line") {
          page.drawLine({
            start: { x, y: height - ann.y * height },
            end: { x: x + w, y: height - (ann.y + ann.h) * height },
            thickness: Math.max(0.5, ann.strokeWidth),
            color,
          });
        } else if (ann.shape === "triangle") {
          const x1 = x + w / 2;
          const y1 = y + h;
          const x2 = x;
          const y2 = y;
          const x3 = x + w;
          const y3 = y;
          const opts = {
            thickness: Math.max(0.5, ann.strokeWidth),
            color,
          };
          page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, ...opts });
          page.drawLine({ start: { x: x2, y: y2 }, end: { x: x3, y: y3 }, ...opts });
          page.drawLine({ start: { x: x3, y: y3 }, end: { x: x1, y: y1 }, ...opts });
        } else if (ann.shape === "arrow") {
          const x1 = x;
          const y1 = height - ann.y * height;
          const x2 = x + w;
          const y2 = height - (ann.y + ann.h) * height;
          page.drawLine({
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
            thickness: Math.max(0.5, ann.strokeWidth),
            color,
          });
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const head = 10 + ann.strokeWidth * 2;
          page.drawLine({
            start: { x: x2, y: y2 },
            end: {
              x: x2 - head * Math.cos(angle - Math.PI / 6),
              y: y2 - head * Math.sin(angle - Math.PI / 6),
            },
            thickness: Math.max(0.5, ann.strokeWidth),
            color,
          });
          page.drawLine({
            start: { x: x2, y: y2 },
            end: {
              x: x2 - head * Math.cos(angle + Math.PI / 6),
              y: y2 - head * Math.sin(angle + Math.PI / 6),
            },
            thickness: Math.max(0.5, ann.strokeWidth),
            color,
          });
        }
      }
    }
  }

  const bytes = await pdfDoc.save();
  // Copy into a plain ArrayBuffer-backed view for Blob compatibility
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}
