"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import mammoth from "mammoth";
import jsPDF from "jspdf";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function WordToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Convert DOCX to raw text using mammoth
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;

      // Generate a multi-page PDF
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = doc.internal.pageSize.getHeight();
      const lineHeight = 16;
      doc.setFontSize(11);

      const paragraphs = text.split("\n");
      let cursorY = margin;

      paragraphs.forEach((p) => {
        const lines = doc.splitTextToSize(p || " ", pageWidth);
        lines.forEach((line: string) => {
          if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
          }
          doc.text(line, margin, cursorY);
          cursorY += lineHeight;
        });
      });

      doc.save(`${file.name.replace(".docx", "").replace(".doc", "")}.pdf`);
    } catch (error) {
      console.error("Error converting Word to PDF:", error);
      alert("Failed to convert the document. Ensure it is a valid .docx file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Word to PDF"
      description="Make DOC and DOCX files easy to read by converting them to PDF."
      icon={FileText}
      iconClassName="bg-[#e8f0fe] text-[#2b579a]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
          accept={{
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
            "application/msword": [".doc"]
          }}
          title="Select Word file"
          description="or drop DOCX here (max 1 file)"
          maxFiles={1}
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#2b579a] hover:bg-[#1a365d] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
