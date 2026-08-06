"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function RepairPdfPage() {
  return (
    <ToolWorkspaceLayout
      title="Repair Damaged PDF"
      description="Recover content from corrupted, unreadable, or damaged PDF documents."
      category="Optimize PDF"
      icon={Wrench}
      actionButtonText="Repair PDF File"
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
        return {
          blob,
          fileName: `Repaired_${files[0].name}`,
        };
      }}
    />
  );
}
