"use client";
import { useState } from "react";
import { Sheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function ExcelToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("Excel file contains no sheets.");
      }

      const doc = new jsPDF({ orientation: "landscape" });
      let addedSheetCount = 0;

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

        if (jsonData && jsonData.length > 0) {
          if (addedSheetCount > 0) {
            doc.addPage();
          }
          doc.setFontSize(14);
          doc.text(sheetName, 14, 15);

          autoTable(doc, {
            startY: 22,
            head: [jsonData[0] || []],
            body: jsonData.slice(1),
            theme: "grid",
            styles: { fontSize: 9 },
          });
          addedSheetCount++;
        }
      });

      if (addedSheetCount === 0) {
        throw new Error("All Excel sheets are empty.");
      }

      doc.save(`${file.name.replace(".xlsx", "").replace(".xls", "")}.pdf`);
    } catch (error) {
      console.error("Error converting Excel to PDF:", error);
      alert("Failed to convert the document. Ensure it is a valid Excel file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Excel to PDF"
      description="Make EXCEL spreadsheets easy to read by converting them to PDF."
      icon={Sheet}
      iconClassName="bg-[#e8f7ef] text-[#217346]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
          accept={{
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"]
          }}
          title="Select Excel file"
          description="or drop XLSX here (max 1 file)"
          maxFiles={1}
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#217346] hover:bg-[#164c2e] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
