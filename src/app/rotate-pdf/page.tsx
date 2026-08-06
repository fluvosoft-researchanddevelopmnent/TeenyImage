"use client";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function RotatePdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(90);

  const handleRotate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rotated-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert("Failed to rotate the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Rotate your PDFs the way you need them."
      icon={RotateCw}
      iconClassName="bg-[#fde8ea] text-[#e5322d]"
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
            <select
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e5322d] focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
            >
              <option value={90}>Rotate 90° Clockwise</option>
              <option value={180}>Rotate 180°</option>
              <option value={270}>Rotate 90° Counter-Clockwise</option>
            </select>
            
            <Button
              size="large"
              onClick={handleRotate}
              disabled={isProcessing}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#e5322d] hover:bg-[#c0392b] text-white"
            >
              {isProcessing ? "Rotating..." : "Rotate PDF"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
