"use client";

import React, { useState } from "react";
import { Stamp } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { addWatermarkToPdf } from "@/lib/pdf/pdfEngine";

export default function WatermarkPage() {
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.4);

  return (
    <ToolWorkspaceLayout
      title="Add Watermark to PDF"
      description="Stamp text over your PDF pages with custom transparency, rotation, and typography."
      category="Edit PDF"
      icon={Stamp}
      actionButtonText="Apply Watermark"
      optionsContent={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Watermark Text:
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="e.g. DRAFT, CONFIDENTIAL, DO NOT COPY"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Opacity ({Math.round(opacity * 100)}%):
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      }
      onExecute={async (files) => {
        const blob = await addWatermarkToPdf(files[0], watermarkText, opacity);
        return {
          blob,
          fileName: `Watermarked_${files[0].name}`,
        };
      }}
    />
  );
}
