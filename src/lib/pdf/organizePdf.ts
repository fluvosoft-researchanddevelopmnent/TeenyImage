import { PDFDocument, degrees } from "pdf-lib";

export type OrganizedPage = {
  /** Stable id for React keys / drag */
  id: string;
  /** Original page index in the source PDF (null = blank inserted page) */
  sourceIndex: number | null;
  rotation: 0 | 90 | 180 | 270;
  /** Blank page size in PDF points when sourceIndex is null */
  blankWidth?: number;
  blankHeight?: number;
};

/**
 * Rebuild a PDF from an ordered list of pages (reorder / delete / rotate / blank inserts).
 */
export async function buildOrganizedPdf(
  sourceBytes: ArrayBuffer,
  pages: OrganizedPage[]
): Promise<Blob> {
  if (pages.length === 0) {
    throw new Error("Add at least one page before saving.");
  }

  const src = await PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
  });
  const out = await PDFDocument.create();

  for (const item of pages) {
    if (item.sourceIndex === null) {
      const w = item.blankWidth || 612;
      const h = item.blankHeight || 792;
      const page = out.addPage([w, h]);
      if (item.rotation) page.setRotation(degrees(item.rotation));
      continue;
    }

    const [copied] = await out.copyPages(src, [item.sourceIndex]);
    if (item.rotation) {
      const current = copied.getRotation().angle || 0;
      copied.setRotation(degrees((current + item.rotation) % 360));
    }
    out.addPage(copied);
  }

  const saved = await out.save({ useObjectStreams: true });
  const copy = new Uint8Array(saved.byteLength);
  copy.set(saved);
  return new Blob([copy], { type: "application/pdf" });
}

export function createPageId(): string {
  return `pg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
