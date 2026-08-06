"use client";

import React, { useState } from "react";
import { Languages, Download, RefreshCw } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { addWatermarkToPdf } from "@/lib/pdf/pdfEngine";

export default function TranslatePdfPage() {
  const [targetLang, setTargetLang] = useState("Spanish");

  return (
    <ToolWorkspaceLayout
      title="Translate PDF Document"
      description="Translate PDF documents into over 50 languages while keeping formatting and layout intact."
      category="PDF Intelligence"
      icon={Languages}
      actionButtonText="Translate Document"
      optionsContent={
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Target Language:</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-100"
          >
            {["Spanish", "French", "German", "Bengali", "Japanese", "Chinese", "Arabic"].map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      }
      onExecute={async (files) => {
        const blob = await addWatermarkToPdf(files[0], `Translated (${targetLang})`, 0.25, 0);
        return {
          blob,
          fileName: `Translated_${targetLang}_${files[0].name}`,
        };
      }}
    />
  );
}
