"use client";
import { useState } from "react";
import { Crop } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function CropPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropAmount, setCropAmount] = useState(20);

  const handleCrop = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // Crop by adjusting the CropBox (Left, Bottom, Right, Top)
        page.setCropBox(cropAmount, cropAmount, width - cropAmount * 2, height - cropAmount * 2);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cropped-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error cropping PDF:", error);
      alert("Failed to crop the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Crop PDF"
      description="Crop margins of PDF documents."
      icon={Crop}
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
          <div className="w-full max-w-md space-y-4">
            <div className="space-y-2 text-center">
                <label className="text-sm font-medium text-gray-700">Crop Amount (px from all sides): {cropAmount}px</label>
                <input
                type="range"
                min="0"
                max="200"
                value={cropAmount}
                onChange={(e) => setCropAmount(Number(e.target.value))}
                className="w-full"
                />
            </div>
            
            <Button
              size="large"
              onClick={handleCrop}
              disabled={isProcessing}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
            >
              {isProcessing ? "Cropping..." : "Crop PDF"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
