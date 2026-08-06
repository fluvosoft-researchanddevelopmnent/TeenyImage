"use client";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        
        let image;
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
            image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === "image/png") {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else {
            continue; // Skip unsupported
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `images-converted.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting JPG to PDF:", error);
      alert("Failed to convert images. Ensure they are valid JPG or PNG files.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="JPG to PDF"
      description="Convert JPG or PNG images to PDF in seconds."
      icon={ImagePlus}
      iconClassName="bg-[#fff8e6] text-[#f39c12]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={setFiles}
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
          title="Select Images"
          description="or drop JPG/PNG files here"
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#f39c12] hover:bg-[#d68910] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
