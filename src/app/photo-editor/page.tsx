"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MousePointer2,
  Type as TypeIcon,
  Pencil,
  Highlighter,
  Square,
  Circle,
  Triangle,
  Minus,
  MoveUpRight,
  Eraser,
  ImagePlus,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  Trash2,
  Download,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import type { EditorLayer, EditorToolId, Point } from "@/lib/image/photoEditor/types";
import { SWATCH_COLORS } from "@/lib/image/photoEditor/types";
import { exportEditedImage } from "@/lib/image/photoEditor/exportEditedImage";

let idCounter = 0;
const nextId = () => `layer_${Date.now()}_${idCounter++}`;

const TOOLS: { id: EditorToolId; label: string; icon: React.ElementType }[] = [
  { id: "select", label: "Select / Hand", icon: MousePointer2 },
  { id: "text", label: "Text", icon: TypeIcon },
  { id: "pencil", label: "Pencil", icon: Pencil },
  { id: "highlighter", label: "Highlighter", icon: Highlighter },
  { id: "shape-rect", label: "Rectangle", icon: Square },
  { id: "shape-circle", label: "Circle", icon: Circle },
  { id: "shape-triangle", label: "Triangle", icon: Triangle },
  { id: "shape-line", label: "Line", icon: Minus },
  { id: "shape-arrow", label: "Arrow", icon: MoveUpRight },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "image", label: "Add Image", icon: ImagePlus },
];

