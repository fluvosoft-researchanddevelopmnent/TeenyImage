/**
 * exportEditedImage.ts
 * Flattens the base image plus every editor layer onto a single canvas and
 * exports it as a Blob. Pure client-side — Canvas API only.
 */

import type { EditorDocument, EditorLayer } from "./types";

export async function exportEditedImage(
  doc: EditorDocument,
  mimeType: string = "image/png",
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = doc.baseWidth;
  canvas.height = doc.baseHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not available in this browser.");
  }

  const baseImg = await loadImage(doc.baseImageSrc);
  ctx.drawImage(baseImg, 0, 0, doc.baseWidth, doc.baseHeight);

  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    await drawLayer(ctx, layer);
  }

  const blob = await canvasToBlob(canvas, mimeType, quality);

  canvas.width = 0;
  canvas.height = 0;

  return blob;
}

async function drawLayer(ctx: CanvasRenderingContext2D, layer: EditorLayer): Promise<void> {
  ctx.save();

  switch (layer.type) {
    case "path": {
      if (layer.points.length < 2) {
        ctx.restore();
        return;
      }
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = layer.strokeWidth;

      if (layer.kind === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = layer.kind === "highlighter" ? 0.35 : 1;
        ctx.strokeStyle = layer.color;
      }

      ctx.beginPath();
      ctx.moveTo(layer.points[0].x, layer.points[0].y);
      for (const pt of layer.points.slice(1)) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      break;
    }
    case "shape": {
      ctx.strokeStyle = layer.color;
      ctx.fillStyle = layer.color;
      ctx.lineWidth = layer.strokeWidth;
      drawShape(ctx, layer.shape, layer.start, layer.end);
      break;
    }
    case "text": {
      ctx.fillStyle = layer.color;
      ctx.font = `${layer.fontSize}px sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(layer.text, layer.position.x, layer.position.y);
      break;
    }
    case "image": {
      const img = await loadImage(layer.src);
      ctx.drawImage(img, layer.position.x, layer.position.y, layer.width, layer.height);
      break;
    }
    default:
      break;
  }

  ctx.restore();
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: "rect" | "circle" | "triangle" | "line" | "arrow",
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);

  switch (shape) {
    case "rect":
      ctx.strokeRect(x, y, w, h);
      break;
    case "circle": {
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "triangle": {
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "line": {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      break;
    }
    case "arrow": {
      const headLength = 12;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 6),
        end.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 6),
        end.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      break;
    }
    default:
      break;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load an image layer used in this edit."));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export the edited image."));
      },
      type,
      quality
    );
  });
}
