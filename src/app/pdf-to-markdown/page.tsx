"use client";
import { getPdfJs } from "@/lib/pdfjs";

import { useState } from "react";
import { FileCode2 } from "lucide-react";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";



export default function PdfToMarkdownPage() {
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
      
      let markdownText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lastY = 0;
          let currentLine = "";

          textContent.items.forEach((item: any) => {
              const fontSize = item.transform[0]; // approximate font size from scale
              const y = item.transform[5];
              
              // Handle line breaks
              if (lastY !== 0 && Math.abs(lastY - y) > fontSize * 1.2) {
                  markdownText += currentLine + "\\n\\n";
                  currentLine = "";
              }
              
              // Very basic heuristic for headers based on font size
              let prefix = "";
              if (currentLine === "" && fontSize > 20) prefix = "# ";
              else if (currentLine === "" && fontSize > 16) prefix = "## ";
              else if (currentLine === "" && fontSize > 14) prefix = "### ";

              currentLine += prefix + item.str + " ";
              lastY = y;
          });
          
          markdownText += currentLine + "\\n\\n---\\n\\n"; // Page break
      }

      // Download as Markdown
      const blob = new Blob([markdownText as any], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.replace(".pdf", "")}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error converting PDF to Markdown:", error);
      alert("Failed to convert the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Markdown"
      description="Easily turn PDFs into Markdown files. Perfect for notes, docs, and LLMs."
      icon={FileCode2}
      iconClassName="bg-[#e8f0fe] text-[#3498db]"
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
            className="w-full max-w-md text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to Markdown"}
          </Button>
        )}

      </div>
    </ToolLayout>
  );
}
