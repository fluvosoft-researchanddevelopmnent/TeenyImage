"use client";

import React, { useEffect, useRef, useState } from "react";
import { Stamp, ShieldCheck, X } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import { watermarkImage, type WatermarkOptions, type WatermarkPosition } from "@/lib/image/watermarkImage";

const POSITIONS: WatermarkPosition[] = ["TL", "TC", "TR", "ML", "MC", "MR", "BL", "BC", "BR"];

export default function WatermarkImagePage() {
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [text, setText] = useState("");
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const [position, setPosition] = useState<WatermarkPosition>("BR");
  const [opacity, setOpacity] = useState(70);
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState("#ffffff");

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const extraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (file: File | null) => {
    setError(null);
    setDownloadUrl(null);
    setPrimaryFile(file);
  };

  const allFiles = primaryFile ? [primaryFile, ...extraFiles] : [];

  const buildOptions = (): WatermarkOptions | null => {
    if (watermarkType === "text") {
      if (!text.trim()) {
        setError("Please enter the watermark text.");
        return null;
      }
      return { type: "text", text, color, fontSize, position, opacity };
    }
    if (!watermarkImageFile) {
      setError("Please upload a watermark image.");
      return null;
    }
    return { type: "image", watermarkFile: watermarkImageFile, position, opacity };
  };

  const handleConvert = async () => {
    if (allFiles.length === 0) return;
    const options = buildOptions();
    if (!options) return;

    setIsProcessing(true);
    setError(null);
    try {
      if (allFiles.length === 1) {
        const file = allFiles[0];
        const blob = await watermarkImage(file, options);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        const base = file.name.replace(/\.[^/.]+$/, "");
        const ext = file.name.split(".").pop() || "png";
        setResultName(`${base}_watermarked.${ext}`);
      } else {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        for (const file of allFiles) {
          const blob = await watermarkImage(file, options);
          const base = file.name.replace(/\.[^/.]+$/, "");
          const ext = file.name.split(".").pop() || "png";
          zip.file(`${base}_watermarked.${ext}`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        setResultName(`watermarked_images_${Date.now()}.zip`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while applying the watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPrimaryFile(null);
    setExtraFiles([]);
    setWatermarkImageFile(null);
    setText("");
    setPosition("BR");
    setOpacity(70);
    setFontSize(36);
    setColor("#ffffff");
  };

  const addExtraFiles = (files: FileList | null) => {
    if (!files) return;
    setExtraFiles((prev) => [...prev, ...Array.from(files)]);
    if (extraInputRef.current) extraInputRef.current.value = "";
  };

  const removeExtraFile = (index: number) => {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ConversionPageLayout
      title="Watermark Image"
      description="Protect your photos with a text or logo watermark. Position, opacity, and style are entirely up to you — processed locally."
      badge="Watermark Image Tool"
      icon={Stamp}
      acceptTypes=".jpg,.jpeg,.png,.webp"
      inputId="watermark-image-input"
      actionLabel={allFiles.length > 1 ? "Watermark & Download ZIP" : "Apply Watermark"}
      processingLabel="Applying watermark..."
      selectedFile={primaryFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel={allFiles.length > 1 ? "Download ZIP" : "Download Watermarked Image"}
      onFileChange={handleFileChange}
      onConvert={handleConvert}
      onReset={handleReset}
      canConvert={allFiles.length > 0}
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

      {primaryFile && (
        <div className="space-y-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWatermarkType("text")}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                watermarkType === "text"
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
              }`}
            >
              Text Watermark
            </button>
            <button
              type="button"
              onClick={() => setWatermarkType("image")}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                watermarkType === "image"
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
              }`}
            >
              Image / Logo Watermark
            </button>
          </div>

          {watermarkType === "text" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1 sm:col-span-3">
                <label htmlFor="wm-text" className="text-[11px] font-bold text-text-secondary">
                  Watermark text
                </label>
                <input
                  id="wm-text"
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="© Your Brand"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="wm-font-size" className="text-[11px] font-bold text-text-secondary">
                  Font size: {fontSize}px
                </label>
                <input
                  id="wm-font-size"
                  type="range"
                  min={12}
                  max={96}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="wm-color" className="text-[11px] font-bold text-text-secondary">
                  Color
                </label>
                <input
                  id="wm-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-border"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <label htmlFor="wm-image" className="text-[11px] font-bold text-text-secondary">
                Watermark / logo image
              </label>
              <input
                id="wm-image"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={(e) => setWatermarkImageFile(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-bold text-text-secondary">Position</p>
            <div className="grid w-40 grid-cols-3 gap-1.5 mx-auto sm:mx-0">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={`Position ${p}`}
                  onClick={() => setPosition(p)}
                  className={`h-10 rounded-lg border transition ${
                    position === p ? "bg-brand border-brand" : "bg-white border-border hover:border-brand"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="wm-opacity" className="text-[11px] font-bold text-text-secondary">
              Opacity: {opacity}%
            </label>
            <input
              id="wm-opacity"
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-text-secondary">
                Add more images to apply this watermark to a whole batch (ZIP download)
              </p>
              <label className="shrink-0 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-brand hover:bg-red-50">
                + Add files
                <input
                  ref={extraInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  className="hidden"
                  onChange={(e) => addExtraFiles(e.target.files)}
                />
              </label>
            </div>
            {extraFiles.length > 0 && (
              <ul className="space-y-1.5">
                {extraFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-1.5 text-xs text-text-secondary"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => removeExtraFile(i)}
                      className="shrink-0 text-text-secondary hover:text-brand"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </ConversionPageLayout>
  );
}
