"use client";

import React, { useState } from "react";
import { Clock, FileText, Search, Trash2, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Container } from "@/components/layout/Container";

export function RecentFilesSection() {
  const { recentFiles, clearRecentFiles } = useApp();
  const [filterQuery, setFilterQuery] = useState("");

  if (recentFiles.length === 0) return null;

  const filtered = recentFiles.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    f.toolUsed.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section className="border-y border-border bg-background py-8">
      <Container>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Clock size={18} className="shrink-0 text-brand" />
            <h2 className="truncate text-base font-bold text-text-primary sm:text-lg">
              Recently Processed Files
            </h2>
            <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-brand">
              {recentFiles.length}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
              <input
                type="text"
                placeholder="Search recent files..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-surface py-1.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <button
              onClick={clearRecentFiles}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-red-50 hover:text-brand"
              title="Clear history"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition hover:shadow"
            >
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-brand">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-text-primary">
                    {file.name}
                  </p>
                  <p className="truncate text-[11px] text-text-secondary/60">
                    {file.toolUsed} • {file.processedAt}
                  </p>
                </div>
              </div>

              {file.downloadUrl && (
                <a
                  href={file.downloadUrl}
                  download={file.name}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-brand transition hover:bg-brand hover:text-white"
                  title="Download File"
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
