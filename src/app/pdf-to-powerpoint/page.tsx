"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { Presentation } from "lucide-react";
import pptxgen from "pptxgenjs";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function PdfToPowerPointPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      
      const pdfjsLib = await getPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const pres = new pptxgen();

      // Extract text from all pages and add as slides
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
          
        const slide = pres.addSlide();
        slide.addText(pageText, { x: 0.5, y: 0.5, w: "90%", h: "90%", fontSize: 14 });
      }

      await pres.writeFile({ fileName: `${file.name.replace(".pdf", "")}.pptx` });

    } catch (error) {
      console.error("Error converting PDF to PPTX:", error);
      alert("Failed to convert the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to PowerPoint"
      description="Turn your PDF files into easy to edit PPTX slideshows."
      icon={Presentation}
      iconClassName="bg-[#fff0e6] text-[#d24726]"
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
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#d24726] hover:bg-[#a1351b] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PowerPoint"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
