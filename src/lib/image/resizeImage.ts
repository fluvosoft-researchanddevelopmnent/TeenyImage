/**
 * Resizes a single image file client-side using the Canvas API.
 * Supports JPG, PNG, GIF (SVG is resized via its intrinsic dimensions too).
 * 100% in-browser — the file never leaves the device.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ResizeImageResult {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
}

export function getImageDimensions(file: File): Promise<ImageDimensions> {
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

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<ResizeImageResult> {
  if (targetWidth <= 0 || targetHeight <= 0) {
    throw new Error("Width and height must be greater than zero");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(targetWidth);
    canvas.height = Math.round(targetHeight);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas context could not be initialized");
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType);
    const fileName = buildFileName(file.name);

    return { blob, fileName, width: canvas.width, height: canvas.height };
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
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to encode resized image"));
      }
    }, type, 0.92);
  });
}

function buildFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot === -1 ? originalName : originalName.slice(0, lastDot);
  const ext = lastDot === -1 ? "" : originalName.slice(lastDot);
  return `${base}_resized${ext}`;
}