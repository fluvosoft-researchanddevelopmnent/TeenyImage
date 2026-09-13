/**
 * Compresses a single image file client-side using browser-image-compression.
 * Supports JPG, PNG, SVG, GIF, and WEBP.
 * 100% in-browser — the file never leaves the device.
 */

import imageCompression from "browser-image-compression";

export type CompressQuality = "strong" | "recommended" | "high";

export interface CompressImageResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
}

const QUALITY_SETTINGS: Record<
  CompressQuality,
  { maxSizeMB: number; initialQuality: number }
> = {
  strong: { maxSizeMB: 0.5, initialQuality: 0.5 },
  recommended: { maxSizeMB: 1.5, initialQuality: 0.75 },
  high: { maxSizeMB: 4, initialQuality: 0.9 },
};

export async function compressImage(
  file: File,
  quality: CompressQuality
): Promise<CompressImageResult> {
  // SVG isn't handled by browser-image-compression (it's raster-focused) —
  // pass it through unchanged since vector files don't benefit from this pipeline.
  if (file.type === "image/svg+xml") {
    return {
      blob: file,
      fileName: file.name,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
    };
  }

  const settings = QUALITY_SETTINGS[quality];

  const compressedFile = await imageCompression(file, {
    maxSizeMB: settings.maxSizeMB,
    initialQuality: settings.initialQuality,
    useWebWorker: true,
  });

  const reductionPercent = Math.max(
    0,
    Math.round(((file.size - compressedFile.size) / file.size) * 100)
  );

  return {
    blob: compressedFile,
    fileName: buildFileName(file.name),
    originalSize: file.size,
    compressedSize: compressedFile.size,
    reductionPercent,
  };
}

function buildFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base = lastDot === -1 ? originalName : originalName.slice(0, lastDot);
  const ext = lastDot === -1 ? "" : originalName.slice(lastDot);
  return `${base}_compressed${ext}`;
}