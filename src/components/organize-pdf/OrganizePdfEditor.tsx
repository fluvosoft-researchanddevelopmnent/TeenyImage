"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  FilePlus,
  RotateCw,
  Trash2,
} from "lucide-react";

import {
  buildOrganizedPdf,
  createPageId,
  type OrganizedPage,
} from "@/lib/pdf/organizePdf";

type Props = {
  file: File;
  onClose: () => void;
  onSaved: (blob: Blob, fileName: string) => void;
};

type Thumb = {
  id: string;
  url: string | null;
};

export function OrganizePdfEditor({ file, onClose, onSaved }: Props) {
  const [mounted, setMounted] = useState(false);
  const [pages, setPages] = useState<OrganizedPage[]>([]);
  const [thumbs, setThumbs] = useState<Thumb[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const sourceBytesRef = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bytes = await file.arrayBuffer();
        sourceBytesRef.current = bytes.slice(0);

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
        if (cancelled) return;

        const nextPages: OrganizedPage[] = [];
        const nextThumbs: Thumb[] = [];

        for (let i = 1; i <= doc.numPages; i++) {
          const id = createPageId();
          nextPages.push({ id, sourceIndex: i - 1, rotation: 0 });

          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 0.28 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext("2d");
          let url: string | null = null;
          if (ctx) {
            await page
              .render({ canvasContext: ctx, canvas, viewport } as never)
              .promise;
            url = canvas.toDataURL("image/jpeg", 0.75);
          }
          nextThumbs.push({ id, url });
        }

        if (!cancelled) {
          setPages(nextPages);
          setThumbs(nextThumbs);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not open this PDF. Try another file.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const thumbMap = useMemo(() => {
    const map = new Map<string, string | null>();
    thumbs.forEach((t) => map.set(t.id, t.url));
    return map;
  }, [thumbs]);

  const move = (id: string, dir: -1 | 1) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const rotate = (id: string) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, rotation: ((p.rotation + 90) % 360) as OrganizedPage["rotation"] }
          : p
      )
    );
  };

  const remove = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setThumbs((prev) => prev.filter((t) => t.id !== id));
  };

  const addBlank = () => {
    const id = createPageId();
    setPages((prev) => [
      ...prev,
      { id, sourceIndex: null, rotation: 0, blankWidth: 612, blankHeight: 792 },
    ]);
    setThumbs((prev) => [...prev, { id, url: null }]);
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    setPages((prev) => {
      const from = prev.findIndex((p) => p.id === dragId);
      const to = prev.findIndex((p) => p.id === targetId);
      if (from < 0 || to < 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
    setDragId(null);
  };

  const handleSave = async () => {
    if (!sourceBytesRef.current) return;
    setIsSaving(true);
    setError(null);
    try {
      const blob = await buildOrganizedPdf(sourceBytesRef.current, pages);
      const outName = file.name.replace(/\.pdf$/i, "") + "_organized.pdf";
      onSaved(blob, outName);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to save PDF.");
    } finally {
      setIsSaving(false);
    }
  };

  const ui = (
    <div
      className="fixed inset-0 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#f3f2f0]"
      style={{ zIndex: 1400 }}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-white px-3 py-2.5 shadow-sm sm:gap-3 sm:px-4 sm:py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-brand">Organize PDF</p>
          <span className="text-xs text-text-secondary">
            {pages.length} page{pages.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={addBlank}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-background sm:flex-none"
          >
            <FilePlus size={14} /> Blank page
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-background"
          >
            Close
          </button>
          <button
            type="button"
            disabled={isSaving || isLoading || pages.length === 0}
            onClick={handleSave}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-60 sm:flex-none"
          >
            {isSaving ? "Saving…" : "Save PDF"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        {isLoading && (
          <p className="text-center text-sm text-text-secondary">Loading pages…</p>
        )}
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-brand">
            {error}
          </p>
        )}
        {!isLoading && (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
            {pages.map((page, index) => {
              const url = thumbMap.get(page.id);
              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => setDragId(page.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(page.id)}
                  className={`rounded-xl border bg-white p-1.5 shadow-sm transition sm:p-2 ${
                    dragId === page.id ? "border-brand opacity-70" : "border-border"
                  }`}
                >
                  <div className="relative mb-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg bg-[#eceae7]">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`Page ${index + 1}`}
                        className="max-h-full max-w-full object-contain"
                        style={{ transform: `rotate(${page.rotation}deg)` }}
                        draggable={false}
                      />
                    ) : (
                      <span className="text-xs font-semibold text-text-secondary">Blank</span>
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-0.5">
                      <IconBtn title="Move up" onClick={() => move(page.id, -1)}>
                        <ArrowUp size={14} />
                      </IconBtn>
                      <IconBtn title="Move down" onClick={() => move(page.id, 1)}>
                        <ArrowDown size={14} />
                      </IconBtn>
                      <IconBtn title="Rotate" onClick={() => rotate(page.id)}>
                        <RotateCw size={14} />
                      </IconBtn>
                    </div>
                    <IconBtn title="Delete" danger onClick={() => remove(page.id)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(ui, document.body);
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md p-1.5 transition hover:bg-background ${
        danger ? "text-brand" : "text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}
