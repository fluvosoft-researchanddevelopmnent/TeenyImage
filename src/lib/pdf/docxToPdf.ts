/**
 * DOCX → PDF with layout, images, and clickable hyperlinks.
 * Pipeline: mammoth (DOCX→HTML) → styled DOM → html2canvas →
 * margin-aware page slices that break on whitespace (not through text).
 */

import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/** Content width ≈ A4 @ 96dpi minus side margins handled in PDF. */
const PAGE_WIDTH_PX = 794;
const CONTENT_PAD_X_PX = 8;

/** PDF page margins (mm) — applied on EVERY page including after page breaks. */
const MARGIN_MM = 16;

const DOCUMENT_CSS = `
  .teenypdf-docx-root {
    box-sizing: border-box;
    width: ${PAGE_WIDTH_PX}px;
    padding: 0 ${CONTENT_PAD_X_PX}px;
    background: #ffffff;
    color: #111111;
    font-family: Calibri, "Segoe UI", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }
  .teenypdf-docx-root * { box-sizing: border-box; }
  .teenypdf-docx-root h1 { font-size: 22pt; font-weight: 700; margin: 0 0 12px; line-height: 1.25; }
  .teenypdf-docx-root h2 { font-size: 16pt; font-weight: 700; margin: 18px 0 10px; line-height: 1.3; }
  .teenypdf-docx-root h3 { font-size: 13pt; font-weight: 700; margin: 14px 0 8px; line-height: 1.35; }
  .teenypdf-docx-root h4, .teenypdf-docx-root h5, .teenypdf-docx-root h6 {
    font-size: 11pt; font-weight: 700; margin: 12px 0 6px;
  }
  .teenypdf-docx-root p { margin: 0 0 8px; }
  .teenypdf-docx-root a { color: #0563C1; text-decoration: underline; }
  .teenypdf-docx-root ul, .teenypdf-docx-root ol { margin: 0 0 10px; padding-left: 1.5em; }
  .teenypdf-docx-root li { margin: 0 0 4px; }
  .teenypdf-docx-root table {
    border-collapse: collapse;
    width: 100%;
    margin: 0 0 12px;
    font-size: 10pt;
  }
  .teenypdf-docx-root th, .teenypdf-docx-root td {
    border: 1px solid #c8c8c8;
    padding: 6px 8px;
    vertical-align: top;
  }
  .teenypdf-docx-root th { background: #f3f3f3; font-weight: 700; }
  .teenypdf-docx-root img {
    max-width: 100%;
    height: auto;
    display: inline-block;
    margin: 8px 0;
  }
  .teenypdf-docx-root blockquote {
    margin: 8px 0;
    padding: 4px 12px;
    border-left: 3px solid #cccccc;
    color: #333333;
  }
  .teenypdf-docx-root pre, .teenypdf-docx-root code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 9.5pt;
  }
  .teenypdf-docx-root pre {
    background: #f7f7f7;
    padding: 10px;
    overflow: hidden;
    white-space: pre-wrap;
  }
  /* Keep ordinals like 4th on the same line (mammoth emits <sup>th</sup>) */
  .teenypdf-docx-root sup, .teenypdf-docx-root sub {
    display: inline;
    font-size: 0.7em;
    line-height: 0;
    vertical-align: baseline;
    position: relative;
  }
  .teenypdf-docx-root sup { top: -0.35em; }
  .teenypdf-docx-root sub { top: 0.2em; }
`;

export type DocxToPdfResult = {
  blob: Blob;
  warnings: string[];
};

function normalizeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("javascript:")) return null;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

/** Flatten common ordinal superscripts so "4th" never wraps onto its own line. */
function normalizeHtml(html: string): string {
  return html
    .replace(/(\d)\s*<sup>\s*(st|nd|rd|th)\s*<\/sup>/gi, "$1$2")
    .replace(/<sup>\s*(st|nd|rd|th)\s*<\/sup>/gi, "$1");
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, 8000);
        })
    )
  );
}

