"use client";

import React from "react";
import { ImagePlus } from "lucide-react";
import { jsPDF } from "jspdf";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function JpgToPdfPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert JPG/PNG to PDF"
      description="Convert images (JPG, PNG, WEBP) to PDF in seconds. Easily adjust margins and alignment."
      category="Other to PDF"
      icon={ImagePlus}
      actionButtonText="Convert Images to PDF"
      acceptedFileTypes="image/*"
      allowMultiple={true}
      onExecute={async (files) => {
        const pdf = new jsPDF("portrait", "px", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < files.length; i++) {
          if (i > 0) pdf.addPage();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(files[i]);
          });

          pdf.addImage(dataUrl, "JPEG", 20, 20, pdfWidth - 40, pdfHeight - 40);
        }

        const blob = pdf.output("blob");
        return {
          blob,
          fileName: `Images_Converted_${Date.now()}.pdf`,
        };
      }}
    />
  );
}
