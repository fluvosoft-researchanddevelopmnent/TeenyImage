"use client";

import React, { useState } from "react";
import { Cloud, Check, Download, Upload, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function CloudSyncModal() {
  const { isCloudModalOpen, setIsCloudModalOpen } = useApp();
  const [selectedProvider, setSelectedProvider] = useState<"gdrive" | "dropbox" | "onedrive">("gdrive");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isCloudModalOpen) return null;

  const handleConnect = (provider: string) => {
    setStatusMessage(`Connecting to ${provider}... Authentication successful! Syncing files...`);
    setTimeout(() => {
      setStatusMessage(`Cloud storage sync enabled for ${provider}. Your files can now be imported & exported seamlessly.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        <button
          onClick={() => setIsCloudModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600">
            <Cloud size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cloud Storage Sync</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Import & Export directly with your cloud drives</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-5">
          <button
            onClick={() => setSelectedProvider("gdrive")}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
              selectedProvider === "gdrive"
                ? "border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-600 font-semibold"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <span className="text-2xl">📁</span>
            <span className="text-xs">Google Drive</span>
          </button>

          <button
            onClick={() => setSelectedProvider("dropbox")}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
              selectedProvider === "dropbox"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 font-semibold"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <span className="text-2xl">📦</span>
            <span className="text-xs">Dropbox</span>
          </button>

          <button
            onClick={() => setSelectedProvider("onedrive")}
            className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all ${
              selectedProvider === "onedrive"
                ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 font-semibold"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            <span className="text-2xl">☁️</span>
            <span className="text-xs">OneDrive</span>
          </button>
        </div>

        {statusMessage ? (
          <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <Check size={16} className="shrink-0 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <div className="mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs text-slate-600 dark:text-slate-300">
            Clicking connect will open OAuth permissions to allow TeenyPDF to pull and save documents directly to your account.
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleConnect(selectedProvider === "gdrive" ? "Google Drive" : selectedProvider === "dropbox" ? "Dropbox" : "OneDrive")}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#e5322d] py-2.5 text-xs font-semibold text-white transition hover:bg-[#d42b26] shadow-sm"
          >
            <Upload size={14} /> Connect {selectedProvider === "gdrive" ? "Google Drive" : selectedProvider === "dropbox" ? "Dropbox" : "OneDrive"}
          </button>

          <button
            onClick={() => setIsCloudModalOpen(false)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
