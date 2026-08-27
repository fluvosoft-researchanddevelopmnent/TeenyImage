import { convertToPdfA as convertBytesToPdfA } from "./convertToPdfA";

/**
 * Converts PDF to an archive-oriented PDF/A-style document.
 * @deprecated Prefer convertToPdfA from convertToPdfA.ts with ArrayBuffer.
 */
export async function convertToPdfA(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const { blob } = await convertBytesToPdfA(arrayBuffer, file.name);
  return blob;
}
