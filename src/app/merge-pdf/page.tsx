"use client";

import React from "react";
import { Merge } from "lucide-react";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";
import { mergePdfFiles } from "@/lib/pdf/pdfEngine";

export default function MergePdfPage() {
  return (
    <ToolWorkspaceLayout
      title="Merge PDF Files"
      description="Combine multiple PDF documents into a single ordered PDF file in seconds."
      category="Organize PDF"
      icon={Merge}
      actionButtonText="Merge PDF Documents"
      allowMultiple={true}
      onExecute={async (files) => {
        const blob = await mergePdfFiles(files);
        return {
          blob,
          fileName: `Merged_Document_${Date.now()}.pdf`,
        };
      }}
    />
  );
}
