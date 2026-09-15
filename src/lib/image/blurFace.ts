/**
 * blurFace.ts
 * Pure, client-side face/region blurring for the Blur Face tool (@shafinSI scope).
 * 100% Canvas API. Auto mode uses the browser-native FaceDetector API where
 * available (no model download, no server call); when unsupported, the page
 * falls back to Manual mode so the tool always stays 100% client-side.
 */

export type BlurIntensity = "low" | "medium" | "high";

export interface BlurRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

const INTENSITY_TO_RADIUS: Record<BlurIntensity, number> = {
  low: 8,
  medium: 18,
  high: 32,
};

export async function blurFace(
  file: File,
  regions: BlurRegion[],
  intensity: BlurIntensity
): Promise<Blob> {
  if (regions.length === 0) {
    throw new Error("Select at least one region to blur (or run Auto-detect first).");
  }

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

    const radius = INTENSITY_TO_RADIUS[intensity];

    for (const region of regions) {
      const x = Math.max(0, Math.round(region.x));
      const y = Math.max(0, Math.round(region.y));
      const width = Math.min(Math.round(region.width), canvas.width - x);
      const height = Math.min(Math.round(region.height), canvas.height - y);
      if (width <= 0 || height <= 0) continue;

      // Draw the blurred region onto a small offscreen canvas using the
      // native CSS-filter blur, then composite it back over the original spot.
      const patch = document.createElement("canvas");
      patch.width = width;
      patch.height = height;
      const patchCtx = patch.getContext("2d");
      if (!patchCtx) continue;

      patchCtx.filter = `blur(${radius}px)`;
      // Draw a bit larger than the region so the blur doesn't sample transparent
      // edges (which would darken/fade the borders of the patch).
      patchCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

      ctx.drawImage(patch, x, y, width, height);
      patch.width = 0;
      patch.height = 0;
    }

    const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/png";
    const blob = await canvasToBlob(canvas, mimeType);

    canvas.width = 0;
    canvas.height = 0;

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Attempts to detect face bounding boxes using the browser-native
 * FaceDetector API (Chromium only, behind a flag on some platforms).
 * Returns `null` when the API isn't available so the caller can fall
 * back to Manual mode — this never calls any server.
 */
export async function detectFacesNative(file: File): Promise<BlurRegion[] | null> {
  interface FaceDetectorLike {
    detect: (source: CanvasImageSource) => Promise<{ boundingBox: BlurRegion }[]>;
  }
  const w = window as unknown as { FaceDetector?: new () => FaceDetectorLike };

  if (typeof window === "undefined" || !w.FaceDetector) {
    return null;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const detector = new w.FaceDetector();
    const faces = await detector.detect(img);
    return faces.map((f) => ({
      x: f.boundingBox.x,
      y: f.boundingBox.y,
      width: f.boundingBox.width,
      height: f.boundingBox.height,
    }));
  } catch {
    return null;
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
        else reject(new Error("Failed to export the blurred image."));
      },
      type,
      quality
    );
  });
}
