"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Merge } from "lucide-react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      
      // Download logic
      const blob = new Blob([mergedPdfFile as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged-teenypdf.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine PDFs in the order you want with the easiest PDF merger available."
      icon={Merge}
      iconClassName="bg-[#fde8ea] text-[#e5322d]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          accept={{ "application/pdf": [".pdf"] }}
          title="Select PDF files"
          description="or drop PDFs here"
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full"
          >
            {isProcessing ? "Merging..." : "Merge PDF"}
          </Button>
        )}
        
        {files.length > 0 && files.length < 2 && (
          <p className="text-sm text-[#e5322d]">
            Please select at least 2 PDF files to merge.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
