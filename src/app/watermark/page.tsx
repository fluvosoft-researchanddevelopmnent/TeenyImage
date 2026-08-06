"use client";
import { useState } from "react";
import { Stamp } from "lucide-react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function WatermarkPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");

  const handleWatermark = async () => {
    if (files.length === 0 || !watermarkText) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 4,
          size: 60,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.3,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `watermarked-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error watermarking PDF:", error);
      alert("Failed to watermark the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Watermark PDF"
      description="Stamp text over your PDF in seconds."
      icon={Stamp}
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
            <input
              type="text"
              placeholder="Watermark text..."
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#9b59b6] focus:outline-none focus:ring-1 focus:ring-[#9b59b6]"
            />
            
            <Button
              size="large"
              onClick={handleWatermark}
              disabled={isProcessing || !watermarkText}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
            >
              {isProcessing ? "Adding..." : "Add Watermark"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
