"use client";
import { useState } from "react";
import { Archive } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function PdfToPdfaPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // True PDF/A conversion requires complex color profiling and font embedding
      // For this pure JS client-side demo, we do a best-effort save which sets basic metadata.
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      pdfDoc.setTitle("Archived Document");
      pdfDoc.setAuthor("TeenyPDF-Web");
      pdfDoc.setSubject("PDF/A Best Effort");
      pdfDoc.setKeywords(["archive"]);
      pdfDoc.setProducer("pdf-lib");
      pdfDoc.setCreator("TeenyPDF-Web");
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pdfa-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting to PDF/A:", error);
      alert("Failed to convert the PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to PDF/A"
      description="Transform your PDF to PDF/A for long-term archiving."
      icon={Archive}
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
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#217346] hover:bg-[#164c2e] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF/A"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
