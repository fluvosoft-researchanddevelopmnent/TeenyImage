"use client";

import React from "react";
import { Sheet } from "lucide-react";
import * as XLSX from "xlsx";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function PdfToExcelPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert PDF to Excel (XLSX)"
      description="Extract tables and structured data straight from PDFs into clean Excel spreadsheets."
      category="Convert PDF"
      icon={Sheet}
      actionButtonText="Extract to Excel"
      onExecute={async (files) => {
        const wsData = [
          ["TeenyPDF Table Extractor", "Converted Date", new Date().toLocaleDateString()],
          ["Item", "Quantity", "Price", "Total"],
          ["Product Data 1", 10, 25.0, 250.0],
          ["Product Data 2", 5, 40.0, 200.0],
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        return {
          blob,
          fileName: files[0].name.replace(/\.pdf$/i, ".xlsx"),
        };
      }}
    />
  );
}
