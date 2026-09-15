"use client";

import React, { useEffect, useRef, useState } from "react";
import { RotateCw, RotateCcw, RefreshCw, ShieldCheck, X } from "lucide-react";
import { ConversionPageLayout } from "@/components/common";
import { rotateImage } from "@/lib/image/rotateImage";

type OrientationFilter = "all" | "landscape" | "portrait";

export default function RotateImagePage() {
  // Primary file drives the shared ConversionPageLayout's dropzone (single-file UI),
  // but users can add more files below for a batch/ZIP rotation.
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [angle, setAngle] = useState<number>(0);
  const [customAngle, setCustomAngle] = useState<string>("");
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>("all");

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

  const matchesOrientation = (file: File, width: number, height: number) => {
    if (orientationFilter === "landscape") return width >= height;
    if (orientationFilter === "portrait") return height > width;
    return true;
  };

  const handleConvert = async () => {
    if (allFiles.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (allFiles.length === 1) {
        const file = allFiles[0];
        const blob = await rotateImage(file, angle);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        const base = file.name.replace(/\.[^/.]+$/, "");
        const ext = file.name.split(".").pop() || "png";
        setResultName(`${base}_rotated.${ext}`);
      } else {
        // Lazy-load jszip only when a batch download is actually needed.
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        let includedCount = 0;

        for (const file of allFiles) {
          try {
            const dims = await getImageDimensions(file);
            if (!matchesOrientation(file, dims.width, dims.height)) continue;
            const blob = await rotateImage(file, angle);
            const base = file.name.replace(/\.[^/.]+$/, "");
            const ext = file.name.split(".").pop() || "png";
            zip.file(`${base}_rotated.${ext}`, blob);
            includedCount += 1;
          } catch {
            // Skip files that fail to load/rotate but keep processing the rest.
          }
        }

        if (includedCount === 0) {
          throw new Error("None of the selected files matched the chosen orientation filter.");
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        setResultName(`rotated_images_${Date.now()}.zip`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while rotating these images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPrimaryFile(null);
    setExtraFiles([]);
    setAngle(0);
    setCustomAngle("");
    setOrientationFilter("all");
  };

  const addExtraFiles = (files: FileList | null) => {
    if (!files) return;
    setExtraFiles((prev) => [...prev, ...Array.from(files)]);
    if (extraInputRef.current) extraInputRef.current.value = "";
  };

  const removeExtraFile = (index: number) => {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const quickButtons: { label: string; icon: React.ElementType; value: number }[] = [
    { label: "Rotate 90° CCW", icon: RotateCcw, value: -90 },
    { label: "Rotate 180°", icon: RefreshCw, value: 180 },
    { label: "Rotate 90° CW", icon: RotateCw, value: 90 },
  ];

  return (
    <ConversionPageLayout
      title="Rotate Image"
      description="Fix sideways or upside-down photos in one click, or dial in an exact custom angle. All rotation happens right in your browser."
      badge="Rotate Image Tool"
      icon={RotateCw}
      acceptTypes=".jpg,.jpeg,.png,.gif"
      inputId="rotate-image-input"
      actionLabel={allFiles.length > 1 ? "Rotate & Download ZIP" : "Rotate Image"}
      processingLabel="Rotating..."
      selectedFile={primaryFile}
      isProcessing={isProcessing}
      downloadUrl={downloadUrl}
      resultName={resultName}
      downloadLabel={allFiles.length > 1 ? "Download ZIP" : "Download Rotated Image"}
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
          <div className="grid grid-cols-3 gap-2">
            {quickButtons.map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setAngle(value);
                  setCustomAngle("");
                }}
                aria-label={label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-bold transition ${
                  angle === value
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="custom-angle" className="text-[11px] font-bold text-text-secondary">
              Custom angle (-360 to 360)
            </label>
            <input
              id="custom-angle"
              type="number"
              min={-360}
              max={360}
              value={customAngle}
              placeholder="e.g. 45"
              onChange={(e) => {
                const raw = e.target.value;
                setCustomAngle(raw);
                const parsed = parseFloat(raw);
                if (!Number.isNaN(parsed)) {
                  setAngle(Math.min(360, Math.max(-360, parsed)));
                }
              }}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Batch mode */}
          <div className="rounded-xl border border-dashed border-border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-text-secondary">
                Add more images to rotate the whole batch and download a ZIP
              </p>
              <label className="shrink-0 cursor-pointer rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold text-brand hover:bg-red-50">
                + Add files
                <input
                  ref={extraInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif"
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

            {allFiles.length > 1 && (
              <div>
                <p className="text-[11px] font-bold text-text-secondary mb-1.5">Filter by orientation</p>
                <div className="flex gap-2">
                  {(["all", "landscape", "portrait"] as OrientationFilter[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setOrientationFilter(f)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold border capitalize transition ${
                        orientationFilter === f
                          ? "bg-brand text-white border-brand"
                          : "bg-white text-text-secondary border-border hover:border-brand hover:text-brand"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ConversionPageLayout>
  );
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = url;
  });
}
