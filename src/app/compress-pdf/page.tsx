"use client";

import React, { useState } from "react";
import { Minimize2 } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { compressPdfFile } from "@/lib/pdf/pdfEngine";

export default function CompressPdfPage() {
  const [compressionLevel, setCompressionLevel] = useState<"extreme" | "recommended" | "light">("recommended");

  return (
    <ToolWorkspaceLayout
      title="Compress PDF File"
      description="Reduce PDF file size while preserving document quality and formatting."
      category="Optimize PDF"
      icon={Minimize2}
      actionButtonText="Compress PDF Size"
      optionsContent={
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Compression Quality Level:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "extreme", label: "Extreme", sub: "Max Compression, Lower Quality" },
              { id: "recommended", label: "Recommended", sub: "Good Quality, High Compression" },
              { id: "light", label: "Less Compression", sub: "High Quality, Low Compression" },
            ].map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => setCompressionLevel(level.id as any)}
                className={`p-3 rounded-xl border text-left transition ${
                  compressionLevel === level.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                <p className="text-xs font-bold">{level.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{level.sub}</p>
              </button>
            ))}
          </div>
        </div>
      }
      onExecute={async (files) => {
        const blob = await compressPdfFile(files[0]);
        return {
          blob,
          fileName: `Compressed_${files[0].name}`,
        };
      }}
    />
  );
}
