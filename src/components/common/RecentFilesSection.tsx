"use client";

import React, { useState } from "react";
import { Clock, FileText, Search, Trash2, Download } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function RecentFilesSection() {
  const { recentFiles, clearRecentFiles } = useApp();
  const [filterQuery, setFilterQuery] = useState("");

  if (recentFiles.length === 0) return null;

  const filtered = recentFiles.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    f.toolUsed.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section className="py-8 bg-slate-50/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#e5322d]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Recently Processed Files
            </h2>
            <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {recentFiles.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search recent files..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              onClick={clearRecentFiles}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              title="Clear history"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow transition"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {file.toolUsed} • {file.processedAt}
                  </p>
                </div>
              </div>

              {file.downloadUrl && (
                <a
                  href={file.downloadUrl}
                  download={file.name}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition"
                  title="Download File"
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
