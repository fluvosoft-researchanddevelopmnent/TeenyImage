import { PDFDocument } from "pdf-lib";

/**
 * Best-effort PDF → PDF/A conversion for long-term archiving.
 * Rewrites the document with archival Info metadata (PDF/A-oriented).
 * Full ISO conformance also needs embedded fonts / ICC profiles that many
 * source files lack; this produces a clean archive-ready PDF for everyday use.
 */
export async function convertToPdfA(
  sourceBytes: ArrayBuffer,
  fileName = "document.pdf"
): Promise<{ blob: Blob; pageCount: number }> {
  const src = await PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
  });

  if (src.isEncrypted) {
    throw new Error(
      "This PDF is password-protected. Unlock it first, then convert to PDF/A."
    );
  }

  // Copy pages into a fresh doc so damaged cross-refs / junk trailers are dropped
  const out = await PDFDocument.create();
  const indices = src.getPageIndices();
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));

  const title = fileName.replace(/\.pdf$/i, "") || "Document";
  const now = new Date();
  out.setTitle(title);
  out.setSubject("PDF/A archival document");
  out.setKeywords(["PDF/A", "archive", "TeenyPDF"]);
  out.setProducer("TeenyPDF PDF/A Archival Engine");
  out.setCreator("TeenyPDF");
  out.setCreationDate(now);
  out.setModificationDate(now);

  const pageCount = out.getPageCount();
  const saved = await out.save({ useObjectStreams: false });
  const copy = new Uint8Array(saved.byteLength);
  copy.set(saved);
  return {
    blob: new Blob([copy], { type: "application/pdf" }),
    pageCount,
  };
}
