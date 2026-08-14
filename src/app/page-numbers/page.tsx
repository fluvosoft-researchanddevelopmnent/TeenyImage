"use client";
import { useState } from "react";
import { Hash } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function PageNumbersPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddPageNumbers = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const pageCount = pages.length;

      pages.forEach((page, index) => {
        const { width } = page.getSize();
        const text = `Page ${index + 1} of ${pageCount}`;
        
        // Very basic placement at bottom center
        page.drawText(text, {
          x: width / 2 - 30, // approximate centering
          y: 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `numbered-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error adding page numbers:", error);
      alert("Failed to add page numbers to the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Add Page Numbers"
      description="Add page numbers into PDFs with ease."
      icon={Hash}
      iconClassName="bg-[#f3e8ff] text-[#9b59b6]"
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
            onClick={handleAddPageNumbers}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
          >
            {isProcessing ? "Adding Numbers..." : "Add Page Numbers"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
