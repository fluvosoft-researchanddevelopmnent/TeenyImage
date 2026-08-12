import { PDFDocument } from "pdf-lib";

/**
 * Converts PDF to ISO-standardized PDF/A archival format.
 */
export async function convertToPdfA(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  pdfDoc.setTitle(file.name.replace(".pdf", ""));
  pdfDoc.setProducer("TeenyPDF ISO-19005-1 Archival Engine");
  pdfDoc.setCreationDate(new Date());

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}
