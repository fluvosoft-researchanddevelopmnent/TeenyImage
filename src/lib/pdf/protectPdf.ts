import * as pdfLib from "pdf-lib";
import { configure, lock } from "pdf-lib-encrypt";

let configured = false;

function ensureConfigured() {
  if (!configured) {
    configure(pdfLib);
    configured = true;
  }
}

/**
 * Encrypt a PDF with an open (user) password using AES-256.
 */
export async function protectPdf(
  sourceBytes: ArrayBuffer,
  password: string
): Promise<Blob> {
  if (!password.trim()) {
    throw new Error("Password is required.");
  }

  ensureConfigured();

  // Re-save once without object streams so encryption can be applied cleanly
  const doc = await pdfLib.PDFDocument.load(sourceBytes.slice(0), {
    ignoreEncryption: true,
  });
  if (doc.isEncrypted) {
    throw new Error(
      "This PDF is already password-protected. Unlock it first, then protect it again."
    );
  }

  const plain = await doc.save({ useObjectStreams: false });
  const encrypted = await lock(plain, password);

  const copy = new Uint8Array(encrypted.byteLength);
  copy.set(encrypted);
  return new Blob([copy], { type: "application/pdf" });
}
