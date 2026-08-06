"use client";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function RepairPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRepair = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Best effort repair: Loading and re-saving the document allows pdf-lib
      // to rebuild the cross-reference tables and headers.
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `repaired-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error repairing PDF:", error);
      alert("Failed to repair the PDF. The file may be too severely corrupted to fix in the browser.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Repair PDF"
      description="Repair a damaged PDF and recover data from corrupt PDF."
      icon={Wrench}
      iconClassName="bg-[#e8f7ef] text-[#217346]"
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
            onClick={handleRepair}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#217346] hover:bg-[#164c2e] text-white"
          >
            {isProcessing ? "Repairing..." : "Repair PDF"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
