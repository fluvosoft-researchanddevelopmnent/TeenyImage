"use client";

import React, { useState } from "react";
import { Scissors } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { splitPdfFile } from "@/lib/pdf/pdfEngine";

export default function SplitPdfPage() {
  const [pageRange, setPageRange] = useState("1-3");

  return (
    <ToolWorkspaceLayout
      title="Split PDF File"
      description="Extract specific pages or page ranges (e.g. 1-3, 5) into a new independent PDF document."
      category="Organize PDF"
      icon={Scissors}
      actionButtonText="Split & Extract Pages"
      optionsContent={
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Specify Page Range or Page Numbers to Extract:
          </label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="e.g. 1-3, 5, 8-10"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            Example: "1-4" extracts pages 1 to 4. "2, 5, 7" extracts pages 2, 5, and 7.
          </p>
        </div>
      }
      onExecute={async (files) => {
        const blob = await splitPdfFile(files[0], pageRange);
        return {
          blob,
          fileName: `Split_Pages_${pageRange.replace(/\s+/g, "")}_${files[0].name}`,
        };
      }}
    />
  );
}
