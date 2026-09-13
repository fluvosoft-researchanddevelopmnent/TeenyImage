/**
 * Converts raw HTML (typed or uploaded as a .html file) into a JPG or PNG
 * image client-side using the shared renderHtmlToImage utility (html2canvas
 * under the hood). 100% in-browser — content never leaves the device.
 */

import { renderHtmlToImage } from "@/lib/utils/htmlRender";

export type HtmlOutputFormat = "jpg" | "png";

export interface HtmlToImageResult {
  blob: Blob;
  fileName: string;
}

export async function convertHtmlToImage(
  htmlContent: string,
  outputFormat: HtmlOutputFormat
): Promise<HtmlToImageResult> {
  if (!htmlContent || !htmlContent.trim()) {
    throw new Error("Please paste some HTML or upload an .html file.");
  }

  const mimeType = outputFormat === "png" ? "image/png" : "image/jpeg";

  const { blob } = await renderHtmlToImage(htmlContent, {
    format: mimeType,
    quality: 0.92,
  });

  const fileName = `HTML_Converted_${Date.now()}.${outputFormat}`;

  return { blob, fileName };
}