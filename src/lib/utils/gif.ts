import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { createCanvas, cleanupCanvas } from "./image";

export interface GifFrameOptions {
  /** Delay per frame in milliseconds (default 500ms) */
  delay?: number;
  /** Max colors in palette (default 256) */
  maxColors?: number;
  /** Width override (optional, defaults to first frame's width) */
  width?: number;
  /** Height override (optional, defaults to first frame's height) */
  height?: number;
  /** Number of loops (0 = infinite loop, default 0) */
  repeat?: number;
}

/**
 * Encodes multiple HTMLImageElements or Canvas elements into an animated GIF.
 * 100% client-side via gifenc WebAssembly/JS engine.
 */
export async function createAnimatedGif(
  images: (HTMLImageElement | HTMLCanvasElement)[],
  options: GifFrameOptions = {}
): Promise<Blob> {
  if (!images || images.length === 0) {
    throw new Error("At least one image frame is required to create a GIF.");
  }

  const { delay = 500, maxColors = 256, repeat = 0 } = options;

  const targetWidth = options.width || images[0].width;
  const targetHeight = options.height || images[0].height;

  const gif = GIFEncoder();
  const { canvas, ctx } = createCanvas(targetWidth, targetHeight);

  for (const img of images) {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const { data } = imageData;

    const palette = quantize(data, maxColors);
    const index = applyPalette(data, palette);

    gif.writeFrame(index, targetWidth, targetHeight, {
      palette,
      delay,
      repeat: repeat === 0 ? 0 : undefined,
    });
  }

  gif.finish();
  cleanupCanvas(canvas);

  const bytes = gif.bytes();
  return new Blob([new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) as BlobPart], {
    type: "image/gif",
  });
}
