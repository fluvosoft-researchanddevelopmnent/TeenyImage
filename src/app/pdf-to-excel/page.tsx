"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { Sheet } from "lucide-react";
import * as XLSX from "xlsx";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function PdfToExcelPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const allRows: string[][] = [];

      // Extract text from all pages and split into rows
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // This is a very naive approach to tabulate data.
        let currentRowY = -1;
        let currentRow: string[] = [];

        textContent.items.forEach((item: any) => {
          // If Y changes significantly, assume it's a new row
          if (currentRowY === -1 || Math.abs(item.transform[5] - currentRowY) > 5) {
             if (currentRow.length > 0) {
                 allRows.push(currentRow);
             }
             currentRow = [];
             currentRowY = item.transform[5];
          }
          currentRow.push(item.str);
        });
        
        if (currentRow.length > 0) {
            allRows.push(currentRow);
        }
      }

      const worksheet = XLSX.utils.aoa_to_sheet(allRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, `${file.name.replace(".pdf", "")}.xlsx`);

    } catch (error) {
      console.error("Error converting PDF to Excel:", error);
      alert("Failed to convert the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Excel"
      description="Pull data straight from PDFs into Excel spreadsheets in a few short seconds."
      icon={Sheet}
      iconClassName="bg-[#e8f7ef] text-[#217346]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
          accept={{ "application/pdf": [".pdf"] }}
          title="Select PDF file"
          description="or drop PDF here (max 1 file)"
          maxFiles={1}
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#217346] hover:bg-[#164c2e] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to Excel"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
