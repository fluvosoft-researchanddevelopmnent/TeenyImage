"use client";

import React, { useState } from "react";
import { Crop } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function CropPdfPage() {
  const [marginCrop, setMarginCrop] = useState(20);

  return (
    <ToolWorkspaceLayout
      title="Crop PDF Margins"
      description="Crop unnecessary outer margins or trim document padding across all pages."
      category="Edit PDF"
      icon={Crop}
      actionButtonText="Apply Page Crop"
      optionsContent={
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Crop Margin Padding ({marginCrop}pt):
          </label>
          <input
            type="range"
            min="5"
            max="60"
            value={marginCrop}
            onChange={(e) => setMarginCrop(parseInt(e.target.value, 10))}
            className="w-full accent-purple-600"
          />
        </div>
      }
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
          const { x, y, width, height } = page.getCropBox();
          page.setCropBox(
            x + marginCrop,
            y + marginCrop,
            width - marginCrop * 2,
            height - marginCrop * 2
          );
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        return {
          blob,
          fileName: `Cropped_${files[0].name}`,
        };
      }}
    />
  );
}