async function docxToHtml(arrayBuffer: ArrayBuffer): Promise<{ html: string; messages: string[] }> {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.dataUri,
    }
  );

  return {
    html: normalizeHtml(result.value || "<p></p>"),
    messages: (result.messages || []).map((m) => m.message),
  };
}

type LinkBox = {
  href: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

function collectLinkBoxes(root: HTMLElement): LinkBox[] {
  const rootRect = root.getBoundingClientRect();
  const boxes: LinkBox[] = [];

  root.querySelectorAll("a[href]").forEach((node) => {
    const anchor = node as HTMLAnchorElement;
    const href = normalizeHref(anchor.getAttribute("href") || anchor.href || "");
    if (!href) return;

    const rects = Array.from(anchor.getClientRects());
    for (const rect of rects) {
      if (rect.width < 1 || rect.height < 1) continue;
      boxes.push({
        href,
        top: rect.top - rootRect.top + root.scrollTop,
        left: rect.left - rootRect.left + root.scrollLeft,
        width: rect.width,
        height: rect.height,
      });
    }
  });

  return boxes;
}

/** Sample a horizontal row — true when nearly all pixels are white/near-white. */
function isWhitespaceRow(
  data: Uint8ClampedArray,
  width: number,
  y: number,
  bytesPerRow: number
): boolean {
  const rowStart = y * bytesPerRow;
  let dark = 0;
  const sampleStep = Math.max(1, Math.floor(width / 120));
  let samples = 0;
  for (let x = 0; x < width; x += sampleStep) {
    const i = rowStart + x * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Count non-white (text/ink)
    if (r < 245 || g < 245 || b < 245) dark++;
    samples++;
  }
  return dark / Math.max(samples, 1) < 0.02;
}

/**
 * Find a Y cut near `idealY` that sits in a whitespace gap so glyphs aren't bisected.
 * Prefers breaking upward (keep more on the current page) within searchRange.
 */
function findSafeBreakY(
  imageData: ImageData,
  idealY: number,
  minY: number,
  maxY: number,
  searchRange: number
): number {
  const { data, width, height } = imageData;
  const bytesPerRow = width * 4;
  const target = Math.min(Math.max(Math.floor(idealY), minY + 1), Math.min(maxY, height));
  const lo = Math.max(minY + 1, target - searchRange);
  const hi = Math.min(height - 1, Math.min(maxY, target + Math.floor(searchRange * 0.25)));

  // Prefer a run of 3+ white rows; search upward from ideal first
  for (let y = target; y >= lo; y--) {
    if (
      isWhitespaceRow(data, width, y, bytesPerRow) &&
      isWhitespaceRow(data, width, Math.max(0, y - 1), bytesPerRow) &&
      isWhitespaceRow(data, width, Math.max(0, y - 2), bytesPerRow)
    ) {
      return y;
    }
  }

  for (let y = target; y <= hi; y++) {
    if (
      isWhitespaceRow(data, width, y, bytesPerRow) &&
      isWhitespaceRow(data, width, Math.min(height - 1, y + 1), bytesPerRow)
    ) {
      return y;
    }
  }

  return target;
}

type PageSlice = { startY: number; endY: number };

/** Build exclusive page slices [start,end) with safe breaks and no overlap/duplication. */
function buildPageSlices(
  canvas: HTMLCanvasElement,
  pageHeightPx: number,
  minAdvancePx: number
): PageSlice[] {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    const slices: PageSlice[] = [];
    for (let y = 0; y < canvas.height; y += pageHeightPx) {
      slices.push({ startY: y, endY: Math.min(canvas.height, y + pageHeightPx) });
    }
    return slices;
  }

  // One read for the whole canvas — used to find whitespace gaps
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const searchRange = Math.floor(pageHeightPx * 0.22);
  const slices: PageSlice[] = [];
  let startY = 0;

  while (startY < canvas.height - 1) {
    const remaining = canvas.height - startY;
    if (remaining <= pageHeightPx * 1.05) {
      slices.push({ startY, endY: canvas.height });
      break;
    }

    const idealEnd = startY + pageHeightPx;
    const endY = findSafeBreakY(
      imageData,
      idealEnd,
      startY + minAdvancePx,
      startY + pageHeightPx + searchRange,
      searchRange
    );

    const safeEnd = Math.max(startY + minAdvancePx, Math.min(endY, canvas.height));
    slices.push({ startY, endY: safeEnd });
    startY = safeEnd;
  }

  return slices.length > 0 ? slices : [{ startY: 0, endY: canvas.height }];
}

