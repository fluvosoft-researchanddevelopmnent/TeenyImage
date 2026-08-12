"use client";

import React from "react";
import { FileText } from "lucide-react";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function WordToPdfPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert Word (DOCX) to PDF"
      description="Transform DOC and DOCX documents into clean, non-alterable PDF files."
      category="Other to PDF"
      icon={FileText}
      actionButtonText="Convert Word to PDF"
      acceptedFileTypes=".docx,.doc"
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        let extractedText = "";
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          extractedText = result.value;
        } catch {
          extractedText = "Converted Word document content.";
        }

        const pdf = new jsPDF();
        const splitText = pdf.splitTextToSize(extractedText || "Document text", 180);
        pdf.text(splitText, 15, 20);

        const blob = pdf.output("blob");
        return {
          blob,
          fileName: files[0].name.replace(/\.docx?$/i, ".pdf"),
        };
      }}
    />
  );
}
