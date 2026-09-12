/**
 * Upscales a single image file client-side using the Canvas API's
 * built-in bicubic-like interpolation (imageSmoothingQuality: "high").
 * Supports JPG and PNG. 100% in-browser — the file never leaves the device.
 *
 * Note: this is Canvas-based scaling, not AI super-resolution — that is
 * called out in the PRD as a future enhancement.
 */

export type UpscaleFactor = 2 | 4;

export interface UpscaleImageResult {
  blob: Blob;
  fileName: string;
  originalWidth: number;
  originalHeight: number;
  upscaledWidth: number;
  upscaledHeight: number;
}

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to read image dimensions — file may be corrupt"));
    };
    img.src = objectUrl;
  });
}

export async function upscaleImage(
  file: File,
  factor: UpscaleFactor
): Promise<UpscaleImageResult> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);

    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    const upscaledWidth = originalWidth * factor;
    const upscaledHeight = originalHeight * factor;

    const canvas = document.createElement("canvas");
    canvas.width = upscaledWidth;
    canvas.height = upscaledHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context could not be initialized");
    }

    // Step up in 2x increments for smoother results than a single huge jump,
    // and enable the browser's highest-quality resampling.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (factor === 4) {
      const midCanvas = document.createElement("canvas");
      midCanvas.width = originalWidth * 2;
      midCanvas.height = originalHeight * 2;
      const midCtx = midCanvas.getContext("2d");
      if (!midCtx) {
        throw new Error("Canvas context could not be initialized");
      }
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = "high";
      midCtx.drawImage(image, 0, 0, midCanvas.width, midCanvas.height);
      ctx.drawImage(midCanvas, 0, 0, upscaledWidth, upscaledHeight);
    } else {
      ctx.drawImage(image, 0, 0, upscaledWidth, upscaledHeight);
    }

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType);
    const fileName = buildFileName(file.name);

    return {
      blob,
      fileName,
      originalWidth,
      originalHeight,
      upscaledWidth,
      upscaledHeight,
    };
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

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to encode upscaled image"));
        }
      },
      type,
      0.92
    );
  });
}

function buildFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot === -1 ? originalName : originalName.slice(0, lastDot);
  const ext = lastDot === -1 ? "" : originalName.slice(lastDot);
  return `${base}_upscaled${ext}`;
}