"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Crop as CropIcon, ShieldCheck } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import { cropImage, getImageDimensions, type CropRect } from "@/lib/image/cropImage";

type AspectPreset = "free" | "1:1" | "4:3" | "16:9" | "3:2";

const ASPECT_PRESETS: { id: AspectPreset; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
];

type DragMode =
  | null
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | "n"
  | "s"
  | "e"
  | "w";

export default function CropImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Crop rect in NATURAL image pixel coordinates.
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [preset, setPreset] = useState<AspectPreset>("free");

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<{
    mode: DragMode;
    startX: number;
    startY: number;
    startRect: CropRect;
  } | null>(null);

  // Reset everything when a new file is chosen.
  const handleFileChange = useCallback(async (file: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setSelectedFile(file);
    setNaturalSize(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) return;

    try {
      const dims = await getImageDimensions(file);
      setNaturalSize(dims);
      // Default crop = full image, centered logic not needed since it's 0,0.
      setRect({ x: 0, y: 0, width: dims.width, height: dims.height });
      setPreviewUrl(URL.createObjectURL(file));
      setPreset("free");
    } catch {
      setError("This file could not be read as an image. Please choose a valid JPG, PNG, or GIF.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up object URLs on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (id: AspectPreset) => {
    setPreset(id);
    if (!naturalSize) return;
    const config = ASPECT_PRESETS.find((p) => p.id === id);
    if (!config || config.ratio === null) return;

    const { width: iw, height: ih } = naturalSize;
    let w = iw;
    let h = w / config.ratio;
    if (h > ih) {
      h = ih;
      w = h * config.ratio;
    }
    setRect({
      x: (iw - w) / 2,
      y: (ih - h) / 2,
      width: w,
      height: h,
    });
  };

  // --- Drag handling on the visual editor ---

  const clampRect = useCallback(
    (r: CropRect): CropRect => {
      if (!naturalSize) return r;
      const width = Math.min(Math.max(r.width, 10), naturalSize.width);
      const height = Math.min(Math.max(r.height, 10), naturalSize.height);
      const x = Math.min(Math.max(r.x, 0), naturalSize.width - width);
      const y = Math.min(Math.max(r.y, 0), naturalSize.height - height);
      return { x, y, width, height };
    },
    [naturalSize]
  );

  // Starts a drag/resize gesture. Uses the Pointer Capture API so pointermove/up
  // keep firing on this same element even once the cursor leaves it — no need
  // for manual window-level listeners or refs mutated outside an event handler.
  const startDrag = (mode: DragMode) => (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveDrag({ mode, startX: e.clientX, startY: e.clientY, startRect: rect });
  };

  const handleDragMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!activeDrag || !stageRef.current || !naturalSize) return;

    const stage = stageRef.current;
    const scale = naturalSize.width / stage.clientWidth;
    const dx = (e.clientX - activeDrag.startX) * scale;
    const dy = (e.clientY - activeDrag.startY) * scale;
    const s = activeDrag.startRect;

    let next: CropRect = { ...s };
    const ratio = ASPECT_PRESETS.find((p) => p.id === preset)?.ratio ?? null;

    switch (activeDrag.mode) {
      case "move":
        next.x = s.x + dx;
        next.y = s.y + dy;
        break;
      case "e":
        next.width = s.width + dx;
        break;
      case "w":
        next.x = s.x + dx;
        next.width = s.width - dx;
        break;
      case "s":
        next.height = s.height + dy;
        break;
      case "n":
        next.y = s.y + dy;
        next.height = s.height - dy;
        break;
      case "se":
        next.width = s.width + dx;
        next.height = ratio ? next.width / ratio : s.height + dy;
        break;
      case "sw":
        next.x = s.x + dx;
        next.width = s.width - dx;
        next.height = ratio ? next.width / ratio : s.height + dy;
        break;
      case "ne":
        next.width = s.width + dx;
        next.y = s.y + dy;
        next.height = ratio ? next.width / ratio : s.height - dy;
        break;
      case "nw":
        next.x = s.x + dx;
        next.width = s.width - dx;
        next.y = s.y + dy;
        next.height = ratio ? next.width / ratio : s.height - dy;
        break;
      default:
        break;
    }

    setRect(clampRect(next));
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setActiveDrag(null);
  };

  // --- Numeric field handlers ---
  const updateField = (field: keyof CropRect, value: number) => {
    if (Number.isNaN(value)) return;
    setPreset("free");
    setRect((prev) => clampRect({ ...prev, [field]: value }));
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await cropImage(selectedFile, rect);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const ext = selectedFile.name.split(".").pop() || "png";
      setResultName(`${base}_cropped.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while cropping this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    handleFileChange(null);
  };

  // Percentage box for rendering the crop overlay against the displayed <img>.
  const box = naturalSize
    ? {
        left: (rect.x / naturalSize.width) * 100,
        top: (rect.y / naturalSize.height) * 100,
        width: (rect.width / naturalSize.width) * 100,
        height: (rect.height / naturalSize.height) * 100,
      }
    : null;

  const handles: DragMode[] = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];

  return (
    <ConversionPageLayout
      title="Crop Image"
      description="Trim your photo to the perfect size — drag the handles or type exact pixel values. Nothing ever leaves your device."
      badge="Crop Image Tool"
      icon={CropIcon}
      acceptTypes=".jpg,.jpeg,.png,.gif"
      inputId="crop-image-input"
      actionLabel="Crop Image"
      processingLabel="Cropping..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Cropped Image"
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
      canConvert={!!selectedFile && !!naturalSize && rect.width > 0 && rect.height > 0}
    >
      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] font-semibold text-brand">
        <ShieldCheck size={14} className="shrink-0" />
        100% Client-Side Processing — Your files never leave your device
      </div>

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {previewUrl && naturalSize && box && (
        <div className="space-y-4">
          {/* Visual crop stage */}
          <div
            ref={stageRef}
            className="relative mx-auto max-w-full select-none touch-none rounded-xl overflow-hidden border border-border bg-black/5"
            style={{ aspectRatio: `${naturalSize.width} / ${naturalSize.height}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Image to crop"
              className="absolute inset-0 h-full w-full object-contain pointer-events-none opacity-60"
              draggable={false}
            />
            <div
              onPointerDown={startDrag("move")}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              className="absolute cursor-move border-2 border-brand bg-brand/10"
              style={{
                left: `${box.left}%`,
                top: `${box.top}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
              role="slider"
              aria-label="Crop region"
              aria-valuenow={Math.round(rect.width)}
              tabIndex={0}
            >
              {handles.map((h) => (
                <span
                  key={h}
                  onPointerDown={startDrag(h)}
                  onPointerMove={handleDragMove}
                  onPointerUp={handleDragEnd}
                  onPointerCancel={handleDragEnd}
                  aria-label={`Resize crop from ${h}`}
                  className={`absolute h-3 w-3 rounded-full bg-white border-2 border-brand ${handlePositionClass(
                    h!
                  )}`}
                  style={{ cursor: handleCursor(h!) }}
                />
              ))}
            </div>
          </div>

          {/* Aspect ratio presets */}
          <div className="flex flex-wrap gap-2">
            {ASPECT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition ${
                  preset === p.id
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Numeric X/Y/W/H inputs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField label="X" value={Math.round(rect.x)} onChange={(v) => updateField("x", v)} />
            <NumberField label="Y" value={Math.round(rect.y)} onChange={(v) => updateField("y", v)} />
            <NumberField label="Width" value={Math.round(rect.width)} onChange={(v) => updateField("width", v)} />
            <NumberField label="Height" value={Math.round(rect.height)} onChange={(v) => updateField("height", v)} />
          </div>
        </div>
      )}
    </ConversionPageLayout>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = `crop-field-${label.toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-bold text-text-secondary">
        {label} (px)
      </label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </div>
  );
}

function handlePositionClass(handle: NonNullable<DragMode>): string {
  const map: Record<string, string> = {
    nw: "-left-1.5 -top-1.5",
    n: "left-1/2 -top-1.5 -translate-x-1/2",
    ne: "-right-1.5 -top-1.5",
    w: "-left-1.5 top-1/2 -translate-y-1/2",
    e: "-right-1.5 top-1/2 -translate-y-1/2",
    sw: "-left-1.5 -bottom-1.5",
    s: "left-1/2 -bottom-1.5 -translate-x-1/2",
    se: "-right-1.5 -bottom-1.5",
  };
  return map[handle] ?? "";
}

function handleCursor(handle: NonNullable<DragMode>): string {
  const map: Record<string, string> = {
    nw: "nwse-resize",
    se: "nwse-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
  };
  return map[handle] ?? "default";
}
