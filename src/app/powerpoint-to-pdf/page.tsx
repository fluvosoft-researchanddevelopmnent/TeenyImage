"use client";
import { useState } from "react";
import { Presentation } from "lucide-react";
import JSZip from "jszip";
import jsPDF from "jspdf";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { FileUploader } from "@/components/ui/FileUploader";
import { Button } from "@/components/ui/Button";

export default function PowerPointToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Basic client-side PPTX parsing using JSZip to find slide text
      // Note: A true PPTX to PDF parser requires a backend. This just extracts slide text.
      const zip = new JSZip();
      const content = await zip.loadAsync(arrayBuffer);
      
      const doc = new jsPDF({ orientation: "landscape" });
      let slideIndex = 1;
      let hasSlides = false;

      // Iterate through potential slides
      while (true) {
        const slideFile = content.file(`ppt/slides/slide${slideIndex}.xml`);
        if (!slideFile) break;

        hasSlides = true;
        const slideXml = await slideFile.async("text");
        
        // Very basic XML tag stripping for text extraction
        const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g);
        const slideText = textMatches ? textMatches.map(t => t.replace(/<a:t>/, "").replace(/<\/a:t>/, "")).join(" ") : "Empty Slide";

        if (slideIndex > 1) {
            doc.addPage();
        }

        const splitText = doc.splitTextToSize(`Slide ${slideIndex}:\n\n${slideText}`, 270);
        doc.text(splitText, 15, 20);

        slideIndex++;
      }

      if (!hasSlides) {
          throw new Error("No slides found in the presentation.");
      }

      doc.save(`${file.name.replace(".pptx", "").replace(".ppt", "")}.pdf`);
    } catch (error) {
      console.error("Error converting PowerPoint to PDF:", error);
      alert("Failed to convert the document. Ensure it is a valid .pptx file.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PowerPoint to PDF"
      description="Make PPT and PPTX slideshows easy to view by converting them to PDF."
      icon={Presentation}
      iconClassName="bg-[#fff0e6] text-[#d24726]"
    >
      <div className="flex flex-col items-center space-y-8">
        <FileUploader
          files={files}
          onFilesChange={(newFiles) => setFiles(newFiles.slice(0, 1))}
          accept={{
            "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
            "application/vnd.ms-powerpoint": [".ppt"]
          }}
          title="Select PowerPoint file"
          description="or drop PPTX here (max 1 file)"
          maxFiles={1}
        />

        {files.length > 0 && (
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full max-w-md sm:w-auto text-lg px-12 py-6 rounded-full bg-[#d24726] hover:bg-[#a1351b] text-white"
          >
            {isProcessing ? "Converting..." : "Convert to PDF"}
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}
