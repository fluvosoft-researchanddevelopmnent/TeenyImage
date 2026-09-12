/**
 * Pure client-side image and canvas utility functions for TeenyImage
 * 100% browser-based with memory safety.
 */

/**
 * Loads a File, Blob, or URL into an HTMLImageElement with safe error handling and CORS support.
 */
export function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    let url: string;
    let isCreatedUrl = false;

    if (typeof source === "string") {
      url = source;
    } else {
      url = URL.createObjectURL(source);
      isCreatedUrl = true;
    }

    img.onload = () => {
      if (isCreatedUrl) {
        URL.revokeObjectURL(url);
      }
      resolve(img);
    };

    img.onerror = () => {
      if (isCreatedUrl) {
        URL.revokeObjectURL(url);
      }
      reject(new Error("Failed to load image. The file may be corrupt or an unsupported format."));
    };

    img.src = url;
  });
}

/**
 * Creates an HTMLCanvasElement with 2D rendering context.
 */
export function createCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Could not initialize 2D Canvas context.");
  }

  return { canvas, ctx };
}

/**
 * Converts a Canvas to a Blob wrapped in a Promise with fallback for unsupported formats.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string = "image/png",
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback: convert dataURL to Blob
            try {
              const dataUrl = canvas.toDataURL(mimeType, quality);
              const byteString = atob(dataUrl.split(",")[1]);
              const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              resolve(new Blob([ab], { type: mimeString }));
            } catch (fallbackErr) {
              reject(new Error(`Failed to export canvas as ${mimeType}: ${fallbackErr}`));
            }
          }
        },
        mimeType,
        quality
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Converts canvas to data URL string.
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: string = "image/png",
  quality: number = 0.92
): string {
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Releases canvas GPU/VRAM texture memory by setting dimensions to 0.
 */
export function cleanupCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/**
 * Formats byte size into human readable string (e.g. "1.42 MB", "820 KB").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Extracts lowercase file extension (e.g. "png", "jpg", "webp").
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length <= 1) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Extracts file name without extension (e.g. "my-photo" from "my-photo.png").
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
}

/**
 * Calculates new dimensions fitting within max bounds while preserving aspect ratio.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.round(srcWidth * ratio),
    height: Math.round(srcHeight * ratio),
  };
}
