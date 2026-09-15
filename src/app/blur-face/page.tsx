"use client";

import React, { useEffect, useRef, useState } from "react";
import { UserRound, ShieldCheck, X } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import {
  blurFace,
  detectFacesNative,
  type BlurIntensity,
  type BlurRegion,
} from "@/lib/image/blurFace";

type Mode = "auto" | "manual";

export default function BlurFacePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const [intensity, setIntensity] = useState<BlurIntensity>("medium");
  const [mode, setMode] = useState<Mode>("manual");
  const [regions, setRegions] = useState<BlurRegion[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [autoUnsupported, setAutoUnsupported] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number } | null>(null);
  const [draftBox, setDraftBox] = useState<BlurRegion | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (file: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setRegions([]);
    setSelectedFile(file);
    setNaturalSize(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setPreviewUrl(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("This file could not be opened. Please choose a valid JPG, PNG, or WEBP image.");
    };
    img.src = url;
  };

  const runAutoDetect = async () => {
    if (!selectedFile) return;
    setIsDetecting(true);
    setError(null);
    setAutoUnsupported(false);
    try {
      const detected = await detectFacesNative(selectedFile);
      if (!detected) {
        setAutoUnsupported(true);
        setMode("manual");
        return;
      }
      if (detected.length === 0) {
        setError("No faces were detected automatically. Try Manual mode to select a region yourself.");
        setMode("manual");
        return;
      }
      // Add a small padding around each detected face.
      const padded = detected.map((r) => ({
        x: r.x - r.width * 0.1,
        y: r.y - r.height * 0.1,
        width: r.width * 1.2,
        height: r.height * 1.2,
      }));
      setRegions(padded);
    } finally {
      setIsDetecting(false);
    }
  };

  const toNaturalPoint = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage || !naturalSize) return { x: 0, y: 0 };
    const rect = stage.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * naturalSize.width,
      y: ((clientY - rect.top) / rect.height) * naturalSize.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode !== "manual") return;
    const pt = toNaturalPoint(e.clientX, e.clientY);
    drag.current = { startX: pt.x, startY: pt.y };
    setDraftBox({ x: pt.x, y: pt.y, width: 0, height: 0 });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const pt = toNaturalPoint(e.clientX, e.clientY);
    const x = Math.min(drag.current.startX, pt.x);
    const y = Math.min(drag.current.startY, pt.y);
    const width = Math.abs(pt.x - drag.current.startX);
    const height = Math.abs(pt.y - drag.current.startY);
    setDraftBox({ x, y, width, height });
  };

  const onPointerUp = () => {
    if (draftBox && draftBox.width > 4 && draftBox.height > 4) {
      setRegions((prev) => [...prev, draftBox]);
    }
    drag.current = null;
    setDraftBox(null);
  };

  const removeRegion = (index: number) => {
    setRegions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      const blob = await blurFace(selectedFile, regions, intensity);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      const base = selectedFile.name.replace(/\.[^/.]+$/, "");
      const ext = selectedFile.name.split(".").pop() || "png";
      setResultName(`${base}_blurred.${ext}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while blurring this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setRegions([]);
    setMode("manual");
    setAutoUnsupported(false);
    handleFileChange(null);
  };

  const toPercentBox = (r: BlurRegion) =>
    naturalSize
      ? {
          left: (r.x / naturalSize.width) * 100,
          top: (r.y / naturalSize.height) * 100,
          width: (r.width / naturalSize.width) * 100,
          height: (r.height / naturalSize.height) * 100,
        }
      : null;

  return (
    <ConversionPageLayout
      title="Blur Face"
      description="Blur faces or any sensitive region automatically or by hand — the image never leaves your browser."
      badge="Blur Face Tool"
      icon={UserRound}
      acceptTypes=".jpg,.jpeg,.png,.webp"
      inputId="blur-face-input"
      actionLabel="Apply Blur"
      processingLabel="Blurring..."
      selectedFile={selectedFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel="Download Blurred Image"
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
      canConvert={!!selectedFile && regions.length > 0}
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

      {selectedFile && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-bold text-text-secondary">Blur intensity</p>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as BlurIntensity[]).map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntensity(i)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold capitalize transition ${
                    intensity === i
                      ? "bg-brand text-white border-brand"
                      : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold text-text-secondary">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("auto");
                  runAutoDetect();
                }}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  mode === "auto"
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                }`}
              >
                {isDetecting ? "Detecting..." : "Auto — detect faces"}
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  mode === "manual"
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                }`}
              >
                Manual — draw region
              </button>
            </div>
            {autoUnsupported && (
              <p className="mt-2 text-[11px] text-text-secondary">
                Automatic face detection isn&apos;t supported in this browser. Switched to Manual mode — just
                draw a box over the area you want blurred.
              </p>
            )}
            {mode === "manual" && (
              <p className="mt-2 text-[11px] text-text-secondary">
                Click and drag on the image below to mark a region to blur. Add as many as you need.
              </p>
            )}
          </div>

          {previewUrl && naturalSize && (
            <div
              ref={stageRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="relative mx-auto max-w-full touch-none select-none overflow-hidden rounded-xl border border-border bg-black/5"
              style={{
                aspectRatio: `${naturalSize.width} / ${naturalSize.height}`,
                cursor: mode === "manual" ? "crosshair" : "default",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Image preview with blur regions"
                className="absolute inset-0 h-full w-full object-contain pointer-events-none"
                draggable={false}
              />
              {regions.map((r, i) => {
                const box = toPercentBox(r);
                if (!box) return null;
                return (
                  <div
                    key={i}
                    className="absolute border-2 border-brand bg-brand/25 backdrop-blur-[2px]"
                    style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
                  >
                    <button
                      type="button"
                      aria-label="Remove this blur region"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRegion(i);
                      }}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              {draftBox &&
                (() => {
                  const box = toPercentBox(draftBox);
                  if (!box) return null;
                  return (
                    <div
                      className="absolute border-2 border-dashed border-brand bg-brand/15"
                      style={{ left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` }}
                    />
                  );
                })()}
            </div>
          )}
        </div>
      )}
    </ConversionPageLayout>
  );
}
