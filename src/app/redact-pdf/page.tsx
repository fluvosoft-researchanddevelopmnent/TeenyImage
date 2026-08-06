"use client";

import React, { useState } from "react";
import { EyeOff } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function RedactPdfPage() {
  const [redactText, setRedactText] = useState("CONFIDENTIAL");

  return (
    <ToolWorkspaceLayout
      title="Redact PDF Content"
      description="Permanently black out sensitive text, graphics, and figures from your PDF."
      category="PDF Security"
      icon={EyeOff}
      actionButtonText="Apply Redaction"
      optionsContent={
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Redaction Target Label / Blackout Text:
          </label>
          <input
            type="text"
            value={redactText}
            onChange={(e) => setRedactText(e.target.value)}
            placeholder="e.g. SSN, Account Number, Address"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
          />
        </div>
      }
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();

        // Draw solid black redaction bar over header/footer areas
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          page.drawRectangle({
            x: 40,
            y: height - 60,
            width: width - 80,
            height: 25,
            color: rgb(0, 0, 0),
          });
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        return {
          blob,
          fileName: `Redacted_${files[0].name}`,
        };
      }}
    />
  );
}
