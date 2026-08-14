"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState, useRef } from "react";
import { SearchCode } from "lucide-react";
import Tesseract from "tesseract.js";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function OcrPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleOcr = async () => {
    if (files.length === 0 || !canvasRef.current) return;
    setIsProcessing(true);
    setProgress("Loading PDF...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const context = canvas.getContext("2d");
        if (!context) continue;

        await page.render({ canvasContext: context, viewport } as any).promise;
        
        const imageDataUrl = canvas.toDataURL("image/png");

        setProgress(`Running OCR on page ${i}... (This may take a minute)`);
        const result = await Tesseract.recognize(imageDataUrl, "eng", {
            logger: m => {
                if (m.status === "recognizing text") {
                    setProgress(`Running OCR on page ${i}: ${Math.round(m.progress * 100)}%`);
                }
            }
        });
        
        allText += `--- Page ${i} ---\n${result.data.text}\n\n`;
      }

      // Download the extracted text
      const blob = new Blob([allText as any], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ocr-${file.name.replace(".pdf", "")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error performing OCR:", error);
      alert("Failed to perform OCR on the document.");
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  return (
    <ToolLayout
      title="OCR PDF"
      description="Convert scanned PDFs into searchable text documents using OCR."
      icon={SearchCode}
      iconClassName="bg-[#f3e8ff] text-[#9b59b6]"
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
          <div className="w-full max-w-md text-center space-y-4">
              <Button
                size="large"
                onClick={handleOcr}
                disabled={isProcessing}
                className="w-full text-lg px-12 py-6 rounded-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white"
              >
                {isProcessing ? "Processing..." : "Start OCR"}
              </Button>

              {progress && (
                  <p className="text-sm text-gray-600 font-medium animate-pulse">{progress}</p>
              )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
