"use client";

import React, { useState } from "react";
import { Unlock } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function UnlockPdfPage() {
  const [password, setPassword] = useState("");

  return (
    <ToolWorkspaceLayout
      title="Unlock PDF Password"
      description="Remove PDF password protection and restrictions for unrestricted usage."
      category="PDF Security"
      icon={Unlock}
      actionButtonText="Unlock PDF Security"
      optionsContent={
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Current Password (if required):
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-red-500"
          />
        </div>
      }
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        return {
          blob,
          fileName: `Unlocked_${files[0].name}`,
        };
      }}
    />
  );
}
