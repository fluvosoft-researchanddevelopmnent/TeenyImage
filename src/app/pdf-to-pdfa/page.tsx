"use client";

import React from "react";
import { Archive } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { convertToPdfA } from "@/lib/pdf/pdfEngine";

export default function PdfToPdfAPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert PDF to PDF/A"
      description="Transform standard PDFs into ISO 19005-1 compliant PDF/A documents for long-term digital archiving."
      category="Optimize PDF"
      icon={Archive}
      actionButtonText="Convert to PDF/A ISO Standard"
      onExecute={async (files) => {
        const blob = await convertToPdfA(files[0]);
        return {
          blob,
          fileName: `PDFA_Archival_${files[0].name}`,
        };
      }}
    />
  );
}
