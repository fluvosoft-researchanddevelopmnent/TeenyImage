/**
 * Extract PDF pages for PowerPoint: rasterize each page (preserves images + visual layout)
 * and collect positioned text / links for notes and hotspots.
 */

import type { LayoutRun } from "./extractLayoutText";

export type SlideTextBox = {
  text: string;
  runs: LayoutRun[];
  /** Position as fraction of page (0–1), top-left origin for PPT. */
  x: number;
  y: number;
  w: number;
  h: number;
  fontSizePt: number;
  bold: boolean;
  italic: boolean;
  href?: string;
};

export type SlideLinkHotspot = {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PdfSlidePage = {
  pageNumber: number;
  /** Page size in PDF points. */
  widthPt: number;
  heightPt: number;
  /** JPEG data URL of the rendered page. */
  imageDataUrl: string;
  /** Plain text for speaker notes. */
  notesText: string;
  textBoxes: SlideTextBox[];
  links: SlideLinkHotspot[];
};

export type PdfSlidesResult = {
  pages: PdfSlidePage[];
  pageCount: number;
  hasText: boolean;
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  href?: string;
};

function isBold(fontName: string): boolean {
  return /bold|black|heavy|semibold|demi/i.test(fontName);
}

function isItalic(fontName: string): boolean {
  return /italic|oblique/i.test(fontName);
}

function cleanFontFamily(fontName: string): string {
  const base = fontName
    .replace(/^[A-Z]{6}\+/, "")
    .replace(/[-_]?(Bold|Italic|Oblique|Regular|Medium|Light|Black|Heavy|SemiBold|DemiBold).*$/i, "");
  if (!base || /^g_d\d/i.test(base) || base.length < 2) return "Calibri";
  return base;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return null;
}

function median(values: number[]): number {
  if (values.length === 0) return 11;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function clusterLines(items: RawItem[], yTolerance: number): { y: number; items: RawItem[] }[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; items: RawItem[] }[] = [];

  for (const item of sorted) {
    const existing = lines.find((line) => Math.abs(line.y - item.y) <= yTolerance);
    if (existing) {
      existing.items.push(item);
      existing.y = (existing.y * (existing.items.length - 1) + item.y) / existing.items.length;
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  for (const line of lines) line.items.sort((a, b) => a.x - b.x);
  return lines.sort((a, b) => b.y - a.y);
}

function joinItems(items: RawItem[]): { text: string; runs: LayoutRun[]; href?: string } {
  const runs: LayoutRun[] = [];
  let text = "";
  let sharedHref: string | undefined = items[0]?.href;

  const flush = (item: RawItem, chunk: string) => {
    if (!chunk) return;
    const fontSize = Math.max(item.height || 11, 6);
    const bold = isBold(item.fontName);
    const italic = isItalic(item.fontName);
    const fontFamily = cleanFontFamily(item.fontName);
    const last = runs[runs.length - 1];
    if (
      last &&
      Math.abs(last.fontSize - fontSize) < 0.6 &&
      last.bold === bold &&
      last.italic === italic &&
      last.fontFamily === fontFamily &&
      last.href === item.href
    ) {
      last.text += chunk;
    } else {
      runs.push({ text: chunk, fontSize, bold, italic, fontFamily, href: item.href });
    }
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.str) continue;
    if (item.href !== sharedHref) sharedHref = undefined;

    if (i > 0) {
      const prev = items[i - 1];
      const gap = item.x - (prev.x + prev.width);
      const threshold = Math.max(Math.max(prev.height, item.height) * 0.22, 1.5);
      if (gap > threshold * 4) {
        text += "\t";
        flush({ ...item, href: undefined }, "\t");
      } else if (gap > threshold * 0.35) {
        text += " ";
        flush({ ...item, href: undefined }, " ");
      }
    }
    text += item.str;
    flush(item, item.str);
  }

  return { text: text.trimEnd(), runs: runs.filter((r) => r.text.length > 0), href: sharedHref };
}

async function renderPageToJpeg(
  page: {
    getViewport: (params: { scale: number }) => { width: number; height: number };
    render: (params: Record<string, unknown>) => { promise: Promise<void> };
  },
  scale: number
): Promise<{ dataUrl: string; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: ctx,
    canvas,
    viewport,
  }).promise;

  const dataUrl =
    canvas.width * canvas.height > 400_000
      ? canvas.toDataURL("image/jpeg", 0.86)
      : canvas.toDataURL("image/png");

  canvas.width = 0;
  canvas.height = 0;

  return { dataUrl, width: viewport.width, height: viewport.height };
}

