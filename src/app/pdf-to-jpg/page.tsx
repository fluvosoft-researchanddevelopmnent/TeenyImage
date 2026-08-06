"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState, useRef } from "react";
import { Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function PdfToJpgPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleConvert = async () => {
    if (files.length === 0 || !canvasRef.current) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Good quality scale
        
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext("2d");
        if (!context) continue;

        await page.render({ canvasContext: context, viewport } as any).promise;
        
        // Convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
        });

        if (blob) {
            zip.file(`page-${i}.jpg`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting PDF to JPG:", error);
      alert("Failed to convert the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to JPG"
      description="Convert each PDF page into a JPG image instantly in your browser."
      icon={ImageIcon}
      iconClassName="bg-[#fff8e6] text-[#f39c12]"
    >
      <div className="flex flex-col items-center space-y-8">
        <canvas ref={canvasRef} className="hidden" />
        
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
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#f39c12] hover:bg-[#d68910] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to JPG"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