/**
 * Convert a DOCX ArrayBuffer into a PDF Blob preserving visual layout, images, and links.
 */
export async function convertDocxToPdf(arrayBuffer: ArrayBuffer): Promise<DocxToPdfResult> {
  const { html, messages } = await docxToHtml(arrayBuffer);
  const warnings: string[] = [];

  if (!html.replace(/<[^>]+>/g, "").trim()) {
    warnings.push("No readable content was found in this Word file.");
  }

  const styleEl = document.createElement("style");
  styleEl.textContent = DOCUMENT_CSS;

  const host = document.createElement("div");
  host.className = "teenypdf-docx-root";
  host.setAttribute("data-teenypdf-docx", "1");
  host.style.cssText =
    "position:fixed;left:-12000px;top:0;width:" +
    PAGE_WIDTH_PX +
    "px;background:#fff;z-index:-1;overflow:visible;";
  host.innerHTML = html;

  document.head.appendChild(styleEl);
  document.body.appendChild(host);

  try {
    await waitForImages(host);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const linkBoxes = collectLinkBoxes(host);

    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: PAGE_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    const contentWmm = pdfW - MARGIN_MM * 2;
    const contentHmm = pdfH - MARGIN_MM * 2;
    const pxToMm = contentWmm / canvas.width;
    const pageHeightPx = contentHmm / pxToMm;
    // Don't allow a tiny leftover strip that would still cut a line
    const minAdvancePx = Math.floor(pageHeightPx * 0.55);

    const slices = buildPageSlices(canvas, pageHeightPx, minAdvancePx);
    const scale = canvas.width / host.offsetWidth;

    slices.forEach((slice, pageIndex) => {
      if (pageIndex > 0) pdf.addPage();

      const sliceH = slice.endY - slice.startY;
      if (sliceH <= 0) return;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        slice.startY,
        canvas.width,
        sliceH,
        0,
        0,
        canvas.width,
        sliceH
      );

      const sliceHmm = sliceH * pxToMm;
      const dataUrl = pageCanvas.toDataURL("image/jpeg", 0.93);
      // Always inset by MARGIN_MM so every page (including after breaks) has breathing room
      pdf.addImage(dataUrl, "JPEG", MARGIN_MM, MARGIN_MM, contentWmm, sliceHmm);

      for (const box of linkBoxes) {
        const topPx = box.top * scale;
        const bottomPx = topPx + box.height * scale;
        if (bottomPx <= slice.startY || topPx >= slice.endY) continue;

        const leftMm = MARGIN_MM + box.left * scale * pxToMm;
        const widthMm = Math.max(box.width * scale * pxToMm, 2);
        const heightMm = Math.max(box.height * scale * pxToMm, 2);
        const topOnPageMm = MARGIN_MM + (topPx - slice.startY) * pxToMm;

        pdf.link(leftMm, topOnPageMm, widthMm, heightMm, { url: box.href });
      }

      pageCanvas.width = 0;
      pageCanvas.height = 0;
    });

    canvas.width = 0;
    canvas.height = 0;

    if (messages.length > 0) {
      warnings.push("Some Word features may not convert perfectly (complex fields, SmartArt, etc.).");
    }

    return { blob: pdf.output("blob"), warnings };
  } finally {
    host.remove();
    styleEl.remove();
  }
}
