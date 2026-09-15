/**
 * watermarkImage.ts
 * Pure, client-side watermark logic for the Watermark Image tool (@shafinSI scope).
 * 100% Canvas API — no network calls, no server involvement.
 */

export type WatermarkPosition = "TL" | "TC" | "TR" | "ML" | "MC" | "MR" | "BL" | "BC" | "BR";

interface BaseWatermarkOptions {
  position: WatermarkPosition;
  /** 0 to 100 */
  opacity: number;
  /** Padding, in px, from the edges of the image. */
  margin?: number;
}

export interface TextWatermarkOptions extends BaseWatermarkOptions {
  type: "text";
  text: string;
  color: string;
  fontSize: number;
}

export interface ImageWatermarkOptions extends BaseWatermarkOptions {
  type: "image";
  watermarkFile: File;
  /** Watermark width as a fraction (0-1) of the base image's width. */
  scale?: number;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

export async function watermarkImage(file: File, options: WatermarkOptions): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context is not available in this browser.");
    }

    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = Math.min(Math.max(options.opacity, 0), 100) / 100;

    const margin = options.margin ?? 24;

    if (options.type === "text") {
      ctx.fillStyle = options.color;
      ctx.font = `${options.fontSize}px sans-serif`;
      const metrics = ctx.measureText(options.text);
      const textWidth = metrics.width;
      const textHeight = options.fontSize;
      const { x, y } = resolvePosition(options.position, canvas.width, canvas.height, textWidth, textHeight, margin);
      ctx.textBaseline = "top";
      ctx.fillText(options.text, x, y);
    } else {
      const wmObjectUrl = URL.createObjectURL(options.watermarkFile);
      try {
        const wmImg = await loadImage(wmObjectUrl);
        const scale = options.scale ?? 0.25;
        const wmWidth = canvas.width * scale;
        const wmHeight = wmImg.naturalHeight * (wmWidth / wmImg.naturalWidth);
        const { x, y } = resolvePosition(options.position, canvas.width, canvas.height, wmWidth, wmHeight, margin);
        ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
      } finally {
        URL.revokeObjectURL(wmObjectUrl);
      }
    }

    ctx.globalAlpha = 1;

    const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/png";
    const blob = await canvasToBlob(canvas, mimeType);

    canvas.width = 0;
    canvas.height = 0;

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function resolvePosition(
  position: WatermarkPosition,
  canvasWidth: number,
  canvasHeight: number,
  elementWidth: number,
  elementHeight: number,
  margin: number
): { x: number; y: number } {
  const left = margin;
  const centerX = (canvasWidth - elementWidth) / 2;
  const right = canvasWidth - elementWidth - margin;

  const top = margin;
  const centerY = (canvasHeight - elementHeight) / 2;
  const bottom = canvasHeight - elementHeight - margin;

  const map: Record<WatermarkPosition, { x: number; y: number }> = {
    TL: { x: left, y: top },
    TC: { x: centerX, y: top },
    TR: { x: right, y: top },
    ML: { x: left, y: centerY },
    MC: { x: centerX, y: centerY },
    MR: { x: right, y: centerY },
    BL: { x: left, y: bottom },
    BC: { x: centerX, y: bottom },
    BR: { x: right, y: bottom },
  };

  return map[position];
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
        else reject(new Error("Failed to export the watermarked image."));
      },
      type,
      quality
    );
  });
}
