"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { PDFDocument, rgb } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function RedactPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redactWord, setRedactWord] = useState("");

  const handleRedact = async () => {
    if (files.length === 0 || !redactWord) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // We use pdfjs-dist to find the word coordinates
      const pdfjsLib = await getPdfJs();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
      
      // And pdf-lib to draw the rectangles
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (let i = 1; i <= pdfJsDoc.numPages; i++) {
        const page = await pdfJsDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        const pdfLibPage = pages[i - 1];

        textContent.items.forEach((item: any) => {
            if (item.str.toLowerCase().includes(redactWord.toLowerCase())) {
                // PDF coordinates: transform[4] is X, transform[5] is Y.
                // We draw a visual block. Note: True redaction removes text streams, this is visual only.
                pdfLibPage.drawRectangle({
                    x: item.transform[4],
                    y: item.transform[5] - 2, // slight offset for baseline
                    width: item.width,
                    height: item.height || 12,
                    color: rgb(0, 0, 0),
                });
            }
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `redacted-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error redacting PDF:", error);
      alert("Failed to redact the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Redact PDF"
      description="Visually redact text to remove sensitive information."
      icon={EyeOff}
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
            <input
              type="text"
              placeholder="Word to redact..."
              value={redactWord}
              onChange={(e) => setRedactWord(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#e5322d] focus:outline-none focus:ring-1 focus:ring-[#e5322d]"
            />
            <p className="text-xs text-gray-500 text-center">Note: This draws a visual block over the text. It does not scrub the underlying raw file stream.</p>
            
            <Button
              size="large"
              onClick={handleRedact}
              disabled={isProcessing || !redactWord}
              className="w-full text-lg px-12 py-6 rounded-full bg-[#e5322d] hover:bg-[#c0392b] text-white"
            >
              {isProcessing ? "Redacting..." : "Redact PDF"}
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