function chooseRenderScale(widthPt: number, heightPt: number): number {
  // Target ~1600px on the long edge for quality vs memory
  const longEdge = Math.max(widthPt, heightPt);
  const target = 1600;
  const scale = target / longEdge;
  return Math.min(2.5, Math.max(1.25, scale));
}

/**
 * Rasterize PDF pages and extract text/link metadata for PPTX conversion.
 */
export async function extractPdfSlides(arrayBuffer: ArrayBuffer): Promise<PdfSlidesResult> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const pages: PdfSlidePage[] = [];
  let hasText = false;

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex);
    const baseViewport = page.getViewport({ scale: 1 });
    const widthPt = baseViewport.width;
    const heightPt = baseViewport.height;
    const scale = chooseRenderScale(widthPt, heightPt);

    const [content, annotations, rendered] = await Promise.all([
      page.getTextContent({ includeMarkedContent: false }),
      page.getAnnotations({ intent: "display" }).catch(() => [] as unknown[]),
      renderPageToJpeg(page as unknown as Parameters<typeof renderPageToJpeg>[0], scale),
    ]);

    const rawItems: RawItem[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const textItem = item as {
        str: string;
        transform: number[];
        width: number;
        height: number;
        fontName: string;
      };
      if (!textItem.str) continue;
      const [, , , , e, f] = textItem.transform;
      const height = textItem.height > 0 ? textItem.height : Math.abs(textItem.transform[3]) || 11;
      const width = textItem.width > 0 ? textItem.width : textItem.str.length * height * 0.5;
      rawItems.push({
        str: textItem.str,
        x: e,
        y: f,
        width,
        height,
        fontName: textItem.fontName || "",
      });
    }

    // Link annotations → attach to glyphs + hotspots
    const links: SlideLinkHotspot[] = [];
    const pdfLinks: { url: string; xMin: number; yMin: number; xMax: number; yMax: number }[] = [];
    for (const ann of annotations) {
      const a = ann as {
        subtype?: string;
        url?: string;
        unsafeUrl?: string;
        rect?: number[];
      };
      if (a.subtype !== "Link") continue;
      const url = normalizeUrl(a.url || a.unsafeUrl || "");
      if (!url || !a.rect || a.rect.length < 4) continue;
      const [x1, y1, x2, y2] = a.rect;
      const xMin = Math.min(x1, x2);
      const yMin = Math.min(y1, y2);
      const xMax = Math.max(x1, x2);
      const yMax = Math.max(y1, y2);
      pdfLinks.push({ url, xMin, yMin, xMax, yMax });
      links.push({
        url,
        x: xMin / widthPt,
        // PDF y is bottom-up; PPT top-down
        y: 1 - yMax / heightPt,
        w: (xMax - xMin) / widthPt,
        h: (yMax - yMin) / heightPt,
      });
    }

    for (const item of rawItems) {
      for (const link of pdfLinks) {
        const x2 = item.x + Math.max(item.width, 1);
        const y2 = item.y + Math.max(item.height, 1);
        if (item.x < link.xMax && x2 > link.xMin && item.y < link.yMax && y2 > link.yMin) {
          item.href = link.url;
          break;
        }
      }
    }

    const medianSize = median(rawItems.map((i) => i.height)) || 11;
    const lines = clusterLines(rawItems, Math.max(medianSize * 0.35, 2));
    const textBoxes: SlideTextBox[] = [];
    const noteLines: string[] = [];

    for (const line of lines) {
      const { text, runs, href } = joinItems(line.items);
      if (!text.trim()) continue;
      hasText = true;

      const xs = line.items.map((i) => i.x);
      const rights = line.items.map((i) => i.x + i.width);
      const tops = line.items.map((i) => i.y + i.height);
      const bottoms = line.items.map((i) => i.y);
      const xMin = Math.min(...xs);
      const xMax = Math.max(...rights);
      const yMin = Math.min(...bottoms);
      const yMax = Math.max(...tops);
      const fontSizePt = median(line.items.map((i) => i.height));
      const pad = fontSizePt * 0.15;

      textBoxes.push({
        text,
        runs,
        x: Math.max(0, (xMin - pad) / widthPt),
        y: Math.max(0, 1 - (yMax + pad) / heightPt),
        w: Math.min(1, (xMax - xMin + pad * 2) / widthPt),
        h: Math.min(1, (yMax - yMin + pad * 2) / heightPt),
        fontSizePt,
        bold: runs.some((r) => r.bold),
        italic: runs.some((r) => r.italic),
        href,
      });
      noteLines.push(text);
    }

    pages.push({
      pageNumber: pageIndex,
      widthPt,
      heightPt,
      imageDataUrl: rendered.dataUrl,
      notesText: noteLines.join("\n"),
      textBoxes,
      links,
    });
  }

  return { pages, pageCount: pdf.numPages, hasText };
}
