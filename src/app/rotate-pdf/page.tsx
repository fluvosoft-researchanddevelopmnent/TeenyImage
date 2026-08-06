"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { rotatePdfFile } from "@/lib/pdf/pdfEngine";

export default function RotatePdfPage() {
  const [angle, setAngle] = useState<number>(90);

  return (
    <ToolWorkspaceLayout
      title="Rotate PDF Pages"
      description="Rotate your PDF pages clockwise or counter-clockwise (90°, 180°, 270°)."
      category="Organize PDF"
      icon={RotateCw}
      actionButtonText="Rotate PDF Document"
      optionsContent={
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Rotation Angle:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setAngle(deg)}
                className={`py-3 rounded-xl border text-xs font-bold transition ${
                  angle === deg
                    ? "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-600"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                Rotate {deg}° CW
              </button>
            ))}
          </div>
        </div>
      }
      onExecute={async (files) => {
        const blob = await rotatePdfFile(files[0], angle);
        return {
          blob,
          fileName: `Rotated_${angle}deg_${files[0].name}`,
        };
      }}
    />
  );
}
