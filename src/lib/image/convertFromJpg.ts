/**
 * Converts one or more JPG files to PNG, WEBP, GIF, or an Animated GIF.
 * GIF encoding uses gifenc (client-side, zero server calls).
 * 100% in-browser — files never leave the device.
 */

import { GIFEncoder, quantize, applyPalette } from "gifenc";

export type JpgTargetFormat = "png" | "webp" | "gif" | "animated-gif";

export interface ConvertFromJpgResult {
  blob: Blob;
  fileName: string;
}

const FRAME_DELAY_MS = 500;

export async function convertFromJpg(
  files: File[],
  targetFormat: JpgTargetFormat
): Promise<ConvertFromJpgResult> {
  const invalid = files.find((f) => f.type !== "image/jpeg");
  if (invalid) {
    throw new Error(`"${invalid.name}" isn't a JPG/JPEG file.`);
  }

  if (targetFormat === "animated-gif") {
    if (files.length < 2) {
      throw new Error("Please select at least 2 JPG files to create an animated GIF.");
    }
    return buildAnimatedGif(files);
  }

  // Single-frame formats only use the first selected file.
  const file = files[0];
  if (!file) {
    throw new Error("Please select a JPG file.");
  }

  const canvas = await loadImageToCanvas(file);

  if (targetFormat === "gif") {
    const blob = staticCanvasToGif(canvas);
    return { blob, fileName: replaceExtension(file.name, "gif") };
  }

  const mimeType = targetFormat === "png" ? "image/png" : "image/webp";
  const blob = await canvasToBlob(canvas, mimeType);
  return { blob, fileName: replaceExtension(file.name, targetFormat) };
}

async function buildAnimatedGif(files: File[]): Promise<ConvertFromJpgResult> {
  const canvases = await Promise.all(files.map(loadImageToCanvas));

  // Normalize every frame to the first frame's dimensions so the GIF
  // doesn't warp — resize any mismatched frames to match.
  const { width, height } = canvases[0];
  const gif = GIFEncoder();

  for (const canvas of canvases) {
    const frameCanvas = normalizeFrameSize(canvas, width, height);
    const ctx = frameCanvas.getContext("2d")!;
    const { data } = ctx.getImageData(0, 0, width, height);

    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, width, height, { palette, delay: FRAME_DELAY_MS });
  }

  gif.finish();

  const blob = new Blob([gif.bytesView()], { type: "image/gif" });
  return { blob, fileName: `animated_${Date.now()}.gif` };
}

function staticCanvasToGif(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const palette = quantize(data, 256);
  const index = applyPalette(data, palette);

  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, { palette });
  gif.finish();

  return new Blob([gif.bytesView()], { type: "image/gif" });
}

function normalizeFrameSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): HTMLCanvasElement {
  if (canvas.width === width && canvas.height === height) {
    return canvas;
  }

  const resized = document.createElement("canvas");
  resized.width = width;
  resized.height = height;
  const ctx = resized.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, width, height);
  return resized;
}

function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas context could not be initialized"));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load "${file.name}" — file may be corrupt or unsupported`));
    };

    img.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to encode the converted image"));
      }
    }, type);
  });
}

function replaceExtension(fileName: string, newExt: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot === -1 ? fileName : fileName.slice(0, lastDot);
  return `${base}.${newExt}`;
}