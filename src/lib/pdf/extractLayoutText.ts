/**
 * Layout-aware PDF text extraction via pdf.js.
 * Reconstructs lines, spacing, font size, and basic styles from glyph positions
 * instead of joining every item with a single space.
 */

export type LayoutRun = {
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  fontFamily: string;
  /** External URL when this run is (part of) a PDF hyperlink. */
  href?: string;
};

export type PdfLink = {
  url: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

export type LayoutParagraph = {
  runs: LayoutRun[];
  /** Left edge in PDF points (from page origin). */
  x: number;
  /** Baseline Y in PDF points (bottom-up). */
  y: number;
  /** Dominant font size for the paragraph. */
  fontSize: number;
  /** Vertical gap from previous paragraph (PDF points). */
  gapBefore: number;
  /** True when this is the first paragraph of a new PDF page. */
  pageBreakBefore: boolean;
  pageNumber: number;
};

export type LayoutExtractionResult = {
  paragraphs: LayoutParagraph[];
  pageCount: number;
  /** Average body font size across the document (fallback 11). */
  bodyFontSize: number;
  hasText: boolean;
};

type RawItem = {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  hasEOL: boolean;
  href?: string;
};

const URL_IN_TEXT =
  /\b((?:https?:\/\/|mailto:|www\.)[^\s<>"'\)\]]+[^\s<>"'\)\].,;:!?])/gi;

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return null;
}

function itemOverlapsLink(item: RawItem, link: PdfLink): boolean {
  const x1 = item.x;
  const x2 = item.x + Math.max(item.width, 1);
  const y1 = item.y;
  const y2 = item.y + Math.max(item.height, 1);
  return x1 < link.xMax && x2 > link.xMin && y1 < link.yMax && y2 > link.yMin;
}

function attachLinksToItems(items: RawItem[], links: PdfLink[]): void {
  if (links.length === 0) return;
  for (const item of items) {
    for (const link of links) {
      if (itemOverlapsLink(item, link)) {
        item.href = link.url;
        break;
      }
    }
  }
}

/** Split plain-text URL substrings into linked runs when PDF had no annotation. */
function annotatePlainUrls(runs: LayoutRun[]): LayoutRun[] {
  const out: LayoutRun[] = [];
  for (const run of runs) {
    if (run.href) {
      out.push(run);
      continue;
    }

    const matches = [...run.text.matchAll(URL_IN_TEXT)];
    if (matches.length === 0) {
      out.push(run);
      continue;
    }

    let last = 0;
    for (const match of matches) {
      const urlText = match[1];
      const index = match.index ?? 0;
      const href = normalizeUrl(urlText);
      if (index > last) {
        out.push({ ...run, text: run.text.slice(last, index), href: undefined });
      }
      out.push({ ...run, text: urlText, href: href || undefined });
      last = index + urlText.length;
    }
    if (last < run.text.length) {
      out.push({ ...run, text: run.text.slice(last), href: undefined });
    }
  }
  return out.filter((r) => r.text.length > 0);
}

async function extractPageLinks(page: {
  getAnnotations: (params?: { intent?: string }) => Promise<unknown[]>;
}): Promise<PdfLink[]> {
  try {
    const annotations = await page.getAnnotations({ intent: "display" });
    const links: PdfLink[] = [];
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
      links.push({
        url,
        xMin: Math.min(x1, x2),
        yMin: Math.min(y1, y2),
        xMax: Math.max(x1, x2),
        yMax: Math.max(y1, y2),
      });
    }
    return links;
  } catch {
    return [];
  }
}

type LineBucket = {
  y: number;
  items: RawItem[];
};

function isBold(fontName: string): boolean {
  return /bold|black|heavy|semibold|demi/i.test(fontName);
}

function isItalic(fontName: string): boolean {
  return /italic|oblique/i.test(fontName);
}

function cleanFontFamily(fontName: string): string {
  // pdf.js font names look like "g_d0_f1" or "ABCDEF+Arial-BoldMT"
  const base = fontName.replace(/^[A-Z]{6}\+/, "").replace(/[-_]?(Bold|Italic|Oblique|Regular|Medium|Light|Black|Heavy|SemiBold|DemiBold).*$/i, "");
  if (!base || /^g_d\d/i.test(base) || base.length < 2) return "Calibri";
  return base;
}

function clusterLines(items: RawItem[], yTolerance: number): LineBucket[] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: LineBucket[] = [];

  for (const item of sorted) {
    const existing = lines.find((line) => Math.abs(line.y - item.y) <= yTolerance);
    if (existing) {
      existing.items.push(item);
      // Keep line Y as average of baselines for stabler clustering later
      existing.y = (existing.y * (existing.items.length - 1) + item.y) / existing.items.length;
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  }

  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
  }

  return lines.sort((a, b) => b.y - a.y);
}

function spaceGapThreshold(fontSize: number): number {
  // ~0.25em gap → insert a space; larger gaps get multiple spaces / tabs
  return Math.max(fontSize * 0.22, 1.5);
}

