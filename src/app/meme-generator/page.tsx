"use client";

import React, { useEffect, useRef, useState } from "react";
import { Laugh, ShieldCheck, Upload, Download, RefreshCw } from "lucide-react";

const FONT_OPTIONS = [
  { id: "impact", label: "Impact", family: "Impact, 'Arial Narrow Bold', sans-serif" },
  { id: "arial", label: "Arial", family: "Arial, Helvetica, sans-serif" },
  { id: "comic", label: "Comic Sans", family: "'Comic Sans MS', 'Comic Sans', cursive" },
] as const;

export default function MemeGeneratorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState<(typeof FONT_OPTIONS)[number]["id"]>("impact");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (file: File | null) => {
    setError(null);
    setSelectedFile(file);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgElRef.current = img;
      setImageSrc(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("This file could not be opened. Please choose a valid JPG, PNG, or GIF image.");
    };
    img.src = url;
  };

  // Redraw the canvas whenever anything relevant changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgElRef.current;
    if (!canvas || !img || !imageSrc) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const fontFamily = FONT_OPTIONS.find((f) => f.id === fontStyle)?.family ?? "Impact, sans-serif";
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.lineWidth = Math.max(2, fontSize / 12);
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = textColor;

    const drawMemeText = (text: string, y: number) => {
      if (!text) return;
      const x = canvas.width / 2;
      ctx.strokeText(text.toUpperCase(), x, y);
      ctx.fillText(text.toUpperCase(), x, y);
    };

    drawMemeText(topText, fontSize + 10);
    drawMemeText(bottomText, canvas.height - 20);
  }, [imageSrc, topText, bottomText, fontSize, textColor, fontStyle]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not generate the meme image. Please try again.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meme_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleReset = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setSelectedFile(null);
    setImageSrc(null);
    setTopText("");
    setBottomText("");
    setFontSize(48);
    setTextColor("#ffffff");
    setFontStyle("impact");
    setError(null);
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-background px-4 py-8 sm:px-6 sm:py-10 lg:px-8 max-w-4xl mx-auto w-full overflow-x-hidden">
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold mb-3 border bg-red-50 text-brand border-red-100 sm:px-3.5 sm:text-xs">
          <Laugh size={14} className="shrink-0" />
          <span className="truncate">Meme Generator</span>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary sm:text-3xl break-words">Meme Generator</h1>
        <p className="text-xs text-text-secondary mt-2 sm:text-sm">
          Add classic top/bottom captions to any image and download instantly — no upload, no watermark.
        </p>
      </div>

      <div className="bg-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-border shadow-xl space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[11px] font-semibold text-brand">
          <ShieldCheck size={14} className="shrink-0" />
          100% Client-Side Processing — Your files never leave your device
        </div>

        {error && (
          <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        {!imageSrc ? (
          <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-brand transition">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              id="meme-generator-input"
              className="hidden"
            />
            <label htmlFor="meme-generator-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-red-50 text-brand">
                <Upload size={24} />
              </div>
              <p className="text-sm font-bold text-text-primary">Click to select an image</p>
              <p className="text-xs text-text-secondary/60">JPG, PNG, or GIF accepted</p>
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-border bg-black/5">
              <canvas ref={canvasRef} className="h-auto w-full" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="top-text" className="text-[11px] font-bold text-text-secondary">
                  Top text
                </label>
                <input
                  id="top-text"
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="ONE DOES NOT SIMPLY"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="bottom-text" className="text-[11px] font-bold text-text-secondary">
                  Bottom text
                </label>
                <input
                  id="bottom-text"
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="WALK INTO MORDOR"
                  className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="font-size" className="text-[11px] font-bold text-text-secondary">
                  Font size: {fontSize}px
                </label>
                <input
                  id="font-size"
                  type="range"
                  min={20}
                  max={100}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="text-color" className="text-[11px] font-bold text-text-secondary">
                  Text color
                </label>
                <input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-9 w-full cursor-pointer rounded-lg border border-border"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="font-style" className="text-[11px] font-bold text-text-secondary">
                  Font style
                </label>
                <select
                  id="font-style"
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value as (typeof FONT_OPTIONS)[number]["id"])}
                  className="rounded-lg border border-border px-2 py-2 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-dark transition"
              >
                <Download size={17} />
                Download Meme
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-6 py-3.5 text-sm font-semibold text-text-secondary hover:bg-red-50 hover:text-brand transition"
              >
                <RefreshCw size={16} />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
