/**
 * Converts a single image file to PNG format losslessly using the Canvas API.
 * Supports JPG, WEBP, GIF, BMP, ICO, and SVG as source formats.
 * 100% client-side — the file never leaves the browser.
 */

export interface ConvertToPngResult {
  blob: Blob;
  fileName: string;
}

export async function convertToPng(file: File): Promise<ConvertToPngResult> {
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

    ctx.drawImage(image, 0, 0);

    const blob = await canvasToBlob(canvas);
    const fileName = replaceExtension(file.name, "png");

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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to encode PNG"));
      }
    }, "image/png");
  });
}

function replaceExtension(fileName: string, newExt: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
  return `${base}.${newExt}`;
}