/**
 * cropImage.ts
 * Pure, client-side crop logic for the Crop Image tool (@shafinSI scope).
 * 100% Canvas API — no network calls, no server involvement.
 */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crops `file` to the given pixel rectangle (relative to the image's
 * natural/original dimensions) and returns the result as a Blob.
 */
export async function cropImage(file: File, rect: CropRect): Promise<Blob> {
  const { x, y, width, height } = rect;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error("Crop width and height must be positive numbers.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);

    // Clamp the crop rect to the image bounds so a bad manual input
    // (e.g. from the X/Y/W/H fields) can never throw or produce a blank canvas.
    const clampedX = clamp(x, 0, img.naturalWidth);
    const clampedY = clamp(y, 0, img.naturalHeight);
    const clampedWidth = clamp(width, 1, img.naturalWidth - clampedX);
    const clampedHeight = clamp(height, 1, img.naturalHeight - clampedY);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(clampedWidth);
    canvas.height = Math.round(clampedHeight);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is not available in this browser.");
    }

    ctx.drawImage(
      img,
      clampedX,
      clampedY,
      clampedWidth,
      clampedHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/png";
    const blob = await canvasToBlob(canvas, mimeType);

    // Memory cleanup per AGENTS.md
    canvas.width = 0;
    canvas.height = 0;

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Reads the natural pixel dimensions of an image file without cropping it. */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not load this image. The file may be corrupt or in an unsupported format."));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export the cropped image."));
      },
      type,
      quality
    );
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
