"use client";
import { useState, useRef } from "react";
import { PenLine } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function SignPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const sigCanvas = useRef<any>(null);

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (files.length === 0 || sigCanvas.current?.isEmpty()) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the signature as a base64 png
      const sigDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const sigImage = await pdfDoc.embedPng(sigDataUrl);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Draw at the bottom of the first page
      firstPage.drawImage(sigImage, {
        x: 50,
        y: 50,
        width: 150,
        height: 50,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `signed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error signing PDF:", error);
      alert("Failed to sign the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Sign PDF"
      description="Draw your signature and stamp it onto a PDF document."
      icon={PenLine}
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
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-2">
               <p className="mb-2 text-center text-sm text-gray-500">Draw your signature below:</p>
               <SignatureCanvas 
                  ref={sigCanvas}
                  canvasProps={{ className: "w-full h-40 bg-gray-50 rounded-lg" }}
               />
            </div>
            
            <div className="flex space-x-4">
                <Button
                variant="outlined"
                onClick={clearSignature}
                className="w-full"
                >
                Clear
                </Button>
                <Button
                onClick={handleSign}
                disabled={isProcessing}
                className="w-full bg-[#e5322d] hover:bg-[#c0392b] text-white"
                >
                {isProcessing ? "Signing..." : "Sign PDF"}
                </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
