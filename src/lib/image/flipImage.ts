/**
 * flipImage.ts
 * Pure, client-side flip logic for the Flip Image tool (@shafinSI scope).
 * 100% Canvas API — no network calls, no server involvement.
 */

export type FlipDirection = "horizontal" | "vertical";

export async function flipImage(file: File, direction: FlipDirection): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { naturalWidth: w, naturalHeight: h } = img;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is not available in this browser.");
    }

    if (direction === "horizontal") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, h);
      ctx.scale(1, -1);
    }

    ctx.drawImage(img, 0, 0);

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
        else reject(new Error("Failed to export the flipped image."));
      },
      type,
      quality
    );
  });
}
