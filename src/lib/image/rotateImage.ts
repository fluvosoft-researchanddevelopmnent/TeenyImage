/**
 * rotateImage.ts
 * Pure, client-side rotate logic for the Rotate Image tool (@shafinSI scope).
 * 100% Canvas API — no network calls, no server involvement.
 */

/**
 * Rotates `file` by `degrees` (positive = clockwise). Any angle is supported,
 * including non-multiples of 90 — the canvas is automatically resized to fit
 * the full rotated bounding box so no corners are clipped.
 */
export async function rotateImage(file: File, degrees: number): Promise<Blob> {
  if (!Number.isFinite(degrees)) {
    throw new Error("Rotation angle must be a number.");
  }

  const normalized = ((degrees % 360) + 360) % 360;
  const radians = (normalized * Math.PI) / 180;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { naturalWidth: w, naturalHeight: h } = img;

    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const newWidth = Math.round(w * cos + h * sin);
    const newHeight = Math.round(w * sin + h * cos);

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is not available in this browser.");
    }

    ctx.translate(newWidth / 2, newHeight / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -w / 2, -h / 2);

    const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/png";
    const blob = await canvasToBlob(canvas, mimeType);

    canvas.width = 0;
    canvas.height = 0;

    return blob;
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
        else reject(new Error("Failed to export the rotated image."));
      },
      type,
      quality
    );
  });
}
