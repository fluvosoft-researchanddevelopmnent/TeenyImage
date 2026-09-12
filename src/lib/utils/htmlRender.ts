import html2canvas from "html2canvas";
import { canvasToBlob } from "./image";

export interface HtmlRenderOptions {
  width?: number;
  height?: number;
  scale?: number;
  format?: "image/png" | "image/jpeg";
  quality?: number;
}

/**
 * Renders an HTML string or HTMLElement into a canvas or image Blob.
 * 100% in-browser rendering via html2canvas.
 */
export async function renderHtmlToImage(
  htmlContent: string,
  options: HtmlRenderOptions = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const { scale = 2, format = "image/png", quality = 0.92 } = options;

  // Create an isolated sandbox container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-99999px";
  container.style.left = "-99999px";
  container.style.width = options.width ? `${options.width}px` : "800px";
  container.style.background = "#ffffff";
  container.style.zIndex = "-1";
  container.innerHTML = htmlContent;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const blob = await canvasToBlob(canvas, format, quality);
    return {
      blob,
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
