"use client";
import { useState, useRef } from "react";
import { Globe } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/Button";

export default function HtmlToPdfPage() {
  const [htmlContent, setHtmlContent] = useState("<h1>Hello World</h1><p>Paste your HTML here.</p>");
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleConvert = async () => {
    if (!htmlContent || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const element = containerRef.current;
      
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      doc.save(`html-converted.pdf`);
    } catch (error) {
      console.error("Error converting HTML to PDF:", error);
      alert("Failed to convert the HTML.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="HTML to PDF"
      description="Convert raw HTML code to PDF."
      icon={Globe}
      iconClassName="bg-[#e8f0fe] text-[#3498db]"
    >
      <div className="flex flex-col items-center space-y-8">
        <div className="w-full space-y-4">
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="h-64 w-full rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-[#3498db] focus:outline-none focus:ring-1 focus:ring-[#3498db]"
            placeholder="Paste raw HTML here..."
          />
          
          <Button
            size="large"
            onClick={handleConvert}
            disabled={isProcessing || !htmlContent}
            className="w-full text-lg px-12 py-6 rounded-full bg-[#3498db] hover:bg-[#2980b9] text-white"
          >
            {isProcessing ? "Converting..." : "Convert HTML to PDF"}
          </Button>
        </div>

        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-500">Live Preview</h3>
          {/* Hidden container just for html2canvas rendering */}
          <div className="relative">
             <div 
               ref={containerRef}
               className="prose max-w-none bg-white p-4"
               dangerouslySetInnerHTML={{ __html: htmlContent }} 
             />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