function joinLineText(items: RawItem[]): { text: string; runs: LayoutRun[] } {
  if (items.length === 0) return { text: "", runs: [] };

  const runs: LayoutRun[] = [];
  let text = "";

  const flushRun = (item: RawItem, chunk: string) => {
    if (!chunk) return;
    const fontSize = Math.max(item.height || 11, 6);
    const bold = isBold(item.fontName);
    const italic = isItalic(item.fontName);
    const fontFamily = cleanFontFamily(item.fontName);
    const href = item.href;
    const last = runs[runs.length - 1];
    if (
      last &&
      Math.abs(last.fontSize - fontSize) < 0.6 &&
      last.bold === bold &&
      last.italic === italic &&
      last.fontFamily === fontFamily &&
      last.href === href
    ) {
      last.text += chunk;
    } else {
      runs.push({ text: chunk, fontSize, bold, italic, fontFamily, href });
    }
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const piece = item.str;
    if (!piece) continue;

    if (i === 0) {
      text += piece;
      flushRun(item, piece);
      continue;
    }

    const prev = items[i - 1];
    const gap = item.x - (prev.x + prev.width);
    const threshold = spaceGapThreshold(Math.max(prev.height, item.height, 10));

    let spacer = "";
    if (gap > threshold * 4) {
      spacer = "\t";
    } else if (gap > threshold) {
      const spaceWidth = Math.max((prev.height || 11) * 0.35, 2);
      const count = Math.min(8, Math.max(1, Math.round(gap / spaceWidth)));
      spacer = " ".repeat(count);
    } else if (gap > -0.5 && !piece.startsWith(" ") && !text.endsWith(" ") && !text.endsWith("\t")) {
      if (!/[\s\-\u2013\u2014\/]$/.test(text) && !/^[\s.,;:!?\-\u2013\u2014)]/.test(piece)) {
        if (gap > threshold * 0.35) spacer = " ";
      }
    }

    text += spacer + piece;
    if (spacer) {
      // Keep spacer with the following glyph; inherit link only when both sides share it
      const spacerItem: RawItem =
        prev.href && item.href && prev.href === item.href
          ? { ...item, href: item.href }
          : { ...item, href: undefined };
      flushRun(spacerItem, spacer);
      flushRun(item, piece);
    } else {
      flushRun(item, piece);
    }
  }

  return { text: text.trimEnd(), runs: annotatePlainUrls(runs.filter((r) => r.text.length > 0)) };
}

function median(values: number[]): number {
  if (values.length === 0) return 11;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Extract structured paragraphs from a PDF ArrayBuffer using pdf.js.
 */
export async function extractLayoutText(arrayBuffer: ArrayBuffer): Promise<LayoutExtractionResult> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const paragraphs: LayoutParagraph[] = [];
  const allFontSizes: number[] = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
    const page = await pdf.getPage(pageIndex);
    const [content, pageLinks] = await Promise.all([
      page.getTextContent({ includeMarkedContent: false }),
      extractPageLinks(page),
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
        hasEOL?: boolean;
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
        hasEOL: Boolean(textItem.hasEOL),
      });
      allFontSizes.push(height);
    }

    if (rawItems.length === 0) continue;

    attachLinksToItems(rawItems, pageLinks);

    const medianSize = median(rawItems.map((i) => i.height));
    const yTolerance = Math.max(medianSize * 0.35, 2);
    const lines = clusterLines(rawItems, yTolerance);

    // Page left margin heuristic for indent
    const leftEdges = lines.map((l) => l.items[0]?.x ?? 0).filter((x) => x > 0);
    const pageLeft = leftEdges.length ? Math.min(...leftEdges) : 0;
    const lineGapThreshold = medianSize * 1.65;

    let prevLineY: number | null = null;

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const { text, runs } = joinLineText(line.items);
      if (!text.trim()) continue;

      const fontSize = median(line.items.map((i) => i.height));
      const x = Math.max(0, (line.items[0]?.x ?? 0) - pageLeft);
      const gapBefore =
        prevLineY === null ? 0 : Math.max(0, prevLineY - line.y - fontSize);

      // Merge into previous paragraph when vertical gap is small and indent is similar
      const prev = paragraphs[paragraphs.length - 1];
      const samePage = prev && prev.pageNumber === pageIndex;
      const shouldMerge =
        samePage &&
        prevLineY !== null &&
        gapBefore < lineGapThreshold * 0.55 &&
        Math.abs(prev.x - x) < medianSize * 1.2 &&
        Math.abs(prev.fontSize - fontSize) < 1.5 &&
        !prev.runs.some((r) => r.text.endsWith("\n"));

      if (shouldMerge && prev) {
        prev.runs.push({ text: " ", fontSize: prev.fontSize, bold: false, italic: false, fontFamily: "Calibri" });
        for (const run of runs) prev.runs.push(run);
      } else {
        paragraphs.push({
          runs,
          x,
          y: line.y,
          fontSize,
          gapBefore: prevLineY === null ? 0 : gapBefore,
          pageBreakBefore: pageIndex > 1 && prevLineY === null,
          pageNumber: pageIndex,
        });
      }

      prevLineY = line.y;
    }
  }

  const bodyFontSize = median(allFontSizes.filter((s) => s >= 8 && s <= 14)) || median(allFontSizes) || 11;
  const hasText = paragraphs.some((p) => p.runs.some((r) => r.text.trim().length > 0));

  return {
    paragraphs,
    pageCount: pdf.numPages,
    bodyFontSize,
    hasText,
  };
}
