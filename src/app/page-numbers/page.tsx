"use client";

import React, { useState } from "react";
import { Hash } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { addPageNumbersToPdf } from "@/lib/pdf/pdfEngine";

export default function PageNumbersPage() {
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "top-right">("bottom-center");

  return (
    <ToolWorkspaceLayout
      title="Add Page Numbers"
      description="Insert custom page numbering into PDFs with exact position and clean typography."
      category="Edit PDF"
      icon={Hash}
      actionButtonText="Insert Page Numbers"
      optionsContent={
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Page Number Position:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "bottom-center", label: "Bottom Center" },
              { id: "bottom-right", label: "Bottom Right" },
              { id: "top-right", label: "Top Right" },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setPosition(pos.id as any)}
                className={`py-3 rounded-xl border text-xs font-bold transition ${
                  position === pos.id
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      }
      onExecute={async (files) => {
        const blob = await addPageNumbersToPdf(files[0], position);
        return {
          blob,
          fileName: `Numbered_${files[0].name}`,
        };
      }}
    />
  );
}
