"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  Eraser,
  Hand,
  Highlighter,
  Image as ImageIcon,
  Minus,
  MoveUp,
  MoveDown,
  Pencil,
  Plus,
  Shapes,
  Square,
  Trash2,
  Triangle,
  Type,
  X,
} from "lucide-react";

import { exportEditedPdf } from "@/lib/pdf/editPdf/exportEditedPdf";
import {
  createId,
  type Annotation,
  type EditorTool,
  type ShapeKind,
  type TextAnnotation,
} from "@/lib/pdf/editPdf/types";

type PdfEditorProps = {
  file: File;
  onClose: () => void;
  onSaved: (blob: Blob, fileName: string) => void;
};

type PageMeta = {
  width: number;
  height: number;
  thumbUrl: string | null;
};

const COLORS = ["#111111", "#e5322d", "#2563eb", "#16a34a", "#ca8a04", "#7c3aed"];

export function PdfEditor({ file, onClose, onSaved }: PdfEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageMetas, setPageMetas] = useState<PageMeta[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<EditorTool>("text");
  const [shapeKind, setShapeKind] = useState<ShapeKind>("rect");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawColor, setDrawColor] = useState("#e5322d");
  const [fontSize, setFontSize] = useState(16);
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [panelOpen, setPanelOpen] = useState(false);

  const sourceBytesRef = useRef<ArrayBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const dragRef = useRef<{
    mode: "draw-pen" | "draw-shape" | "move" | "resize" | "erase";
    id?: string;
    startX: number;
    startY: number;
    orig?: Annotation;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const selected = useMemo(
    () => annotations.find((a) => a.id === selectedId) || null,
    [annotations, selectedId]
  );

  const pageAnnotations = useMemo(
    () =>
      annotations
        .filter((a) => a.pageIndex === currentPage)
        .sort((a, b) => a.zIndex - b.zIndex),
    [annotations, currentPage]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const bytes = await file.arrayBuffer();
        sourceBytesRef.current = bytes.slice(0);

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
        if (cancelled) return;

        setPdfDoc(doc);
        setPageCount(doc.numPages);

        const metas: PageMeta[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const thumbViewport = page.getViewport({ scale: 0.22 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(thumbViewport.width);
          canvas.height = Math.floor(thumbViewport.height);
          const ctx = canvas.getContext("2d");
          let thumbUrl: string | null = null;
          if (ctx) {
            await page
              .render({ canvasContext: ctx, canvas, viewport: thumbViewport } as never)
              .promise;
            thumbUrl = canvas.toDataURL("image/jpeg", 0.72);
          }
          metas.push({ width: base.width, height: base.height, thumbUrl });
        }
        if (!cancelled) setPageMetas(metas);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Could not open this PDF. Try another file.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!pdfDoc || !pageMetas[currentPage]) return;
    let cancelled = false;

    const paint = async () => {
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;

      const page = await pdfDoc.getPage(currentPage + 1);
      if (cancelled) return;

      const meta = pageMetas[currentPage];
      const pad = stage.clientWidth < 640 ? 16 : 32;
      const availW = Math.max(120, stage.clientWidth - pad);
      const availH = Math.max(160, stage.clientHeight - pad);
      const fit = Math.min(availW / meta.width, availH / meta.height);
      const cssScale = fit * zoom;
      const cssW = Math.floor(meta.width * cssScale);
      const cssH = Math.floor(meta.height * cssScale);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: cssScale * dpr });

      renderTaskRef.current?.cancel();
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      setDisplaySize({ width: cssW, height: cssH });

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const task = page.render({
        canvasContext: ctx,
        canvas,
        viewport,
      } as never);
      renderTaskRef.current = task;
      try {
        await task.promise;
      } catch (err) {
        if ((err as { name?: string })?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      }
    };

    // Wait a frame so stageRef has layout size
    const raf = requestAnimationFrame(() => {
      void paint();
    });
    const onResize = () => void paint();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      renderTaskRef.current?.cancel();
      window.removeEventListener("resize", onResize);
    };
  }, [pdfDoc, currentPage, zoom, pageMetas]);

  const nextZ = useCallback(() => {
    return annotations.reduce((m, a) => Math.max(m, a.zIndex), 0) + 1;
  }, [annotations]);

  const updateAnnotation = (id: string, patch: Partial<Annotation>) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? ({ ...a, ...patch } as Annotation) : a))
    );
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  };

  const moveLayer = (dir: "up" | "down") => {
    if (!selected) return;
    const pageItems = annotations
      .filter((a) => a.pageIndex === currentPage)
      .sort((a, b) => a.zIndex - b.zIndex);
    const idx = pageItems.findIndex((a) => a.id === selected.id);
    if (idx < 0) return;
    const swapWith = dir === "up" ? pageItems[idx + 1] : pageItems[idx - 1];
    if (!swapWith) return;
    setAnnotations((prev) =>
      prev.map((a) => {
        if (a.id === selected.id) return { ...a, zIndex: swapWith.zIndex };
        if (a.id === swapWith.id) return { ...a, zIndex: selected.zIndex };
        return a;
      })
    );
  };

  const clientToNorm = (clientX: number, clientY: number) => {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    };
  };

  const eraseAtPoint = (clientX: number, clientY: number) => {
    const targetHit = document
      .elementsFromPoint(clientX, clientY)
      .map((el) => (el as HTMLElement).closest?.("[data-ann-id]")?.getAttribute("data-ann-id"))
      .find(Boolean);

    if (targetHit) {
      setAnnotations((prev) => prev.filter((a) => a.id !== targetHit));
      setSelectedId((id) => (id === targetHit ? null : id));
      return;
    }

    // Pen / highlight strokes use pointer-events-none — hit-test by proximity
    const p = clientToNorm(clientX, clientY);
    const radius = 0.02;
    setAnnotations((prev) => {
      const removedIds = new Set<string>();
      const next = prev.filter((a) => {
        if (a.pageIndex !== currentPage || a.type !== "pen") return true;
        const hit = a.points.some((pt) => Math.hypot(pt.x - p.x, pt.y - p.y) <= radius);
        if (hit) removedIds.add(a.id);
        return !hit;
      });
      if (removedIds.size > 0) {
        queueMicrotask(() => {
          setSelectedId((id) => (id && removedIds.has(id) ? null : id));
        });
      }
      return next;
    });
  };

  const handleOverlayPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const hitId = target.closest("[data-ann-id]")?.getAttribute("data-ann-id");

    if (tool === "eraser") {
      eraseAtPoint(e.clientX, e.clientY);
      dragRef.current = { mode: "erase", startX: e.clientX, startY: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // Select / move existing items with pan or when clicking an item (not while drawing)
    if (hitId && (tool === "pan" || (tool !== "pen" && tool !== "highlight" && tool !== "shape"))) {
      setSelectedId(hitId);
      const ann = annotations.find((a) => a.id === hitId);
      if (ann && (ann.type === "text" || ann.type === "image" || ann.type === "shape")) {
        dragRef.current = {
          mode: "move",
          id: hitId,
          startX: e.clientX,
          startY: e.clientY,
          orig: { ...ann },
        };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      return;
    }

    if (tool === "pan") {
      setSelectedId(null);
      return;
    }

    const p = clientToNorm(e.clientX, e.clientY);

    if (tool === "text") {
      const ann: TextAnnotation = {
        id: createId(),
        type: "text",
        pageIndex: currentPage,
        zIndex: nextZ(),
        x: Math.min(0.72, p.x),
        y: Math.min(0.95, p.y),
        w: 0.28,
        h: 0.05,
        text: "New text",
        fontSize,
        color: drawColor,
        fontFamily: "Helvetica",
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedId(ann.id);
      return;
    }

    if (tool === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/webp";
      input.onchange = async () => {
        const f = input.files?.[0];
        if (!f) return;
        const dataUrl = await readFileAsDataUrl(f);
        const ann: Annotation = {
          id: createId(),
          type: "image",
          pageIndex: currentPage,
          zIndex: nextZ(),
          x: Math.min(0.7, p.x),
          y: Math.min(0.8, p.y),
          w: 0.3,
          h: 0.2,
          dataUrl,
        };
        setAnnotations((prev) => [...prev, ann]);
        setSelectedId(ann.id);
      };
      input.click();
      return;
    }

    if (tool === "pen" || tool === "highlight") {
      const id = createId();
      const ann: Annotation = {
        id,
        type: "pen",
        pageIndex: currentPage,
        zIndex: nextZ(),
        points: [p],
        color: tool === "highlight" ? "#facc15" : drawColor,
        strokeWidth: tool === "highlight" ? Math.max(10, strokeWidth * 4) : strokeWidth,
        highlight: tool === "highlight",
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedId(id);
      dragRef.current = { mode: "draw-pen", id, startX: e.clientX, startY: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    if (tool === "shape") {
      const id = createId();
      const ann: Annotation = {
        id,
        type: "shape",
        shape: shapeKind,
        pageIndex: currentPage,
        zIndex: nextZ(),
        x: p.x,
        y: p.y,
        w: 0.001,
        h: 0.001,
        color: drawColor,
        strokeWidth,
      };
      setAnnotations((prev) => [...prev, ann]);
      setSelectedId(id);
      dragRef.current = { mode: "draw-shape", id, startX: e.clientX, startY: e.clientY, orig: ann };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = clientToNorm(e.clientX, e.clientY);

    if (drag.mode === "erase") {
      eraseAtPoint(e.clientX, e.clientY);
      return;
    }

    if (drag.mode === "draw-pen" && drag.id) {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === drag.id && a.type === "pen" ? { ...a, points: [...a.points, p] } : a
        )
      );
      return;
    }

    if (drag.mode === "draw-shape" && drag.id && drag.orig && drag.orig.type === "shape") {
      const ox = drag.orig.x;
      const oy = drag.orig.y;
      updateAnnotation(drag.id, {
        x: Math.min(ox, p.x),
        y: Math.min(oy, p.y),
        w: Math.abs(p.x - ox),
        h: Math.abs(p.y - oy),
      });
      return;
    }

    if (drag.mode === "move" && drag.id && drag.orig && "x" in drag.orig) {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      const dx = (e.clientX - drag.startX) / rect.width;
      const dy = (e.clientY - drag.startY) / rect.height;
      const orig = drag.orig as { x: number; y: number; w?: number; h?: number };
      updateAnnotation(drag.id, {
        x: Math.min(1 - (orig.w || 0), Math.max(0, orig.x + dx)),
        y: Math.min(1 - (orig.h || 0), Math.max(0, orig.y + dy)),
      });
    }
  };

  const handleOverlayPointerUp = () => {
    dragRef.current = null;
  };

  const handleSave = async () => {
    if (!sourceBytesRef.current) return;
    setIsSaving(true);
    try {
      const blob = await exportEditedPdf(sourceBytesRef.current, annotations);
      const outName = file.name.replace(/\.pdf$/i, "") + "_edited.pdf";
      onSaved(blob, outName);
    } catch (err) {
      console.error(err);
      alert("Failed to save PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canvasW = displaySize.width;
  const canvasH = displaySize.height;

  const editorPanel = (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-text-primary">Edit PDF</h2>
        <button
          type="button"
          onClick={() => {
            setPanelOpen(false);
            onClose();
          }}
          className="hidden text-text-secondary hover:text-brand lg:inline-flex"
          aria-label="Close editor"
        >
          <X size={18} />
        </button>
        <button
          type="button"
          onClick={() => setPanelOpen(false)}
          className="inline-flex text-text-secondary hover:text-brand lg:hidden"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
          Tools
        </p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(
            [
              { id: "pan" as const, label: "Select", icon: Hand },
              { id: "text" as const, label: "Text", icon: Type },
              { id: "image" as const, label: "Image", icon: ImageIcon },
              { id: "pen" as const, label: "Draw", icon: Pencil },
              { id: "highlight" as const, label: "Highlight", icon: Highlighter },
              { id: "shape" as const, label: "Shapes", icon: Shapes },
              { id: "eraser" as const, label: "Eraser", icon: Eraser },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTool(t.id);
                  if (t.id === "highlight") setDrawColor("#facc15");
                }}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition ${
                  active
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-secondary hover:bg-background"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tool === "shape" && (
          <div className="mb-4 flex flex-wrap gap-1">
            {(
              [
                { id: "rect" as const, icon: Square, title: "Rectangle" },
                { id: "ellipse" as const, icon: Circle, title: "Ellipse" },
                { id: "triangle" as const, icon: Triangle, title: "Triangle" },
                { id: "line" as const, icon: Minus, title: "Line" },
                { id: "arrow" as const, icon: ArrowRight, title: "Arrow" },
              ] as const
            ).map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.title}
                  onClick={() => setShapeKind(s.id)}
                  className={`rounded-lg border p-2 ${
                    shapeKind === s.id
                      ? "border-brand bg-red-50 text-brand"
                      : "border-border text-text-secondary"
                  }`}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        )}

        <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
          Pick a tool, then click the page to add content. Use Select to move items, or Eraser to
          remove them.
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
          Items on page {currentPage + 1}
        </p>
        <ul className="mb-4 space-y-1">
          {[...pageAnnotations].reverse().map((ann) => (
            <li key={ann.id}>
              <button
                type="button"
                onClick={() => setSelectedId(ann.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs ${
                  selectedId === ann.id
                    ? "border-brand bg-red-50 text-brand"
                    : "border-border text-text-primary hover:bg-background"
                }`}
              >
                <span className="truncate font-semibold capitalize">
                  {ann.type === "shape" ? ann.shape : ann.type}
                  {ann.type === "text" ? `: ${ann.text.slice(0, 18)}` : ""}
                </span>
              </button>
            </li>
          ))}
          {pageAnnotations.length === 0 && (
            <li className="text-xs text-text-secondary">No annotations on this page yet.</li>
          )}
        </ul>

        {selected && (
          <div className="space-y-2 rounded-xl border border-border p-3">
            <p className="text-xs font-bold text-text-primary">Selected item</p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveLayer("up")}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11px] font-semibold hover:bg-background"
              >
                <MoveUp size={14} /> Front
              </button>
              <button
                type="button"
                onClick={() => moveLayer("down")}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[11px] font-semibold hover:bg-background"
              >
                <MoveDown size={14} /> Back
              </button>
            </div>
            <button
              type="button"
              onClick={deleteSelected}
              className="flex w-full items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-[11px] font-semibold text-brand hover:bg-red-100"
            >
              <Trash2 size={14} /> Delete
            </button>
            <div className="flex flex-wrap gap-1 pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => {
                    setDrawColor(c);
                    if (
                      selected.type === "text" ||
                      selected.type === "pen" ||
                      selected.type === "shape"
                    ) {
                      updateAnnotation(selected.id, { color: c });
                    }
                  }}
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          disabled={isSaving || isLoading}
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white shadow hover:bg-brand-dark disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save changes"}
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );

  const ui = (
    <div
      className="fixed inset-0 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#f3f2f0]"
      style={{ zIndex: 1400 }}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-border bg-white px-2 shadow-sm sm:h-16 sm:gap-3 sm:px-3">
        <p className="hidden shrink-0 text-sm font-bold text-brand sm:block">TeenyPDF</p>

        <div className="flex shrink-0 overflow-hidden rounded-xl border border-[#d8d8d8] bg-white shadow-sm">
          <PrimaryTool
            active={tool === "pan"}
            onClick={() => setTool("pan")}
            title="Select / Move"
            label="Select"
          >
            <Hand size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "text"}
            onClick={() => setTool("text")}
            title="Add text"
            label="Text"
          >
            <Type size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "image"}
            onClick={() => setTool("image")}
            title="Add image"
            label="Image"
          >
            <ImageIcon size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "pen"}
            onClick={() => setTool("pen")}
            title="Draw"
            label="Draw"
          >
            <Pencil size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "highlight"}
            onClick={() => {
              setTool("highlight");
              setDrawColor("#facc15");
            }}
            title="Highlight"
            label="Highlight"
          >
            <Highlighter size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "shape"}
            onClick={() => setTool("shape")}
            title="Shapes"
            label="Shapes"
          >
            <Shapes size={18} strokeWidth={1.75} />
          </PrimaryTool>
          <PrimaryTool
            active={tool === "eraser"}
            onClick={() => setTool("eraser")}
            title="Eraser"
            label="Eraser"
            last
          >
            <Eraser size={18} strokeWidth={1.75} />
          </PrimaryTool>
        </div>

        {tool === "shape" && (
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <ToolButton active={shapeKind === "rect"} onClick={() => setShapeKind("rect")} title="Rectangle">
              <Square size={16} />
            </ToolButton>
            <ToolButton
              active={shapeKind === "ellipse"}
              onClick={() => setShapeKind("ellipse")}
              title="Ellipse"
            >
              <Circle size={16} />
            </ToolButton>
            <ToolButton
              active={shapeKind === "triangle"}
              onClick={() => setShapeKind("triangle")}
              title="Triangle"
            >
              <Triangle size={16} />
            </ToolButton>
            <ToolButton active={shapeKind === "line"} onClick={() => setShapeKind("line")} title="Line">
              <Minus size={16} />
            </ToolButton>
            <ToolButton
              active={shapeKind === "arrow"}
              onClick={() => setShapeKind("arrow")}
              title="Arrow"
            >
              <ArrowRight size={16} />
            </ToolButton>
          </div>
        )}

        <div className="hidden h-8 w-px bg-border md:block" />

        <label className="hidden items-center gap-1.5 text-xs text-text-secondary sm:flex">
          Color
          <input
            type="color"
            value={drawColor}
            onChange={(e) => {
              setDrawColor(e.target.value);
              if (selectedId) {
                const sel = annotations.find((a) => a.id === selectedId);
                if (!sel) return;
                if (sel.type === "text" || sel.type === "pen" || sel.type === "shape") {
                  updateAnnotation(selectedId, { color: e.target.value });
                }
              }
            }}
            className="h-8 w-9 cursor-pointer rounded border border-border bg-transparent"
          />
        </label>

        {(tool === "text" || selected?.type === "text") && (
          <label className="hidden items-center gap-1.5 text-xs text-text-secondary md:flex">
            Size
            <input
              type="number"
              min={8}
              max={72}
              value={selected?.type === "text" ? selected.fontSize : fontSize}
              onChange={(e) => {
                const v = Number(e.target.value) || 16;
                setFontSize(v);
                if (selected?.type === "text") updateAnnotation(selected.id, { fontSize: v });
              }}
              className="w-14 rounded border border-border px-1.5 py-1 text-xs"
            />
          </label>
        )}

        {(tool === "pen" || tool === "highlight" || tool === "shape") && (
          <label className="hidden items-center gap-1.5 text-xs text-text-secondary md:flex">
            Stroke
            <input
              type="range"
              min={1}
              max={12}
              step={0.5}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-20"
            />
          </label>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-background lg:hidden"
          >
            Panel
          </button>
          <button
            type="button"
            disabled={isSaving || isLoading}
            onClick={handleSave}
            className="rounded-lg bg-brand px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-60 lg:hidden"
          >
            {isSaving ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-background sm:px-3"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-40 shrink-0 overflow-y-auto border-r border-border bg-surface p-2 md:block">
          {pageMetas.map((meta, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={`mb-2 w-full overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                currentPage === i ? "border-brand" : "border-transparent hover:border-border"
              }`}
            >
              {meta.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.thumbUrl} alt={`Page ${i + 1}`} className="w-full rounded" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-[10px] text-text-secondary">
                  {i + 1}
                </div>
              )}
              <span className="mt-1 block text-center text-[10px] font-semibold text-text-secondary">
                {i + 1}
              </span>
            </button>
          ))}
        </aside>

        <main
          ref={stageRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#e8e6e3]"
        >
          {isLoading && (
            <div className="flex flex-1 items-center justify-center text-sm text-text-secondary">
              Loading PDF…
            </div>
          )}
          {loadError && (
            <div className="flex flex-1 items-center justify-center text-sm text-brand">{loadError}</div>
          )}
          {!isLoading && !loadError && (
            <div
              className={`flex h-full w-full items-center justify-center overflow-auto p-4 ${
                tool === "pan"
                  ? "cursor-grab"
                  : tool === "eraser"
                    ? "cursor-cell"
                    : "cursor-crosshair"
              }`}
            >
              <div
                className="relative shrink-0 bg-white shadow-xl"
                style={{
                  width: canvasW || undefined,
                  height: canvasH || undefined,
                }}
              >
                <canvas ref={canvasRef} className="block max-w-none" />
                {canvasW > 0 && canvasH > 0 && (
                  <div
                    ref={overlayRef}
                    className="absolute left-0 top-0"
                    style={{ width: canvasW, height: canvasH }}
                    onPointerDown={handleOverlayPointerDown}
                    onPointerMove={handleOverlayPointerMove}
                    onPointerUp={handleOverlayPointerUp}
                    onPointerCancel={handleOverlayPointerUp}
                  >
                    {pageAnnotations.map((ann) => (
                      <AnnotationView
                        key={ann.id}
                        ann={ann}
                        selected={ann.id === selectedId}
                        pageW={canvasW}
                        pageH={canvasH}
                        onSelect={() => setSelectedId(ann.id)}
                        onChangeText={(text) => updateAnnotation(ann.id, { text })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 sm:bottom-4 sm:w-auto">
            <div className="pointer-events-auto flex items-center justify-center gap-1.5 rounded-full bg-[#2b2b2b] px-2.5 py-2 text-white shadow-lg sm:gap-2 sm:px-3">
              <button
                type="button"
                disabled={currentPage <= 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-40"
              >
                <ArrowUp size={16} />
              </button>
              <span className="min-w-[3.75rem] text-center text-xs font-semibold sm:min-w-[4.5rem]">
                {currentPage + 1} / {pageCount || "—"}
              </span>
              <button
                type="button"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
                className="rounded p-1 hover:bg-white/10 disabled:opacity-40"
              >
                <ArrowDown size={16} />
              </button>
              <div className="mx-0.5 h-4 w-px bg-white/20 sm:mx-1" />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                className="rounded p-1 hover:bg-white/10"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2.75rem] text-center text-xs sm:min-w-[3rem]">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10))}
                className="rounded p-1 hover:bg-white/10"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </main>

        <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-surface lg:flex">
          {editorPanel}
        </aside>
      </div>

      {panelOpen && (
        <div className="absolute inset-0 z-20 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Dismiss panel"
            onClick={() => setPanelOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-surface shadow-2xl">
            {editorPanel}
          </aside>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(ui, document.body);
}

function PrimaryTool({
  active,
  onClick,
  title,
  label,
  children,
  last,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex min-w-[2.75rem] flex-col items-center gap-0.5 px-2 py-1.5 text-[#4a4a4a] transition sm:min-w-[4.25rem] sm:px-3 sm:py-2 ${
        !last ? "border-r border-[#e4e4e4]" : ""
      } ${active ? "bg-[#f5f5f5] text-brand" : "hover:bg-[#fafafa]"}`}
    >
      {children}
      <span className="hidden text-[10px] font-semibold leading-none sm:inline">{label}</span>
    </button>
  );
}

function ToolButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition ${
        active ? "bg-red-50 text-brand" : "text-text-secondary hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function AnnotationView({
  ann,
  selected,
  pageW,
  pageH,
  onSelect,
  onChangeText,
}: {
  ann: Annotation;
  selected: boolean;
  pageW: number;
  pageH: number;
  onSelect: () => void;
  onChangeText: (text: string) => void;
}) {
  const ring = selected ? "ring-2 ring-brand ring-offset-1" : "";

  if (ann.type === "text") {
    return (
      <textarea
        data-ann-id={ann.id}
        value={ann.text}
        onChange={(e) => onChangeText(e.target.value)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`absolute resize-none overflow-hidden bg-transparent p-0.5 outline-none ${ring}`}
        style={{
          left: ann.x * pageW,
          top: ann.y * pageH,
          width: Math.max(40, ann.w * pageW),
          height: Math.max(24, ann.h * pageH),
          color: ann.color,
          fontSize: ann.fontSize,
          fontFamily: ann.fontFamily,
          fontWeight: ann.bold ? 700 : 400,
          lineHeight: 1.25,
        }}
      />
    );
  }

  if (ann.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        data-ann-id={ann.id}
        src={ann.dataUrl}
        alt=""
        draggable={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`absolute object-contain ${ring}`}
        style={{
          left: ann.x * pageW,
          top: ann.y * pageH,
          width: ann.w * pageW,
          height: ann.h * pageH,
        }}
      />
    );
  }

  if (ann.type === "pen") {
    const d = ann.points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x * pageW} ${pt.y * pageH}`)
      .join(" ");
    return (
      <svg
        data-ann-id={ann.id}
        className="pointer-events-none absolute inset-0"
        width={pageW}
        height={pageH}
      >
        <path
          d={d}
          fill="none"
          stroke={ann.color}
          strokeWidth={ann.strokeWidth}
          strokeOpacity={ann.highlight ? 0.4 : 1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (ann.type === "shape") {
    if (ann.shape === "line" || ann.shape === "arrow") {
      const x1 = ann.x * pageW;
      const y1 = ann.y * pageH;
      const x2 = (ann.x + ann.w) * pageW;
      const y2 = (ann.y + ann.h) * pageH;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const head = 10 + ann.strokeWidth * 2;
      return (
        <svg
          data-ann-id={ann.id}
          className="absolute inset-0"
          width={pageW}
          height={pageH}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={ann.color}
            strokeWidth={ann.strokeWidth}
          />
          {ann.shape === "arrow" && (
            <>
              <line
                x1={x2}
                y1={y2}
                x2={x2 - head * Math.cos(angle - Math.PI / 6)}
                y2={y2 - head * Math.sin(angle - Math.PI / 6)}
                stroke={ann.color}
                strokeWidth={ann.strokeWidth}
              />
              <line
                x1={x2}
                y1={y2}
                x2={x2 - head * Math.cos(angle + Math.PI / 6)}
                y2={y2 - head * Math.sin(angle + Math.PI / 6)}
                stroke={ann.color}
                strokeWidth={ann.strokeWidth}
              />
            </>
          )}
        </svg>
      );
    }

    if (ann.shape === "triangle") {
      const x = ann.x * pageW;
      const y = ann.y * pageH;
      const w = Math.max(4, ann.w * pageW);
      const h = Math.max(4, ann.h * pageH);
      const points = `${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`;
      return (
        <svg
          data-ann-id={ann.id}
          className={`absolute left-0 top-0 ${ring}`}
          width={pageW}
          height={pageH}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <polygon
            points={points}
            fill={ann.fill ? `${ann.fill}40` : "transparent"}
            stroke={ann.color}
            strokeWidth={ann.strokeWidth}
          />
        </svg>
      );
    }

    return (
      <div
        data-ann-id={ann.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`absolute ${ring}`}
        style={{
          left: ann.x * pageW,
          top: ann.y * pageH,
          width: Math.max(4, ann.w * pageW),
          height: Math.max(4, ann.h * pageH),
          border: `${ann.strokeWidth}px solid ${ann.color}`,
          borderRadius: ann.shape === "ellipse" ? "50%" : 0,
          backgroundColor: ann.fill ? `${ann.fill}40` : "transparent",
        }}
      />
    );
  }

  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