export default function PhotoEditorPage() {
  // --- Document state ---
  const [baseImageSrc, setBaseImageSrc] = useState<string | null>(null);
  const [baseWidth, setBaseWidth] = useState(0);
  const [baseHeight, setBaseHeight] = useState(0);
  const [sourceFileName, setSourceFileName] = useState("edited_image");
  const [sourceExt, setSourceExt] = useState("png");

  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [history, setHistory] = useState<EditorLayer[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // --- Tool state ---
  const [activeTool, setActiveTool] = useState<EditorToolId>("select");
  const [color, setColor] = useState<string>(SWATCH_COLORS[2]);
  const [customColor, setCustomColor] = useState<string>(SWATCH_COLORS[2]);
  const [fontSize, setFontSize] = useState(28);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [zoom, setZoom] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // --- Transient drawing state (not committed to layers until pointer up) ---
  const drawing = useRef<EditorLayer | null>(null);
  const dragOffset = useRef<Point | null>(null);
  const [pendingText, setPendingText] = useState<{ x: number; y: number } | null>(null);
  const [textDraft, setTextDraft] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageLayerInputRef = useRef<HTMLInputElement>(null);

  // Clean up all object URLs created for image layers + base image on unmount.
  useEffect(() => {
    return () => {
      if (baseImageSrc) URL.revokeObjectURL(baseImageSrc);
      layers.forEach((l) => {
        if (l.type === "image") URL.revokeObjectURL(l.src);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Loading the base image ---
  const handleBaseFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBaseImageSrc(url);
      setBaseWidth(img.naturalWidth);
      setBaseHeight(img.naturalHeight);
      setSourceFileName(file.name.replace(/\.[^/.]+$/, ""));
      setSourceExt(file.name.split(".").pop() || "png");
      setLayers([]);
      setHistory([[]]);
      setHistoryIndex(0);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("This file could not be opened. Please choose a valid JPG, PNG, GIF, or WEBP image.");
    };
    img.src = url;
  };

  // --- History / undo-redo ---
  const commitLayers = useCallback(
    (next: EditorLayer[]) => {
      setLayers(next);
      setHistory((h) => {
        const truncated = h.slice(0, historyIndex + 1);
        return [...truncated, next];
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex]
  );

  const undo = () => {
    if (historyIndex === 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setLayers(history[newIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setLayers(history[newIndex]);
  };

  // --- Canvas rendering (redraw on every state change) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImageSrc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = baseWidth;
    canvas.height = baseHeight;

    const baseImg = new Image();
    baseImg.onload = () => {
      ctx.clearRect(0, 0, baseWidth, baseHeight);
      ctx.drawImage(baseImg, 0, 0, baseWidth, baseHeight);
      const allLayers = drawing.current ? [...layers, drawing.current] : layers;
      renderLayers(ctx, allLayers, selectedLayerId);
    };
    baseImg.src = baseImageSrc;
  }, [baseImageSrc, baseWidth, baseHeight, layers, selectedLayerId]);

  // --- Pointer coordinate helper (accounts for zoom) ---
  const toCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * baseWidth,
      y: ((e.clientY - rect.top) / rect.height) * baseHeight,
    };
  };

  const hitTestLayer = (pt: Point): EditorLayer | null => {
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i];
      if (l.type === "image") {
        if (pt.x >= l.position.x && pt.x <= l.position.x + l.width && pt.y >= l.position.y && pt.y <= l.position.y + l.height) {
          return l;
        }
      } else if (l.type === "text") {
        const approxWidth = l.text.length * l.fontSize * 0.55;
        if (
          pt.x >= l.position.x &&
          pt.x <= l.position.x + approxWidth &&
          pt.y >= l.position.y &&
          pt.y <= l.position.y + l.fontSize * 1.3
        ) {
          return l;
        }
      }
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!baseImageSrc) return;
    const pt = toCanvasPoint(e);

    if (activeTool === "select") {
      const hit = hitTestLayer(pt);
      setSelectedLayerId(hit?.id ?? null);
      if (hit && (hit.type === "image" || hit.type === "text")) {
        dragOffset.current = { x: pt.x - hit.position.x, y: pt.y - hit.position.y };
      }
      return;
    }

    if (activeTool === "text") {
      setPendingText({ x: pt.x, y: pt.y });
      setTextDraft("");
      return;
    }

    if (activeTool === "image") {
      imageLayerInputRef.current?.click();
      return;
    }

    if (activeTool === "pencil" || activeTool === "highlighter" || activeTool === "eraser") {
      drawing.current = {
        id: nextId(),
        type: "path",
        points: [pt],
        color,
        strokeWidth: activeTool === "highlighter" ? strokeWidth * 2.5 : strokeWidth,
        kind: activeTool,
        visible: true,
      };
      return;
    }

    if (activeTool.startsWith("shape-")) {
      const shape = activeTool.replace("shape-", "") as "rect" | "circle" | "triangle" | "line" | "arrow";
      drawing.current = {
        id: nextId(),
        type: "shape",
        shape,
        start: pt,
        end: pt,
        color,
        strokeWidth,
        visible: true,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!baseImageSrc) return;
    const pt = toCanvasPoint(e);

    if (activeTool === "select" && selectedLayerId && dragOffset.current) {
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedLayerId) return l;
          if (l.type === "image" || l.type === "text") {
            return { ...l, position: { x: pt.x - dragOffset.current!.x, y: pt.y - dragOffset.current!.y } };
          }
          return l;
        })
      );
      return;
    }

    const current = drawing.current;
    if (!current) return;

    if (current.type === "path") {
      drawing.current = { ...current, points: [...current.points, pt] };
      forceRedrawTick();
    } else if (current.type === "shape") {
      drawing.current = { ...current, end: pt };
      forceRedrawTick();
    }
  };

  // Small trick to trigger the render effect while a stroke/shape is in progress
  // without committing it to `layers` (and therefore not spamming undo history).
  const [, setTick] = useState(0);
  const forceRedrawTick = () => setTick((t) => t + 1);

  const handlePointerUp = () => {
    if (activeTool === "select") {
      dragOffset.current = null;
      // Selection drags DO get pushed to history so they're undo-able.
      if (selectedLayerId) commitLayers(layers);
      return;
    }
    const current = drawing.current;
    drawing.current = null;
    if (!current) return;

    if (current.type === "path" && current.points.length < 2) return;
    if (
      current.type === "shape" &&
      Math.abs(current.end.x - current.start.x) < 2 &&
      Math.abs(current.end.y - current.start.y) < 2
    ) {
      return;
    }

    commitLayers([...layers, current]);
  };

  const commitPendingText = () => {
    if (!pendingText || !textDraft.trim()) {
      setPendingText(null);
      return;
    }
    commitLayers([
      ...layers,
      {
        id: nextId(),
        type: "text",
        position: pendingText,
        text: textDraft,
        color,
        fontSize,
        visible: true,
      },
    ]);
    setPendingText(null);
    setTextDraft("");
  };

  const handleAddImageLayer = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxDim = Math.min(baseWidth, baseHeight) * 0.4;
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      commitLayers([
        ...layers,
        {
          id: nextId(),
          type: "image",
          position: { x: (baseWidth - width) / 2, y: (baseHeight - height) / 2 },
          width,
          height,
          src: url,
          visible: true,
        },
      ]);
      setActiveTool("select");
    };
    img.src = url;
  };

  // --- Layer panel actions ---
  const moveLayer = (id: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === id);
    if (index === -1) return;
    const swapWith = direction === "up" ? index + 1 : index - 1;
    if (swapWith < 0 || swapWith >= layers.length) return;
    const next = [...layers];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    commitLayers(next);
  };

  const deleteLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    if (target?.type === "image") URL.revokeObjectURL(target.src);
    commitLayers(layers.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleExport = async () => {
    if (!baseImageSrc) return;
    setIsExporting(true);
    setError(null);
    try {
      const mimeType = sourceExt === "png" ? "image/png" : "image/jpeg";
      const blob = await exportEditedImage(
        { baseImageSrc, baseWidth, baseHeight, layers },
        mimeType,
        0.92
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_image.${sourceExt === "png" ? "png" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while exporting your edit.");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedLayer = useMemo(() => layers.find((l) => l.id === selectedLayerId) ?? null, [layers, selectedLayerId]);

  // --- Upload screen (before an image is loaded) ---
  if (!baseImageSrc) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-surface p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-brand">
            <ImagePlus size={26} />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary">Photo Editor</h1>
          <p className="text-xs text-text-secondary">
            Draw, add text, shapes, and stickers on your photo — fully in your browser.
          </p>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] font-semibold text-brand">
            <ShieldCheck size={14} className="shrink-0" />
            100% Client-Side Processing — Your files never leave your device
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <label
            htmlFor="photo-editor-upload"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 hover:border-brand transition"
          >
            <Upload size={22} className="text-brand" />
            <span className="text-sm font-bold text-text-primary">Click to select a photo</span>
            <span className="text-[11px] text-text-secondary/60">JPG, PNG, GIF, or WEBP</span>
          </label>
          <input
            id="photo-editor-upload"
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            className="hidden"
            onChange={(e) => handleBaseFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#1c1c1e] text-white">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#242426] px-3 py-2">
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setActiveTool(id)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              activeTool === id ? "bg-brand text-white" : "text-white/70 hover:bg-white/10"
            }`}
          >
            <Icon size={17} />
          </button>
        ))}

        <div className="mx-1 h-6 w-px bg-white/15" />

        <button
          type="button"
          aria-label="Undo"
          title="Undo"
          onClick={undo}
          disabled={historyIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30"
        >
          <Undo2 size={17} />
        </button>
        <button
          type="button"
          aria-label="Redo"
          title="Redo"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 disabled:opacity-30"
        >
          <Redo2 size={17} />
        </button>

        <div className="mx-1 h-6 w-px bg-white/15" />

        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => setZoom((z) => Math.max(0.25, z - 0.1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
        >
          <ZoomOut size={17} />
        </button>
        <span className="w-10 text-center text-xs font-bold text-white/70">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
        >
          <ZoomIn size={17} />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-dark transition disabled:opacity-60"
          >
            <Download size={15} />
            {isExporting ? "Exporting..." : "Save & Export"}
          </button>
          <button
            type="button"
            aria-label="Close editor and start over"
            title="Start over with a new photo"
            onClick={() => {
              URL.revokeObjectURL(baseImageSrc);
              layers.forEach((l) => l.type === "image" && URL.revokeObjectURL(l.src));
              setBaseImageSrc(null);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: options panel */}
        <div className="w-56 shrink-0 overflow-y-auto border-r border-white/10 bg-[#242426] p-3 space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-bold text-white/60">Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {SWATCH_COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-brand" : "border-white/20"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setColor(e.target.value);
              }}
              aria-label="Custom color"
              className="mt-2 h-8 w-full cursor-pointer rounded-lg border border-white/15 bg-transparent"
            />
          </div>

          <div>
            <label htmlFor="stroke-width" className="mb-2 block text-[11px] font-bold text-white/60">
              Brush / stroke size: {strokeWidth}px
            </label>
            <input
              id="stroke-width"
              type="range"
              min={1}
              max={40}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="font-size" className="mb-2 block text-[11px] font-bold text-white/60">
              Font size: {fontSize}px
            </label>
            <input
              id="font-size"
              type="range"
              min={10}
              max={96}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold text-white/60">Layers</p>
            <ul className="space-y-1.5">
              {[...layers].reverse().map((l) => (
                <li
                  key={l.id}
                  onClick={() => setSelectedLayerId(l.id)}
                  className={`flex cursor-pointer items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-[11px] ${
                    selectedLayerId === l.id ? "bg-brand/30 text-white" : "bg-white/5 text-white/70"
                  }`}
                >
                  <span className="truncate capitalize">
                    {l.type === "text" ? `“${l.text.slice(0, 12)}”` : l.type === "shape" ? l.shape : l.type}
                  </span>
                  <span className="flex shrink-0 gap-0.5">
                    <button
                      aria-label="Move layer up"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(l.id, "up");
                      }}
                      className="rounded p-1 hover:bg-white/10"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      aria-label="Move layer down"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayer(l.id, "down");
                      }}
                      className="rounded p-1 hover:bg-white/10"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      aria-label="Delete layer"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(l.id);
                      }}
                      className="rounded p-1 hover:bg-red-500/30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                </li>
              ))}
              {layers.length === 0 && <li className="text-[11px] text-white/40">No layers yet</li>}
            </ul>
          </div>

          {selectedLayer && (
            <p className="text-[10px] text-white/40">Drag the selected layer directly on the canvas to move it.</p>
          )}
        </div>

        {/* Canvas stage */}
        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[#111113] p-6">
          <div style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} className="relative">
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="max-h-[75vh] max-w-[75vw] touch-none rounded-lg bg-white shadow-2xl"
              style={{ cursor: activeTool === "select" ? "default" : "crosshair" }}
            />

            {pendingText && (
              <textarea
                autoFocus
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                onBlur={commitPendingText}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitPendingText();
                  }
                }}
                style={{
                  position: "absolute",
                  left: (pendingText.x / baseWidth) * 100 + "%",
                  top: (pendingText.y / baseHeight) * 100 + "%",
                  color,
                  fontSize: fontSize,
                  minWidth: 120,
                }}
                className="resize rounded border-2 border-brand bg-white/90 px-1 py-0.5 leading-tight text-black outline-none"
              />
            )}
          </div>

          <input
            ref={imageLayerInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            className="hidden"
            onChange={(e) => {
              handleAddImageLayer(e.target.files?.[0] ?? null);
              if (imageLayerInputRef.current) imageLayerInputRef.current.value = "";
            }}
          />
        </div>
      </div>
    </div>
  );
}

function renderLayers(ctx: CanvasRenderingContext2D, layers: EditorLayer[], selectedId: string | null) {
  for (const layer of layers) {
    if (!layer.visible) continue;
    ctx.save();

    if (layer.type === "path") {
      if (layer.points.length >= 2) {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = layer.strokeWidth;
        if (layer.kind === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalAlpha = layer.kind === "highlighter" ? 0.35 : 1;
          ctx.strokeStyle = layer.color;
        }
        ctx.beginPath();
        ctx.moveTo(layer.points[0].x, layer.points[0].y);
        layer.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
    } else if (layer.type === "shape") {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.strokeWidth;
      const { shape, start, end } = layer;
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const w = Math.abs(end.x - start.x);
      const h = Math.abs(end.y - start.y);
      if (shape === "rect") ctx.strokeRect(x, y, w, h);
      else if (shape === "circle") {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.stroke();
      } else if (shape === "line" || shape === "arrow") {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        if (shape === "arrow") {
          const headLength = 12;
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }
    } else if (layer.type === "text") {
      ctx.fillStyle = layer.color;
      ctx.font = `${layer.fontSize}px sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(layer.text, layer.position.x, layer.position.y);
    } else if (layer.type === "image") {
      const img = new Image();
      img.src = layer.src;
      // Draw immediately if cached; onload is a no-op if it's already loaded/decoded
      // since the browser calls it synchronously from cache in that case in most engines.
      // For a freshly added layer, the next state-driven re-render will pick it up.
      if (img.complete) {
        ctx.drawImage(img, layer.position.x, layer.position.y, layer.width, layer.height);
      } else {
        img.onload = () => ctx.drawImage(img, layer.position.x, layer.position.y, layer.width, layer.height);
      }
    }

    if (selectedId === layer.id && (layer.type === "image" || layer.type === "text")) {
      ctx.strokeStyle = "#e5322d";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      if (layer.type === "image") {
        ctx.strokeRect(layer.position.x - 2, layer.position.y - 2, layer.width + 4, layer.height + 4);
      } else {
        const approxWidth = layer.text.length * layer.fontSize * 0.55;
        ctx.strokeRect(layer.position.x - 2, layer.position.y - 2, approxWidth + 4, layer.fontSize * 1.3 + 4);
      }
    }

    ctx.restore();
  }
}
