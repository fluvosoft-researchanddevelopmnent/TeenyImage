"use client";

import React from "react";
import { Sheet } from "lucide-react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { ToolWorkspaceLayout } from "@/components/tools/ToolWorkspaceLayout";

export default function ExcelToPdfPage() {
  return (
    <ToolWorkspaceLayout
      title="Convert Excel (XLSX) to PDF"
      description="Turn XLSX and XLS spreadsheets into easily readable PDF tables."
      category="Convert PDF"
      icon={Sheet}
      actionButtonText="Convert Excel to PDF"
      acceptedFileTypes=".xlsx,.xls,.csv"
      onExecute={async (files) => {
        const arrayBuffer = await files[0].arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const csvText = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);

        const pdf = new jsPDF();
        const splitText = pdf.splitTextToSize(csvText || "Spreadsheet Data", 180);
        pdf.text(splitText, 15, 20);

        const blob = pdf.output("blob");
        return {
          blob,
          fileName: files[0].name.replace(/\.xlsx?$/i, ".pdf"),
        };
      }}
    />
  );
}
