/**
 * Converts a single image file to JPG format client-side using the Canvas API.
 * Supports PNG, GIF, WEBP, BMP, ICO, and SVG as source formats.
 * (TIF and HEIC are not natively decodable by <img>/Canvas in browsers —
 * see note below.) 100% in-browser — the file never leaves the device.
 */

export interface ConvertToJpgResult {
  blob: Blob;
  fileName: string;
}

const UNSUPPORTED_TYPES = ["image/tiff", "image/heic", "image/heif"];

export async function convertToJpg(
  file: File,
  quality: number
): Promise<ConvertToJpgResult> {
  if (UNSUPPORTED_TYPES.includes(file.type)) {
    throw new Error(
      "TIF and HEIC files can't be decoded directly by the browser. Please convert this file to PNG or JPG first."
    );
  }

  const clampedQuality = Math.min(100, Math.max(1, quality)) / 100;
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context could not be initialized");
    }

    // JPG has no alpha channel — flatten onto a white background first,
    // otherwise transparent PNGs/WEBPs turn black in the output.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const blob = await canvasToBlob(canvas, clampedQuality);
    const fileName = replaceExtension(file.name, "jpg");

    return { blob, fileName };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Failed to load image — file may be corrupt or unsupported"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to encode JPG"));
        }
      },
      "image/jpeg",
      quality
    );
  });
}

function replaceExtension(fileName: string, newExt: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
  return `${base}.${newExt}`;
}